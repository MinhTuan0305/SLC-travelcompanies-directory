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
