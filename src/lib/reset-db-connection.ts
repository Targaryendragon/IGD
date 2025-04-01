import { PrismaClient } from '@prisma/client';

// 保存上次请求时间以检测"睡眠"的Lambda实例
let lastRequestTime = Date.now();
let requestCounter = 0;
let isFirstRequest = true;

/**
 * 检查并在必要时重置数据库连接
 * 在Lambda热启动或从冷启动后检测并尝试强制销毁所有连接
 * 
 * @returns true if reset was performed
 */
export async function checkAndResetDatabaseConnection(): Promise<boolean> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  requestCounter++;
  
  // 记录请求时间用于下次检测
  lastRequestTime = now;
  
  // 获取唯一的请求ID，用于日志标识
  const requestId = `req-${now}-${Math.random().toString(36).substr(2, 5)}`;
  
  console.log(`[DB-RESET] 请求 #${requestCounter}, ID: ${requestId}, 自上次请求已过 ${timeSinceLastRequest}ms`);
  
  // 如果是首次请求或已经超过30秒没有请求，则进行重置
  // 这可能表明Lambda实例已被冻结然后热启动
  if (isFirstRequest || timeSinceLastRequest > 30000) {
    console.log(`[DB-RESET] 检测到Lambda ${isFirstRequest ? '首次启动' : '热启动'}, 重置数据库连接...`);
    isFirstRequest = false;
    
    try {
      // 尝试强制重置连接池
      await resetPrismaConnections();
      console.log(`[DB-RESET] 数据库连接重置成功，请求ID: ${requestId}`);
      return true;
    } catch (error) {
      console.error(`[DB-RESET] 重置数据库连接失败，请求ID: ${requestId}`, error);
      return false;
    }
  }
  
  return false;
}

/**
 * 尝试强制关闭所有Prisma连接
 */
async function resetPrismaConnections(): Promise<void> {
  try {
    // 创建临时Prisma客户端进行内部重置
    const tempPrisma = new PrismaClient();
    
    // 执行简单查询以测试连接
    console.log('[DB-RESET] 执行测试查询...');
    await tempPrisma.$queryRaw`SELECT 1 as test`;
    
    // 断开连接
    console.log('[DB-RESET] 断开Prisma连接...');
    await tempPrisma.$disconnect();
    
    // 在Node.js中显式触发垃圾回收 (在V8中可用)
    if (typeof global.gc === 'function') {
      console.log('[DB-RESET] 触发垃圾回收...');
      global.gc();
    }
    
    console.log('[DB-RESET] 数据库连接重置完成');
  } catch (error) {
    console.error('[DB-RESET] 重置Prisma连接时发生错误:', error);
    throw error;
  }
} 