import { PrismaClient } from '@prisma/client';

// 为global添加类型声明
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 检查数据库URL是否包含SSL设置
const databaseUrl = process.env.DATABASE_URL || '';
const hasNoVerify = databaseUrl.includes('sslmode=no-verify');
const hasRequire = databaseUrl.includes('sslmode=require');

// 检测Serverless环境
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);

// 获取优化的数据库URL
function getDbUrl() {
  let url = process.env.DATABASE_URL || '';
  
  // 如果URL不包含SSL设置，添加sslmode=no-verify
  if (!hasNoVerify && !hasRequire && url) {
    url = url.includes('?') 
      ? `${url}&sslmode=no-verify` 
      : `${url}?sslmode=no-verify`;
  }
  
  // 在Serverless环境中添加连接池设置，避免prepared statement问题
  if (isServerless && url && !url.includes('connection_limit')) {
    url = url.includes('?')
      ? `${url}&connection_limit=1&pool_timeout=20`
      : `${url}?connection_limit=1&pool_timeout=20`;
  }
  
  console.log('数据库环境:', isServerless ? 'Serverless' : process.env.NODE_ENV);
  console.log('使用的数据库URL类型:', 
    hasNoVerify ? 'sslmode=no-verify' : 
    hasRequire ? 'sslmode=require' : 
    '添加了sslmode=no-verify');
  
  return url;
}

// 根据环境决定如何创建Prisma客户端
let prisma: PrismaClient;

if (isServerless) {
  // 在Serverless环境中每次请求创建一个新实例，防止"prepared statement already exists"错误
  prisma = new PrismaClient({
    datasources: { db: { url: getDbUrl() } }
  });
  console.log('Serverless环境: 创建了新的Prisma客户端实例');
} else if (process.env.NODE_ENV === 'production') {
  // 非Serverless的生产环境
  prisma = new PrismaClient({
    datasources: { db: { url: getDbUrl() } }
  });
  console.log('生产环境: 创建了新的Prisma客户端实例');
} else {
  // 在开发环境中重用实例
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

// 添加中间件记录查询性能并处理错误
prisma.$use(async (params, next) => {
  try {
    const start = Date.now();
    const result = await next(params);
    const end = Date.now();
    console.log(`Prisma查询 ${params.model}.${params.action} 耗时 ${end - start}ms`);
    return result;
  } catch (error) {
    console.error(`Prisma查询错误 ${params.model}.${params.action}:`, error);
    
    // 记录详细错误信息，对特定错误进行处理
    if (error instanceof Error) {
      if (error.message.includes('relation "api" already exists')) {
        console.error('检测到表名冲突错误，这可能是由Prisma的表命名策略导致的');
        console.error('请尝试在schema.prisma中添加表前缀或使用relationMode="prisma"');
      }
      
      if (error.message.includes('prepared statement') && error.message.includes('already exists')) {
        console.error('检测到prepared statement错误，这可能是由Serverless环境中的连接池问题导致的');
        console.error('在Serverless环境中已将连接限制设为1，每个请求会创建新的Prisma实例');
      }
    }
    
    throw error;
  }
});

// 导出实例
export { prisma };

// 添加连接管理
let isConnected = false;

// 确保连接
export async function ensureDatabaseConnection() {
  try {
    // 在Serverless环境中，每次请求尝试新建连接
    if (isServerless) {
      await prisma.$connect();
      console.log('已建立数据库连接（Serverless环境）');
    } else if (!isConnected) {
      await prisma.$connect();
      isConnected = true;
      console.log('已建立数据库连接');
    }
  } catch (error) {
    console.error('连接数据库失败:', error);
    throw error;
  }
  return prisma;
}

// 非Serverless环境下的连接关闭处理
if (!isServerless) {
  // 确保在应用关闭时断开连接
  process.on('beforeExit', async () => {
    if (isConnected) {
      await prisma.$disconnect();
      isConnected = false;
      console.log('Prisma客户端已断开连接');
    }
  });
  
  // 处理错误事件
  process.on('uncaughtException', async (error) => {
    console.error('未捕获的异常，断开Prisma连接:', error);
    if (isConnected) {
      await prisma.$disconnect();
      isConnected = false;
    }
    process.exit(1);
  });
} 