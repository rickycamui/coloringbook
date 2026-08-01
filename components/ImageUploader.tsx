'use client';

import { useRef, useState } from 'react';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function ImageUploader({ onFilesSelected }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) onFilesSelected(files);
  }

  return (
    <div
      className={`dropzone ${isDragOver ? 'dragover' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <p>
        Klik atau seret gambar ke sini
        <br />
        Bisa pilih beberapa gambar sekaligus (PNG/JPG)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
