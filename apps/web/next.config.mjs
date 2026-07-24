/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/config",
    "@workspace/ui",
    "@workspace/utils",
    "@workspace/validation",
  ],
};

export default nextConfig;
