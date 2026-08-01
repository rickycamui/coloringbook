# Coloring Page Converter

Webapp untuk mengubah ilustrasi flat/vector berwarna menjadi outline hitam-putih tebal,
siap dicetak sebagai bahan mewarnai anak.

## Fitur

- Import banyak gambar sekaligus (batch)
- Slider ketebalan outline & sensitivitas deteksi garis
- Export ke PDF dengan pilihan ukuran kertas A5 / A4 / A3
- 100% proses di browser (client-side), tanpa server/cloud
- Dark theme

## Cara Menjalankan (Development)

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Build untuk Production (Static Export)

```bash
npm run build
```

Hasil static file ada di folder `out/` — folder ini yang di-upload ke hosting statis
(Vercel, Netlify, Cloudflare Pages, atau shared hosting biasa).

## Struktur Project

```
app/
  page.tsx        - halaman utama (single page)
  layout.tsx       - root layout
  globals.css      - dark theme + aksen orange-red
components/
  ImageUploader.tsx    - upload & drag-drop, multi-image
  ImagePreview.tsx     - grid preview hasil
  ControlPanel.tsx     - slider ketebalan & sensitivitas
  PdfExportPanel.tsx   - pilihan ukuran kertas & tombol export
lib/
  imageProcessor.ts    - core algorithm: grayscale, Sobel edge detection,
                         threshold, dilation, cleanup noise
  resizeUtil.ts        - resize gambar sebelum diproses (kunci performa)
  pdfExporter.ts        - susun hasil ke PDF pakai jsPDF
  types.ts              - tipe data bersama
```

## Algoritma Image Processing

Pipeline: `RGB → Grayscale → Sobel Edge Detection → Threshold (biner) → Dilation (ketebalan) → Cleanup noise → PNG output`

Semua operasi O(n) atau O(n·k) sederhana (k = ukuran kernel kecil 3-9px), sehingga ringan
dijalankan bahkan di device entry-level. Gambar di-resize ke maksimal 1200px sebelum diproses
untuk menjaga performa (lihat `lib/resizeUtil.ts`).

## Catatan Pengembangan Lanjutan

- Slider saat ini re-process ulang semua gambar tiap kali diubah — untuk banyak gambar sekaligus,
  pertimbangkan menambahkan debounce (tunggu user berhenti geser slider ~300ms) sebelum re-process,
  supaya tidak lag saat drag slider.
- Fitur prioritas rendah yang belum diimplementasi: AI Enhance (Gemini API), PWA/offline support,
  history/gallery hasil convert.
