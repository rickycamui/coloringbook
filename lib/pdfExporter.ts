// lib/pdfExporter.ts
// Susun satu atau banyak gambar hasil convert menjadi satu file PDF,
// dengan pilihan ukuran kertas standar untuk dicetak.

import { jsPDF } from 'jspdf';

export type PaperSize = 'a5' | 'a4' | 'a3';

// Ukuran kertas dalam mm (portrait)
const PAPER_SIZES_MM: Record<PaperSize, { width: number; height: number }> = {
  a5: { width: 148, height: 210 },
  a4: { width: 210, height: 297 },
  a3: { width: 297, height: 420 },
};

export interface ExportImage {
  dataUrl: string; // hasil canvas.toDataURL('image/png') per gambar
  width: number;   // dimensi asli pixel (untuk hitung aspect ratio)
  height: number;
}

/**
 * Gabungkan banyak gambar (hasil convert) jadi satu PDF, satu gambar per halaman,
 * dicentang di tengah kertas dengan margin, menjaga aspect ratio asli.
 */
export function exportImagesToPdf(images: ExportImage[], paperSize: PaperSize, marginMm = 10): jsPDF {
  const { width: pageWidth, height: pageHeight } = PAPER_SIZES_MM[paperSize];

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageWidth, pageHeight],
  });

  images.forEach((image, index) => {
    if (index > 0) doc.addPage([pageWidth, pageHeight], 'portrait');

    const maxW = pageWidth - marginMm * 2;
    const maxH = pageHeight - marginMm * 2;

    // Hitung ukuran gambar di halaman sambil menjaga aspect ratio
    const aspect = image.width / image.height;
    let drawW = maxW;
    let drawH = drawW / aspect;

    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * aspect;
    }

    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    doc.addImage(image.dataUrl, 'PNG', x, y, drawW, drawH);
  });

  return doc;
}

/**
 * Helper untuk langsung trigger download PDF di browser.
 */
export function downloadPdf(images: ExportImage[], paperSize: PaperSize, filename = 'coloring-pages.pdf') {
  const doc = exportImagesToPdf(images, paperSize);
  doc.save(filename);
}
