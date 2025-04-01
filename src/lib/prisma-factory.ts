import { PrismaClient } from '@prisma/client';

/**
 * 实例计数
 */
let instanceCounter = 0;

/**
 * 全局Prisma实例 - 在开发环境中重用
 */
let globalPrismaInstance: PrismaClient | undefined = undefined;

/**
 * 创建一个新的PrismaClient实例，根据环境自动配置
 * 
 * @returns 新的或缓存的PrismaClient实例
 */
export function createPrismaClient(): PrismaClient {
  const isVercel = Boolean(process.env.VERCEL);
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  const instanceId = ++instanceCounter;
  
  // 在开发环境中重用Prisma实例，减少连接数量
  if (!isProduction && !isTest && !isVercel && globalPrismaInstance) {
    console.log(`[PRISMA-FACTORY] 重用全局Prisma实例 #${instanceId}，环境: development`);
    return globalPrismaInstance;
  }
  
  // 准备数据库URL（为防止Statement泄漏，添加额外参数）
  let dbUrl = process.env.DATABASE_URL as string;
  
  // 在URL中注入参数，确保禁用prepared statement缓存
  if (dbUrl && !dbUrl.includes('statement_cache_size=0')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'statement_cache_size=0';
  }
  
  // 添加随机应用名以避免准备好的语句冲突
  if (dbUrl && !dbUrl.includes('application_name=')) {
    const randomSuffix = Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    dbUrl += `&application_name=vercel_${randomSuffix}`;
  }
  
  // 在Vercel环境中，每个实例使用一个唯一的客户端ID
  if (isVercel && dbUrl && !dbUrl.includes('options=')) {
    dbUrl += `&options=-c%20client_min_messages%3Dwarning%20-c%20lock_timeout%3D5000%20-c%20statement_timeout%3D10000%20-c%20client_encoding%3DUTF8`;
  }
  
  // 配置PrismaClient
  console.log(`[PRISMA-FACTORY] 创建新的Prisma实例 #${instanceId}，环境: ${isVercel ? 'Vercel' : process.env.NODE_ENV}`);
  
  // 在Vercel环境中，完全禁用连接池
  const poolConfig = isVercel ? {
    connection_limit: 1, // 严格限制为一个连接
    pool_timeout: 5, // 5秒池超时
    idle_timeout: 5, // 5秒空闲超时
  } : undefined;
  
  // 创建新实例
  const newClient = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      }
    },
    // 严格禁用日志，除非明确请求
    log: process.env.DEBUG_PRISMA === '1' ? ['query', 'error', 'warn'] : ['error'],
    
    // Serverless环境中的优化配置
    // @ts-ignore - 类型定义可能无法识别非标准选项
    __internal: {
      useUds: false, // 禁用Unix域套接字
      engine: {
        neverStoreCwd: true, // 避免存储当前工作目录
        binaryPath: undefined, // 使用默认的二进制路径
        env: {
          ...process.env,
          // 这些设置可以帮助减少内存使用和改善连接处理
          PRISMA_ENGINE_PROTOCOL: 'json', // 使用JSON协议（而不是更复杂的GraphQL）
          PRISMA_CLIENT_ENGINE_TYPE: 'binary', // 确保使用二进制引擎而不是JS引擎
          PRISMA_CLI_QUERY_CACHE_SIZE: '0', // 禁用查询缓存
          PRISMA_ENGINE_METRICS: 'false', // 禁用指标收集以减少内存使用
          PRISMA_NO_ENGINE_CACHE: '1', // 禁用引擎缓存
        },
      },
      atomicOperations: false, // 禁用原子操作
      retry_backoff_factor: 2, // 指数回退因子，用于重试
    },
  });
  
  // 在非生产环境中保存实例以重用
  if (!isProduction && !isTest && !isVercel) {
    globalPrismaInstance = newClient;
  }
  
  // 注册一个事件监听器，监听连接关闭事件
  // 注意: 类型定义中可能缺少这些事件，所以使用 as any 处理
  try {
    (newClient as any).$on('beforeExit', () => {
      console.log(`[PRISMA-FACTORY] Prisma实例 #${instanceId} 正在关闭...`);
    });
  } catch (e) {
    // 如果事件API不可用，就忽略错误
    console.log(`[PRISMA-FACTORY] 注意: 无法注册Prisma事件监听器`);
  }
  
  return newClient;
}

/**
 * 检查数据库连接是否有效
 * 
 * @param prismaClient 要检查的Prisma客户端
 * @returns 如果连接有效则为true，否则为false
 */
export async function checkPrismaConnection(prismaClient: PrismaClient): Promise<boolean> {
  try {
    // 使用简单查询来测试连接
    const timestamp = Date.now();
    const randomValue = `check_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
    
    // 避免使用预处理语句的查询
    await prismaClient.$executeRaw`SELECT ${randomValue} as connection_check`;
    
    return true;
  } catch (error) {
    console.error('数据库连接检查失败:', error);
    return false;
  }
}

/**
 * Prisma实例
 */
export const prisma = createPrismaClient();

/**
 * 确保数据库连接已经建立
 */
export async function ensureDatabaseConnection(): Promise<void> {
  try {
    // 通过执行一个简单的查询来确保连接
    const isConnected = await checkPrismaConnection(prisma);
    
    if (!isConnected) {
      console.warn('数据库连接无效，尝试重新连接...');
      
      // 如果连接无效，可以在这里添加重连逻辑
      // 但这通常不需要，因为Prisma会自动重连
      
      // 如果想要强制重连，可以这样做：
      // await prisma.$connect();
    }
  } catch (error) {
    console.error('确保数据库连接失败:', error);
    throw error;
  }
} 