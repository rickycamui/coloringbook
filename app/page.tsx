'use client';

import { useState, useCallback } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ImagePreview from '@/components/ImagePreview';
import ControlPanel from '@/components/ControlPanel';
import PdfExportPanel from '@/components/PdfExportPanel';
import { loadAndResizeImage } from '@/lib/resizeUtil';
import { processImage, ProcessOptions, DEFAULT_OPTIONS } from '@/lib/imageProcessor';
import { downloadPdf, ExportImage, PaperSize } from '@/lib/pdfExporter';
import { ProcessedImage } from '@/lib/types';

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `img-${Date.now()}-${idCounter}`;
}

export default function HomePage() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [options, setOptions] = useState<ProcessOptions>(DEFAULT_OPTIONS);
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Jalankan pipeline processing untuk satu file, kembalikan ProcessedImage
  const processFile = useCallback(
    async (file: File, opts: ProcessOptions): Promise<ProcessedImage> => {
      const { imageData } = await loadAndResizeImage(file);

      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);
      const originalDataUrl = canvas.toDataURL('image/png');

      const resultData = processImage(imageData, opts);
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = resultData.width;
      resultCanvas.height = resultData.height;
      const resultCtx = resultCanvas.getContext('2d')!;
      resultCtx.putImageData(resultData, 0, 0);

      return {
        id: nextId(),
        originalDataUrl,
        resultDataUrl: resultCanvas.toDataURL('image/png'),
        width: resultData.width,
        height: resultData.height,
      };
    },
    []
  );

  async function handleFilesSelected(files: File[]) {
    setIsProcessing(true);
    try {
      const results = await Promise.all(files.map((f) => processFile(f, options)));
      setImages((prev) => [...prev, ...results]);
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      alert('Ada gambar yang gagal diproses. Coba lagi dengan file lain.');
    } finally {
      setIsProcessing(false);
    }
  }

  function handleRemove(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  // Re-process semua gambar yang sudah ada saat slider diubah
  async function handleOptionsChange(newOptions: ProcessOptions) {
    setOptions(newOptions);
  }

  async function reprocessAll(newOptions: ProcessOptions) {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      // Re-run processing pakai originalDataUrl yang sudah ada (tanpa upload ulang)
      const updated = await Promise.all(
        images.map(async (img) => {
          const bitmap = await loadImageFromDataUrl(img.originalDataUrl);
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(bitmap, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);

          const resultData = processImage(imageData, newOptions);
          const resultCanvas = document.createElement('canvas');
          resultCanvas.width = resultData.width;
          resultCanvas.height = resultData.height;
          const resultCtx = resultCanvas.getContext('2d')!;
          resultCtx.putImageData(resultData, 0, 0);

          return { ...img, resultDataUrl: resultCanvas.toDataURL('image/png') };
        })
      );
      setImages(updated);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleExportPdf() {
    if (images.length === 0) return;
    setIsExporting(true);
    try {
      const exportImages: ExportImage[] = images.map((img) => ({
        dataUrl: img.resultDataUrl ?? img.originalDataUrl,
        width: img.width,
        height: img.height,
      }));
      downloadPdf(exportImages, paperSize, 'coloring-pages.pdf');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <main>
      <h1>Coloring Page Converter</h1>
      <p className="subtitle">
        Ubah ilustrasi berwarna jadi outline hitam-putih tebal, siap dicetak untuk kegiatan mewarnai anak.
      </p>

      <div className="card">
        <div className="section-title">1. Upload Gambar</div>
        <ImageUploader onFilesSelected={handleFilesSelected} />
        {isProcessing && (
          <p className="empty-state">
            <span className="loader" /> Memproses gambar...
          </p>
        )}
        <ImagePreview images={images} onRemove={handleRemove} />
      </div>

      <div className="card">
        <div className="section-title">2. Atur Hasil</div>
        <ControlPanel
          options={options}
          onChange={(opts) => {
            handleOptionsChange(opts);
            reprocessAll(opts);
          }}
        />
      </div>

      <div className="card">
        <div className="section-title">3. Export</div>
        <PdfExportPanel
          paperSize={paperSize}
          onPaperSizeChange={setPaperSize}
          onExport={handleExportPdf}
          disabled={images.length === 0}
          isExporting={isExporting}
        />
      </div>
    </main>
  );
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
