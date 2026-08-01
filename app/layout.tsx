import './globals.css';

export const metadata = {
  title: 'Coloring Page Converter',
  description: 'Ubah ilustrasi berwarna jadi outline hitam-putih untuk kegiatan mewarnai anak.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
