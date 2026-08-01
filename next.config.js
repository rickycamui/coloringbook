/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',      // static export, jadi bisa di-host di static hosting mana pun
  images: {
    unoptimized: true,   // wajib untuk static export, kita nggak butuh Next.js image optimization
  },
  // GitHub Pages nge-host repo di path /nama-repo/, bukan di root domain.
  // Jadi kalau di-build khusus untuk GitHub Pages, kasih tau Next.js base path-nya.
  basePath: isGithubPages ? '/coloringbook' : '',
  assetPrefix: isGithubPages ? '/coloringbook/' : '',
};

module.exports = nextConfig;
