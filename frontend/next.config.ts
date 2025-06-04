import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Node.js to trust our certificates
process.env.NODE_EXTRA_CA_CERTS = path.join(__dirname, "certs", "ca.crt");

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "https://localhost:8080/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
    ],
    // Configure custom image loader to handle SSL certificates
    loader: "custom",
    loaderFile: "./image-loader.js",
  },
  // Configure Node.js to trust our certificates
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Configure the server to trust our certificates
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:8080"],
    },
  },
  serverExternalPackages: ["fs", "path"],
};

export default nextConfig;

console.log(process.env.NODE_EXTRA_CA_CERTS);
