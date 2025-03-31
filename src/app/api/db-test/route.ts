import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 数据库测试端点，返回连接状态和简单的数据统计
export async function GET() {
  try {
    console.log("GET /api/db-test - 开始测试数据库连接");

    // 测试数据库连接
    const start = Date.now();
    await prisma.$connect();
    const connectTime = Date.now() - start;
    console.log(`数据库连接成功，耗时 ${connectTime}ms`);

    // 获取基本数据统计
    const [userCount, toolCount, articleCount] = await Promise.all([
      prisma.user.count(),
      prisma.tool.count(),
      prisma.article.count(),
    ]);

    // 获取数据库连接信息
    const url = process.env.DATABASE_URL || 'Not set';
    const directUrl = process.env.DIRECT_URL || 'Not set';

    // 安全打印数据库URL（隐藏密码）
    const safeUrl = url.replace(/\/\/([^:]+):([^@]+)@/, '//******:******@');
    const safeDirectUrl = directUrl.replace(/\/\/([^:]+):([^@]+)@/, '//******:******@');

    return NextResponse.json({
      status: 'success',
      message: '数据库连接和查询成功',
      connectTime: `${connectTime}ms`,
      stats: {
        users: userCount,
        tools: toolCount,
        articles: articleCount,
      },
      environment: process.env.NODE_ENV,
      databaseInfo: {
        provider: 'postgresql',
        url: safeUrl,
        directUrl: safeDirectUrl,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("数据库连接测试失败:", error);
    return NextResponse.json(
      { 
        status: 'error',
        message: '数据库连接或查询失败',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
} 