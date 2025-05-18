/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;

module.exports = {
  images: {
    remotePatterns: [new URL("https://placehold.co/**")],
  },
};
