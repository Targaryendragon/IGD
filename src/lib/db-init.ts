import { prisma, ensureDatabaseConnection } from './prisma';

/**
 * 初始化数据库连接并应用必要的修复
 * 这个函数应该在应用启动时调用
 */
export async function initializeDatabase() {
  try {
    console.log('开始初始化数据库连接...');
    
    // 确保数据库连接
    await ensureDatabaseConnection();
    
    // 检查数据库连接和表是否正常
    await testDatabaseConnection();
    
    console.log('数据库初始化完成');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
}

/**
 * 测试数据库连接并进行简单查询
 */
async function testDatabaseConnection() {
  try {
    // 执行一个简单的查询来测试连接
    const userCount = await prisma.user.count();
    console.log(`数据库连接测试成功，共有 ${userCount} 名用户`);
    
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    
    // 处理特定错误
    if (error instanceof Error) {
      // 表名冲突错误
      if (error.message.includes('relation "api" already exists')) {
        console.error('检测到表名冲突错误，这可能是由Prisma的表命名策略导致的');
        console.error('已添加relationMode="prisma"来处理，但可能需要手动修复数据库');
      }
    }
    
    throw error;
  }
} 