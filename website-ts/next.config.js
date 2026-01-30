/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static HTML export for GitHub Pages
  images: {
    // Disable image optimization for local images to prevent blur
    unoptimized: true,
  },
  // Uncomment and set if hosting in a subdirectory (e.g., /Website)
  // basePath: '/Website',
  // assetPrefix: '/Website/',
}

module.exports = nextConfig
