import { PrismaClient } from '@prisma/client';

// 添加日志配置
const logOptions = process.env.NODE_ENV === 'development' 
  ? ['query', 'error', 'warn']
  : ['error'];

// 创建全局变量防止热重载创建多个实例
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 导出Prisma客户端实例
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: logOptions,
});

// 添加环境变量检查
if (!process.env.DATABASE_URL) {
  console.error('错误: 缺少DATABASE_URL环境变量');
}

// 添加中间件记录查询性能
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const end = Date.now();
  console.log(`Prisma查询 ${params.model}.${params.action} 耗时 ${end - start}ms`);
  return result;
});

// 在开发环境下不缓存Prisma客户端
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 添加关闭处理程序
process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 