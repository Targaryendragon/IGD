import { PrismaClient } from '@prisma/client';

// 创建全局计数器，用于跟踪Prisma实例数量
let instanceCounter = 0;

/**
 * 获取优化的数据库URL
 * 添加特殊参数以禁用连接池和prepared statements
 */
function getDbUrl() {
  let url = process.env.DATABASE_URL || '';
  
  // 确保URL包含必要的连接设置
  if (url) {
    // 添加参数以禁用连接池
    const params = [
      'connection_limit=1',
      'pool_timeout=0',
      'statement_cache_size=0',         // 禁用prepared statement缓存
      'application_name=vercel_lambda', // 标记应用名称
    ];
    
    // 为URL添加参数
    url = url.includes('?') 
      ? `${url}&${params.join('&')}` 
      : `${url}?${params.join('&')}`;
  }
  
  return url;
}

/**
 * Prisma客户端工厂函数 - 在Serverless环境中为每个请求创建新实例
 * 避免"prepared statement already exists"错误
 */
export function createPrismaClient() {
  // 增加实例计数
  instanceCounter++;
  const currentCount = instanceCounter;
  
  // 为每个实例创建唯一ID
  const clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  console.log(`[PRISMA-FACTORY] 创建新的Prisma客户端实例 #${currentCount} (ID: ${clientId})`);
  
  try {
    // 为每个API调用创建新的PrismaClient实例，禁用所有缓存和连接池
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: getDbUrl(),
        },
      },
      log: ['error', 'query'],
    });
    
    // 添加调试信息到实例
    (prisma as any).__clientId = clientId;
    (prisma as any).__instanceNumber = currentCount;
    
    return prisma;
  } catch (error) {
    console.error(`[PRISMA-FACTORY] 错误: 创建Prisma实例 #${currentCount} 失败:`, error);
    throw error;
  }
}

/**
 * 使用工厂创建一个独立的Prisma客户端并执行查询
 * 执行完成后自动断开连接，避免连接池问题
 * 
 * @param callback 使用prisma客户端执行的回调函数
 * @returns 回调函数的结果
 */
export async function withPrisma<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = createPrismaClient();
  const clientId = (prisma as any).__clientId;
  const instanceNum = (prisma as any).__instanceNumber;
  
  console.log(`[PRISMA-FACTORY] 开始使用Prisma实例 #${instanceNum} (ID: ${clientId})`);
  
  try {
    console.log(`[PRISMA-FACTORY] 连接数据库 - 实例 #${instanceNum}`);
    // 尝试连接数据库
    await prisma.$connect();
    console.log(`[PRISMA-FACTORY] 数据库连接成功 - 实例 #${instanceNum}`);
    
    // 执行查询
    console.log(`[PRISMA-FACTORY] 执行数据库操作 - 实例 #${instanceNum}`);
    const result = await callback(prisma);
    console.log(`[PRISMA-FACTORY] 数据库操作完成 - 实例 #${instanceNum}`);
    
    return result;
  } catch (error) {
    console.error(`[PRISMA-FACTORY] 错误: 使用Prisma实例 #${instanceNum} 时发生错误:`, error);
    throw error;
  } finally {
    try {
      console.log(`[PRISMA-FACTORY] 断开数据库连接 - 实例 #${instanceNum}`);
      // 无论成功或失败，都确保断开连接
      await prisma.$disconnect();
      console.log(`[PRISMA-FACTORY] 数据库连接已断开 - 实例 #${instanceNum} (ID: ${clientId})`);
    } catch (disconnectError) {
      console.error(`[PRISMA-FACTORY] 错误: 断开Prisma实例 #${instanceNum} 连接失败:`, disconnectError);
    }
  }
} 