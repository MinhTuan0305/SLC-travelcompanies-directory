/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack config để load GeoJSON
  webpack(config) {
    config.module.rules.push({
      test: /\.geojson$/,
      type: "json",
    });
    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['leaflet'],
  },

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Tắt ESLint fail build trên Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Redirect root URL → /agencies
  async redirects() {
    return [
      {
        source: '/',
        destination: '/agencies',
        permanent: true, // 308 redirect
      },
    ];
  },
};

module.exports = nextConfig;
