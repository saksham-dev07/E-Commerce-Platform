/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configure for larger file uploads
  serverExternalPackages: ['multer']
}

module.exports = nextConfig
