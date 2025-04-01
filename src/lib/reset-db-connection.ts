import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

// 追踪上次请求时间
let lastRequestTime = Date.now();
let requestCounter = 0;

/**
 * 检查并在必要时重置数据库连接
 * 在Lambda热启动或从冷启动后检测并尝试强制销毁所有连接
 * 
 * @returns true if reset was performed
 */
export async function checkAndResetDatabaseConnection() {
  try {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const requestId = `req-${now}-${Math.random().toString(36).substring(2, 8)}`;
    
    requestCounter++;
    console.log(`[DB-RESET] 请求 #${requestCounter}, ID: ${requestId}, 自上次请求已过 ${timeSinceLastRequest}ms`);
    
    // 如果是Lambda冷启动或距离上次请求较长时间（超过3秒），尝试重置连接
    if (requestCounter === 1 || timeSinceLastRequest > 3000) {
      console.log(`[DB-RESET] 检测到Lambda ${requestCounter === 1 ? '首次启动' : '长时间空闲'}, 重置数据库连接...`);
      
      // 重置Prisma连接
      try {
        // 创建测试查询ID
        const testQueryId = `reset_test_${now}_${Math.random().toString(36).substring(2, 8)}`;
        console.log(`[DB-RESET] 执行测试查询 (${testQueryId})...`);
        
        // 尝试执行简单查询
        await prisma.$queryRaw`SELECT 1 as reset_test`;
        
        console.log(`[DB-RESET] 数据库连接测试成功`);
        return true;
      } catch (error) {
        console.error(`[DB-RESET] 重置数据库连接失败，请求ID: ${requestId}`, error);
        console.error(`[DB-RESET] 重置Prisma连接时发生错误:`, error);
        
        return false;
      }
    }
    
    // 更新上次请求时间
    lastRequestTime = now;
    return false;
  } catch (error) {
    console.error('检查数据库连接状态失败:', error);
    return false;
  }
}
