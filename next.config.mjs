/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  output: "export",
  assetPrefix: isDev ? undefined : "./",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
