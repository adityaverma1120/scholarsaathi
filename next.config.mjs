/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Next.js development tools indicator & toolbar (Next.js 15 supported configuration)
  devIndicators: false,
  // Transpile lucide-react to avoid broken relative vendor-chunk imports on Windows
  transpilePackages: ['lucide-react'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
