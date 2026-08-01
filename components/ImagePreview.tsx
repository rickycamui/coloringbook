'use client';

import { ProcessedImage } from '@/lib/types';

interface ImagePreviewProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
}

export default function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) {
    return <p className="empty-state">Belum ada gambar yang diupload.</p>;
  }

  return (
    <div className="grid-preview">
      {images.map((img) => (
        <div className="preview-item" key={img.id}>
          <button className="remove-btn" onClick={() => onRemove(img.id)} title="Hapus gambar">
            ✕
          </button>
          <img
            src={img.resultDataUrl ?? img.originalDataUrl}
            alt="Hasil convert coloring page"
          />
        </div>
      ))}
    </div>
  );
}
