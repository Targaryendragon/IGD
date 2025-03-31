/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // 启用更好的错误处理
    serverComponentsExternalPackages: [],
  },
  eslint: {
    // 忽略构建时的ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 忽略构建时的TypeScript错误
    ignoreBuildErrors: true,
  },
  // 增加静态输出配置，避免构建时连接数据库
  output: 'standalone',
  staticPageGenerationTimeout: 120,
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