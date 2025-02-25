import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['ik.imagekit.io']
  },
  typescript: {
    ignoreBuildErrors: true  // Tambahin ini untuk skip type checking
  },
  eslint: {
    ignoreDuringBuilds: true // Optional: kalo mau skip eslint juga
  }
};

export default nextConfig;