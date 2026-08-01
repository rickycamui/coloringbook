// lib/types.ts

export interface ProcessedImage {
  id: string;
  originalDataUrl: string;   // preview gambar asli (before)
  resultDataUrl: string | null; // hasil convert (after), null selama masih diproses
  width: number;             // dimensi hasil (setelah resize)
  height: number;
}
