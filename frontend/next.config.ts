/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "https://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;

module.exports = {
  images: {
    remotePatterns: [
      new URL("https://placehold.co/**"),
      new URL("https://localhost:8080/**"),
    ],
  },
};

console.log(process.env.NODE_EXTRA_CA_CERTS);
