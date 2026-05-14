/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        pathname: '/**',
      },
    ],
    // Sizes matching the icon/thumbnail sizes used across the app
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
