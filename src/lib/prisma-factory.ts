import { PrismaClient } from '@prisma/client';

// 获取优化的数据库URL
function getDbUrl() {
  let url = process.env.DATABASE_URL || '';
  
  // 确保URL包含必要的连接设置
  if (url && !url.includes('connection_limit')) {
    url = url.includes('?')
      ? `${url}&connection_limit=1&pool_timeout=0`
      : `${url}?connection_limit=1&pool_timeout=0`;
  }
  
  return url;
}

/**
 * Prisma客户端工厂函数 - 在Serverless环境中为每个请求创建新实例
 * 避免"prepared statement already exists"错误
 */
export function createPrismaClient() {
  // 为每个API调用创建新的PrismaClient实例
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: getDbUrl(),
      },
    },
    log: ['error'],
  });

  // 添加独特的客户端ID用于日志
  const clientId = Math.random().toString(36).substring(2, 9);
  console.log(`创建新的Prisma客户端实例 (ID: ${clientId})`);
  
  return prisma;
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
  
  try {
    // 尝试连接数据库
    await prisma.$connect();
    
    // 执行查询
    const result = await callback(prisma);
    
    return result;
  } finally {
    // 无论成功或失败，都确保断开连接
    await prisma.$disconnect();
  }
} 