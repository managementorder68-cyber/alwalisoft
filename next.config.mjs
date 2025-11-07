/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Skip static export for context providers
  output: undefined,
  
  // Disable static optimization to always generate fresh pages
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  
  // Experimental features for Next.js 16
  experimental: {
    // Configuration for Next.js 16
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
