import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ['localhost:3080', 'localhost:3000'],
  images: {
    unoptimized: true,
  },
  sassOptions: {
    implementation: 'sass',
  },
  turbopack: {
    root: path.join(__dirname, '..'),
    // Define resolution order for file extensions
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],

    // Reserved for future webpack loader configurations
    // rules: {},

    // Reserved for future module path aliases
    // resolveAlias: {},
  },
};

export default nextConfig;
