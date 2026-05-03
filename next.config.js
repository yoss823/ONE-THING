// trigger deployment
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/icon" },
    ];
  },
};

module.exports = nextConfig;