// lib/resizeUtil.ts
// Resize gambar sebelum diproses. Ini langkah paling penting untuk performa
// di device entry-level — makin kecil resolusi, makin ringan komputasi Sobel & dilation.

const MAX_DIMENSION = 1200; // px, cukup untuk cetak coloring page ukuran A5-A3

/**
 * Load file gambar, resize kalau perlu, dan kembalikan ImageData siap diproses.
 */
export async function loadAndResizeImage(file: File): Promise<{ imageData: ImageData; canvas: HTMLCanvasElement }> {
  const img = await loadImageFromFile(file);

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context tidak tersedia');

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);

  return { imageData, canvas };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
