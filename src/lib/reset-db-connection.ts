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
import { PrismaClient } from '@prisma/client';

// 追踪上次请求时间
let lastRequestTime = Date.now();
let requestCounter = 0;

// 检查并重置数据库连接
export async function checkAndResetDatabaseConnection() {
  try {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const requestId = `req-${now}-${Math.random().toString(36).substr(2, 8)}`;
    
    requestCounter++;
    console.log(`[DB-RESET] 请求 #${requestCounter}, ID: ${requestId}, 自上次请求已过 ${timeSinceLastRequest}ms`);
    
    // 如果是Lambda冷启动或距离上次请求较长时间（超过3秒），尝试重置连接
    if (requestCounter === 1 || timeSinceLastRequest > 3000) {
      console.log(`[DB-RESET] 检测到Lambda ${requestCounter === 1 ? '首次启动' : '长时间空闲'}, 重置数据库连接...`);
      
      // 重置Prisma连接
      try {
        // 创建测试查询ID
        const testQueryId = `reset_test_${now}_${Math.random().toString(36).substr(2, 8)}`;
        console.log(`[DB-RESET] 执行测试查询 (${testQueryId})...`);
        
        // 使用一个新的Prisma实例执行查询
        const prisma = new PrismaClient();
        await prisma.$connect();
        
        // 执行简单查询
        await prisma.$queryRaw`SELECT 1 as reset_test`;
        
        // 关闭连接
        await prisma.$disconnect();
        
        console.log(`[DB-RESET] 数据库连接重置成功`);
      } catch (error) {
        console.error(`[DB-RESET] 重置数据库连接失败，请求ID: ${requestId}`, error);
        console.error(`[DB-RESET] 重置Prisma连接时发生错误:`, error);
      }
    }
    
    // 更新上次请求时间
    lastRequestTime = now;
    return true;
  } catch (error) {
    console.error('检查数据库连接状态失败:', error);
    return false;
  }
}

/**
 * 尝试强制关闭所有Prisma连接
 */
async function resetPrismaConnections(): Promise<void> {
  try {
    // 创建临时Prisma客户端进行内部重置
    const tempPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ? 
            `${process.env.DATABASE_URL}&statement_cache_size=0` : 
            process.env.DATABASE_URL,
        },
      },
    });
    
    // 生成随机查询名称，避免冲突
    const randomQueryName = `reset_test_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // 执行简单查询以测试连接 - 使用executeRaw而不是queryRaw
    console.log(`[DB-RESET] 执行测试查询 (${randomQueryName})...`);
    // 使用executeRaw并添加随机参数避免prepared statement冲突
    await tempPrisma.$executeRaw`SELECT 1 as ${randomQueryName}`;
    
    // 断开连接
    console.log('[DB-RESET] 断开Prisma连接...');
    await tempPrisma.$disconnect();
    
    // 在Node.js中显式触发垃圾回收 (在V8中可用)
    if (typeof global.gc === 'function') {
      console.log('[DB-RESET] 触发垃圾回收...');
      global.gc();
    }
    
    // 尝试重置全局连接
    try {
      console.log('[DB-RESET] 尝试重置Prisma全局状态...');
      // @ts-ignore - 访问Prisma内部属性
      const anyGlobal = global as any;
      if (anyGlobal.prisma) {
        delete anyGlobal.prisma;
      }
      
      // 清理可能存在的Prisma连接池
      if (anyGlobal.__prismaConnections) {
        delete anyGlobal.__prismaConnections;
      }
    } catch (globalError) {
      console.warn('[DB-RESET] 重置全局状态时出现警告:', globalError);
    }
    
    console.log('[DB-RESET] 数据库连接重置完成');
  } catch (error) {
    console.error('[DB-RESET] 重置Prisma连接时发生错误:', error);
    // 我们仍然把错误抛出，但在调用函数中会捕获它
    throw error;
  }
} 
