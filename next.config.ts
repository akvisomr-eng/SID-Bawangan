import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/SID-Bawangan',
  images: { unoptimized: true },
};

export default nextConfig;
