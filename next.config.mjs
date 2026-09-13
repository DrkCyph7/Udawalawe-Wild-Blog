/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/blog', // <-- Add this
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.1.142'],
}

export default nextConfig
