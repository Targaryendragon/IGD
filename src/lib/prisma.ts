import { PrismaClient } from '@prisma/client';

// 在浏览器环境中，这个模块可能会被多次加载和实例化
// 所以我们创建一个全局单例
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const isVercelBuild = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production' && process.title === 'node';

// 创建一个新的PrismaClient或使用已存在的实例
export const prisma =
  globalForPrisma.prisma ||
  (isVercelBuild
    ? new PrismaClient({
        log: ['error'],
        // 在Vercel构建过程中，我们不想真正连接数据库
        datasources: {
          db: {
            url: 'postgresql://fake:fake@localhost:5432/fake?schema=public'
          }
        }
      })
    : new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      }));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 