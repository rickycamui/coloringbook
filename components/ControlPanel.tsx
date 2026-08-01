'use client';

import { ProcessOptions } from '@/lib/imageProcessor';

interface ControlPanelProps {
  options: ProcessOptions;
  onChange: (options: ProcessOptions) => void;
}

export default function ControlPanel({ options, onChange }: ControlPanelProps) {
  return (
    <div>
      <label className="control-label">
        <span>Ketebalan outline</span>
        <span className="value">{options.thickness}</span>
      </label>
      <input
        type="range"
        min={0}
        max={6}
        step={1}
        value={options.thickness}
        onChange={(e) => onChange({ ...options, thickness: Number(e.target.value) })}
      />

      <label className="control-label">
        <span>Sensitivitas deteksi garis</span>
        <span className="value">{options.threshold}</span>
      </label>
      <input
        type="range"
        min={10}
        max={150}
        step={5}
        value={options.threshold}
        onChange={(e) => onChange({ ...options, threshold: Number(e.target.value) })}
      />
    </div>
  );
}
