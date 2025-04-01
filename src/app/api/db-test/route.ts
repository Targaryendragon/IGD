import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initializeDatabase } from '@/lib/db-init';
import { initializeApi } from '../api-init';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/db-test - 测试数据库连接
export async function GET() {
  try {
    // 初始化API
    await initializeApi();
    
    console.log('开始测试数据库连接...');
    
    // 初始化数据库连接
    const initResult = await initializeDatabase();
    
    if (!initResult) {
      return NextResponse.json(
        { status: 'error', message: '数据库初始化失败' },
        { status: 500 }
      );
    }
    
    // 获取数据库统计信息
    const stats = {
      users: await prisma.user.count(),
      tools: await prisma.tool.count(),
      articles: await prisma.article.count(),
    };
    
    // 检查数据库版本和配置
    let dbInfo;
    try {
      const result = await prisma.$queryRaw`SELECT version(), current_database()`;
      dbInfo = result;
    } catch (error) {
      console.error('获取数据库信息失败:', error);
      dbInfo = { error: String(error) };
    }
    
    // 检查Prisma查询
    const testQuery = await prisma.user.findFirst({
      select: { id: true },
      take: 1,
    });
    
    return NextResponse.json({
      status: 'success',
      message: '数据库连接正常',
      timestamp: new Date().toISOString(),
      stats,
      dbInfo,
      testQuery: testQuery ? '成功' : '无用户数据',
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? '已配置' : '未配置',
    });
  } catch (error) {
    console.error('数据库测试失败:', error);
    
    let errorMessage = '数据库测试失败';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
      
      // 特殊处理表名冲突错误
      if (error.message.includes('relation "api" already exists')) {
        errorMessage = '数据库表名冲突错误';
        errorDetails = '检测到"api"表已存在，这可能是由Prisma的表命名策略导致的。已添加relationMode="prisma"进行修复。';
      }
    }
    
    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
} 