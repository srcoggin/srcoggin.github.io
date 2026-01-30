/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static HTML export for GitHub Pages
  images: {
    // Disable image optimization for local images to prevent blur
    unoptimized: true,
  },
//   // GitHub Pages subdirectory hosting
//   basePath: '/fantasy-football',
//   assetPrefix: '/fantasy-football/',
}

module.exports = nextConfig
