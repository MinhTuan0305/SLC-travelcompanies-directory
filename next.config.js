/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Thêm loader cho GeoJSON
    config.module.rules.push({
      test: /\.geojson$/,
      type: "json",
    });
    return config;
  },
  experimental: {
    optimizePackageImports: ['leaflet'],
  },
};

module.exports = nextConfig;