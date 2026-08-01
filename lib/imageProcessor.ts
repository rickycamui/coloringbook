// lib/imageProcessor.ts
// Semua fungsi di sini bekerja langsung di atas ImageData (array pixel dari Canvas API).
// Tidak ada dependency eksternal — murni JS, ringan untuk device entry-level.

export interface ProcessOptions {
  threshold: number;   // 0-255, sensitivitas edge detection (slider "sensitivitas")
  thickness: number;   // radius kernel dilation, misal 1-5 (slider "ketebalan outline")
  minBlobSize: number; // ukuran minimum blob (px) yang dipertahankan saat cleanup noise
}

export const DEFAULT_OPTIONS: ProcessOptions = {
  threshold: 60,
  thickness: 2,
  minBlobSize: 4,
};

/**
 * Step 1 — Grayscale
 * Konversi RGB ke luminance grayscale menggunakan bobot standar.
 */
function toGrayscale(pixels: Uint8ClampedArray, width: number, height: number): Float32Array {
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < gray.length; i++, p += 4) {
    const r = pixels[p];
    const g = pixels[p + 1];
    const b = pixels[p + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

/**
 * Step 2 — Sobel edge detection
 * Menghitung gradien horizontal (Gx) dan vertikal (Gy) tiap pixel,
 * lalu magnitude = sqrt(Gx^2 + Gy^2). Border pixel diabaikan (diset 0).
 */
function sobelEdges(gray: Float32Array, width: number, height: number): Float32Array {
  const out = new Float32Array(width * height);

  const gxKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gyKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      let k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const val = gray[(y + dy) * width + (x + dx)];
          gx += val * gxKernel[k];
          gy += val * gyKernel[k];
          k++;
        }
      }
      out[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return out;
}

/**
 * Step 3 — Thresholding
 * Ubah magnitude edge jadi biner: true = garis (hitam), false = background (putih)
 */
function applyThreshold(edges: Float32Array, threshold: number): Uint8Array {
  const binary = new Uint8Array(edges.length);
  for (let i = 0; i < edges.length; i++) {
    binary[i] = edges[i] > threshold ? 1 : 0;
  }
  return binary;
}

/**
 * Step 4 — Dilation
 * "Menggemukkan" pixel hitam ke tetangga sekitarnya sejauh `radius` px.
 * Ini yang mengontrol ketebalan outline akhir.
 */
function dilate(binary: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius <= 0) return binary;

  const out = new Uint8Array(binary.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let found = false;
      for (let dy = -radius; dy <= radius && !found; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          if (binary[ny * width + nx] === 1) {
            found = true;
            break;
          }
        }
      }
      out[y * width + x] = found ? 1 : 0;
    }
  }
  return out;
}

/**
 * Step 5 — Cleanup noise (opsional)
 * Buang blob hitam yang ukurannya lebih kecil dari `minSize` pixel,
 * menggunakan flood-fill sederhana (4-connected) untuk menghitung ukuran tiap blob.
 */
function cleanupNoise(binary: Uint8Array, width: number, height: number, minSize: number): Uint8Array {
  if (minSize <= 1) return binary;

  const visited = new Uint8Array(binary.length);
  const out = new Uint8Array(binary);
  const stack: number[] = [];

  for (let start = 0; start < binary.length; start++) {
    if (binary[start] !== 1 || visited[start]) continue;

    // flood-fill mengumpulkan semua pixel dalam blob ini
    const blobPixels: number[] = [];
    stack.push(start);
    visited[start] = 1;

    while (stack.length > 0) {
      const idx = stack.pop()!;
      blobPixels.push(idx);
      const x = idx % width;
      const y = Math.floor(idx / width);

      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const nIdx = ny * width + nx;
        if (binary[nIdx] === 1 && !visited[nIdx]) {
          visited[nIdx] = 1;
          stack.push(nIdx);
        }
      }
    }

    // kalau blob terlalu kecil, hapus (jadikan putih/0)
    if (blobPixels.length < minSize) {
      for (const idx of blobPixels) out[idx] = 0;
    }
  }

  return out;
}

/**
 * Step 6 — Convert hasil biner ke ImageData final (background putih, outline hitam)
 */
function toImageData(binary: Uint8Array, width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, p = 0; i < binary.length; i++, p += 4) {
    const isEdge = binary[i] === 1;
    const value = isEdge ? 0 : 255; // hitam untuk edge, putih untuk background
    data[p] = value;
    data[p + 1] = value;
    data[p + 2] = value;
    data[p + 3] = 255;
  }
  return new ImageData(data, width, height);
}

/**
 * Fungsi utama — jalankan seluruh pipeline dari ImageData input sampai output.
 * Gunakan ini dari komponen React.
 */
export function processImage(input: ImageData, options: ProcessOptions = DEFAULT_OPTIONS): ImageData {
  const { width, height, data } = input;

  const gray = toGrayscale(data, width, height);
  const edges = sobelEdges(gray, width, height);
  let binary = applyThreshold(edges, options.threshold);
  binary = dilate(binary, width, height, options.thickness);
  binary = cleanupNoise(binary, width, height, options.minBlobSize);

  return toImageData(binary, width, height);
}
