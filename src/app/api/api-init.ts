/**
 * API初始化文件
 * 用于在Serverless环境中预加载必要的资源，提高API路由性能
 */
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';
import { checkAndResetDatabaseConnection } from '@/lib/reset-db-connection';

let initCount = 0;

// 初始化数据库连接
export async function initializeApi() {
  const isVercel = Boolean(process.env.VERCEL);
  const initId = ++initCount;
  
  console.log(`API初始化开始 #${initId}`);
  console.log('运行环境:', isVercel ? 'Vercel' : process.env.NODE_ENV);
  
  try {
    // 在Vercel环境中，检查并重置数据库连接
    if (isVercel) {
      console.log(`[API初始化 #${initId}] 检查Lambda热启动状态并尝试重置连接`);
      await checkAndResetDatabaseConnection();
    }
    
    // 确保数据库连接
    await ensureDatabaseConnection();
    
    try {
      // 测试数据库连接
      const userCount = await prisma.user.count();
      console.log(`[API初始化 #${initId}] 数据库连接测试成功，共有 ${userCount} 名用户`);
    } catch (error) {
      // 发生查询错误时，尝试强制重置连接
      const queryError = error as Error;
      console.error(`[API初始化 #${initId}] 数据库查询失败, 尝试强制重置`, queryError);
      
      if (queryError.message && queryError.message.includes('prepared statement')) {
        console.log(`[API初始化 #${initId}] 检测到prepared statement错误，这可能是由Serverless环境中的连接池问题导致的，在Serverless环境中已将连接限制设为1，每个请求会创建新的Prisma实例`);
        
        // 强制尝试再次重置连接
        await checkAndResetDatabaseConnection();
        
        // 重新测试连接
        try {
          await ensureDatabaseConnection();
          const retryCount = await prisma.user.count();
          console.log(`[API初始化 #${initId}] 重置后数据库连接测试成功，共有 ${retryCount} 名用户`);
        } catch (err) {
          const retryError = err as Error;
          console.error(`[API初始化 #${initId}] 重置后仍然失败`, retryError);
          throw new Error(`API初始化失败: ${retryError.message || String(retryError)}`);
        }
      } else {
        // 其他类型的错误，直接抛出
        throw queryError;
      }
    }
    
    console.log(`[API初始化 #${initId}] 完成`);
    return { success: true, message: 'API初始化成功' };
  } catch (error) {
    console.error(`[API初始化 #${initId}] 失败:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 