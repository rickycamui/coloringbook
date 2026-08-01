/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // static export, jadi bisa di-host di static hosting mana pun
  images: {
    unoptimized: true,   // wajib untuk static export, kita nggak butuh Next.js image optimization
  },
};

module.exports = nextConfig;
