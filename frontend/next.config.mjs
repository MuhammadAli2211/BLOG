/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Production build mein TypeScript errors ki waja se build fail nahi hone dega
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors ko build ke waqt ignore karega
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;