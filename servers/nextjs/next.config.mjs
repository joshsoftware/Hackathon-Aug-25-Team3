const nextConfig = {
  reactStrictMode: false,
  distDir: ".next-build",

  // Explicitly set the host for Server Actions
  serverRuntimeConfig: {
    host: 'localhost',
    port: 5001,
  },

  // Rewrites for development
  async rewrites() {
    return [
      {
        source: "/app_data/fonts/:path*",
        destination: "http://localhost:5001/app_data/fonts/:path*",
      },
      {
        source: "/api/v1/documents/:path*",
        destination: "http://localhost:8000/api/v1/documents/:path*",
      },
    ];
  },

  // Configure headers for Server Actions
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:5001' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,HEAD,PUT,PATCH,POST,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },

  // Add experimental server actions configuration
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:5001']
    }
  },

  // Existing image remote patterns
  images: {
    remotePatterns: [
      // ... (keep existing remote patterns)
    ],
  },
};

export default nextConfig;