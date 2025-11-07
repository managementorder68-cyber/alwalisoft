/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Use standalone output for production
  output: 'standalone',
  
  // Disable static page generation
  distDir: '.next',
  
  // Disable static page generation
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  
  // Disable optimizations that cause prerendering issues
  optimizeFonts: false,
  swcMinify: true,
  
  // Configure for dynamic rendering
  experimental: {
    // Disable problematic features
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  
  // Disable static exports
  skipTrailingSlashRedirect: false,
  skipMiddlewareUrlNormalize: false,

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
  
  // Webpack config to handle context providers
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
