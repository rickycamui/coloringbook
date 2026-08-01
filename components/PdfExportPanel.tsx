'use client';

import { useState } from 'react';
import { PaperSize } from '@/lib/pdfExporter';

interface PdfExportPanelProps {
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  onExport: () => void;
  disabled: boolean;
  isExporting: boolean;
}

const PAPER_LABELS: { size: PaperSize; label: string }[] = [
  { size: 'a5', label: 'A5' },
  { size: 'a4', label: 'A4' },
  { size: 'a3', label: 'A3' },
];

export default function PdfExportPanel({
  paperSize,
  onPaperSizeChange,
  onExport,
  disabled,
  isExporting,
}: PdfExportPanelProps) {
  return (
    <div>
      <label className="control-label">
        <span>Ukuran kertas</span>
      </label>
      <div className="paper-size-options">
        {PAPER_LABELS.map(({ size, label }) => (
          <button
            key={size}
            className={`paper-size-btn ${paperSize === size ? 'active' : ''}`}
            onClick={() => onPaperSizeChange(size)}
          >
            {label}
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={onExport} disabled={disabled || isExporting}>
        {isExporting ? (
          <>
            <span className="loader" /> Menyusun PDF...
          </>
        ) : (
          'Export sebagai PDF'
        )}
      </button>
    </div>
  );
}
