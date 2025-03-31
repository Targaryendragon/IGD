import { PrismaClient } from '@prisma/client';

// 为global添加类型声明
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 记录Prisma实例的状态
let prisma: PrismaClient;

// 避免多个Prisma Client实例
if (process.env.NODE_ENV === 'production') {
  // 在生产环境中每次请求创建一个新实例，防止"prepared statement already exists"错误
  prisma = new PrismaClient({
    log: ['error'],
    // 禁用连接池，避免Serverless环境中的问题
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  console.log('生产环境: 创建了新的Prisma客户端实例');
} else {
  // 在开发环境中重用实例
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
    console.log('开发环境: 创建了新的Prisma客户端实例');
  }
  
  prisma = global.prisma;
  console.log('开发环境: 使用现有的Prisma客户端实例');
}

// 每次请求后断开连接，防止连接积累
export { prisma };

// 确保在应用关闭时断开连接
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Prisma客户端已断开连接');
});

// 处理错误事件
process.on('uncaughtException', async (error) => {
  console.error('未捕获的异常，断开Prisma连接:', error);
  await prisma.$disconnect();
  process.exit(1);
});

// 添加中间件记录查询性能
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const end = Date.now();
  console.log(`Prisma查询 ${params.model}.${params.action} 耗时 ${end - start}ms`);
  return result;
}); 