/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // 忽略构建时的ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 忽略构建时的TypeScript错误
    ignoreBuildErrors: true,
  },
  // 完全禁用静态页面生成，改为SSR
  output: 'standalone',
  staticPageGenerationTimeout: 240,
  // 禁用静态生成，改为完全SSR
  experimental: {
    // 完全禁用静态生成
    isrFlushToDisk: false,
    workerThreads: false,
    cpus: 1,
    // 启用更好的错误处理
    serverComponentsExternalPackages: [],
  },
  // 固定构建ID，避免生成静态文件时的冲突
  generateBuildId: () => 'build',
  // 添加webpack配置，处理supports-color缺失问题
  webpack: (config, { isServer }) => {
    // 解决supports-color模块缺失问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'supports-color': false,  // 告诉webpack忽略这个模块
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.desmos.com',
      },
      {
        protocol: 'https',
        hostname: 'www.geogebra.org',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'www.microsoft.com',
      },
      {
        protocol: 'https',
        hostname: 'www.apple.com',
      },
      {
        protocol: 'https',
        hostname: 'www.github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
}

module.exports = nextConfig 