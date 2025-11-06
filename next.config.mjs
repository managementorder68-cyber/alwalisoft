/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable static optimization to always generate fresh pages
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // Headers to prevent caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
