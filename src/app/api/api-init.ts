/**
 * API初始化文件
 * 用于在Serverless环境中预加载必要的资源，提高API路由性能
 */
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';

// 初始化数据库连接
export async function initializeApi() {
  const isVercel = Boolean(process.env.VERCEL);
  
  console.log('API初始化开始');
  console.log('运行环境:', isVercel ? 'Vercel' : process.env.NODE_ENV);
  
  try {
    // 确保数据库连接
    await ensureDatabaseConnection();
    
    // 测试数据库连接
    const userCount = await prisma.user.count();
    console.log(`数据库连接测试成功，共有 ${userCount} 名用户`);
    
    console.log('API初始化完成');
    return { success: true, message: 'API初始化成功' };
  } catch (error) {
    console.error('API初始化失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 