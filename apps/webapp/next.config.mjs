/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "convex.cloud" }] },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true, transpileOnly: true },
};

export default nextConfig;
