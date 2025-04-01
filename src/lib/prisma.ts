import { PrismaClient } from '@prisma/client';

// 为global添加类型声明
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 检测Serverless环境
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);

// 获取优化的数据库URL
function getDbUrl() {
  let url = process.env.DATABASE_URL || '';
  
  // 对于Supabase连接，确保使用正确的连接参数
  if (url.includes('supabase') && !url.includes('pgbouncer')) {
    // 添加pgbouncer=true参数，这对Supabase连接池很重要
    url = url.includes('?') 
      ? `${url}&pgbouncer=true` 
      : `${url}?pgbouncer=true`;
  }
  
  // 确保SSL设置
  if (!url.includes('sslmode=')) {
    url = url.includes('?') 
      ? `${url}&sslmode=require` 
      : `${url}?sslmode=require`;
  }
  
  // 在Serverless环境中，严格限制连接数和超时时间
  if (isServerless) {
    // 移除可能导致问题的旧参数
    url = url.replace(/&connection_limit=\d+/g, '');
    url = url.replace(/&pool_timeout=\d+/g, '');
    
    // 添加新的连接参数
    url = url.includes('?')
      ? `${url}&connection_limit=1&pool_timeout=0&statement_cache_size=0`
      : `${url}?connection_limit=1&pool_timeout=0&statement_cache_size=0`;
  }
  
  console.log('数据库环境:', isServerless ? 'Serverless' : process.env.NODE_ENV);
  console.log('使用的数据库URL类型:', url.includes('sslmode=require') ? 'sslmode=require' : '其他配置');
  
  return url;
}

// 根据运行环境创建Prisma客户端
let prisma: PrismaClient;

if (isServerless) {
  // 在Serverless环境中为每个请求创建新的Prisma实例
  prisma = new PrismaClient({
    datasources: { db: { url: getDbUrl() } },
    // 在Serverless环境禁用连接池
    log: ['error', 'warn'],
  });
  console.log('Serverless环境: 创建了新的Prisma客户端实例');
} else if (process.env.NODE_ENV === 'production') {
  // 非Serverless的生产环境
  prisma = new PrismaClient({
    datasources: { db: { url: getDbUrl() } },
    log: ['error', 'warn'],
  });
  console.log('生产环境: 创建了新的Prisma客户端实例');
} else {
  // 开发环境中重用实例
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      datasources: { db: { url: getDbUrl() } }
    });
    console.log('开发环境: 创建了新的Prisma客户端实例');
  }
  
  prisma = global.prisma;
  console.log('开发环境: 使用现有的Prisma客户端实例');
}

// 重置Prisma客户端连接函数
export async function resetPrismaClient() {
  if (isServerless) {
    try {
      // 断开现有连接
      await prisma.$disconnect();
      
      // 创建新的Prisma客户端
      prisma = new PrismaClient({
        datasources: { db: { url: getDbUrl() } },
        log: ['error', 'warn'],
      });
      
      console.log('已重置Prisma客户端连接');
      return true;
    } catch (error) {
      console.error('重置Prisma客户端失败:', error);
      return false;
    }
  }
  return false;
}

// 添加中间件处理查询错误
prisma.$use(async (params, next) => {
  try {
    const result = await next(params);
    return result;
  } catch (error) {
    console.error(`Prisma查询错误 ${params.model}.${params.action}:`, error);
    
    // 处理特定错误
    if (error instanceof Error) {
      // 处理prepared statement错误
      if (error.message.includes('prepared statement') && error.message.includes('already exists')) {
        console.error('检测到prepared statement错误，尝试重置连接...');
        await resetPrismaClient();
      }
    }
    
    throw error;
  }
});

// 导出实例
export { prisma };

// 确保连接状态变量
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// 确保数据库连接函数
export async function ensureDatabaseConnection() {
  try {
    // 重置连接尝试次数
    if (isServerless) {
      // Serverless环境中每次请求尝试连接一次
      await prisma.$connect();
      
      // 简单查询测试连接
      await prisma.$queryRaw`SELECT 1`;
      
      console.log('已建立数据库连接（Serverless环境）');
      return prisma;
    } else if (!isConnected) {
      // 非Serverless环境仅在未连接时尝试连接
      await prisma.$connect();
      
      // 测试连接
      await prisma.$queryRaw`SELECT 1`;
      
      isConnected = true;
      console.log('已建立数据库连接');
    }
    
    return prisma;
  } catch (error) {
    connectionAttempts++;
    console.error(`连接数据库失败 (尝试 ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, error);
    
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log('尝试重置连接并重新连接...');
      await resetPrismaClient();
      return ensureDatabaseConnection();
    }
    
    throw error;
  }
}

// 对于非Serverless环境，添加进程退出处理
if (!isServerless) {
  process.on('beforeExit', async () => {
    if (isConnected) {
      await prisma.$disconnect();
      isConnected = false;
      console.log('Prisma客户端已断开连接');
    }
  });
  
  process.on('uncaughtException', async (error) => {
    console.error('未捕获的异常，断开Prisma连接:', error);
    if (isConnected) {
      await prisma.$disconnect();
      isConnected = false;
    }
    process.exit(1);
  });
}
