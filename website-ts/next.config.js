/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static HTML export for GitHub Pages
  images: {
    // Disable image optimization for local images to prevent blur
    unoptimized: true,
  },
  // Avoid webpack PackFileCacheStrategy ENOENT rename errors on Windows (e.g. when cache is locked)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
//   // GitHub Pages subdirectory hosting
//   basePath: '/fantasy-football',
//   assetPrefix: '/fantasy-football/',
}

module.exports = nextConfig
