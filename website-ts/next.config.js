/** @type {import('next').NextConfig} */

// Only use basePath in production (GitHub Pages)
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static HTML export for GitHub Pages
  images: {
    // Disable image optimization for local images to prevent blur
    unoptimized: true,
  },
  // GitHub Pages subdirectory hosting (only in production)
  basePath: isProd ? '/fantasy-football' : '',
  assetPrefix: isProd ? '/fantasy-football/' : '',
}

module.exports = nextConfig
