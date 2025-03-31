import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 数据库测试端点，用于检测和诊断连接问题
export async function GET() {
  try {
    console.log("GET /api/db-test - 开始测试数据库连接");
    console.log("环境:", process.env.NODE_ENV);
    console.log("Vercel环境:", process.env.VERCEL_ENV);
    
    // 输出数据库连接信息（隐藏敏感数据）
    const dbUrl = process.env.DATABASE_URL || 'Not set';
    const dbDirectUrl = process.env.DIRECT_URL || 'Not set';
    console.log("DATABASE_URL是否设置:", Boolean(process.env.DATABASE_URL));
    console.log("DIRECT_URL是否设置:", Boolean(process.env.DIRECT_URL));
    
    // 模拟遮蔽后的URL
    const safeDbUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, '//******:******@');
    console.log("数据库URL:", safeDbUrl);
    
    // 尝试创建一个独立的Prisma客户端实例进行测试
    console.log("创建测试用Prisma客户端...");
    const testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    
    // 测试连接
    console.log("尝试连接到数据库...");
    const start = Date.now();
    await testPrisma.$connect();
    const connectTime = Date.now() - start;
    console.log(`数据库连接成功，耗时 ${connectTime}ms`);
    
    // 尝试执行一个简单查询
    console.log("尝试执行基本查询...");
    const [userCount, toolCount, articleCount] = await Promise.all([
      testPrisma.user.count(),
      testPrisma.tool.count(),
      testPrisma.article.count(),
    ]);
    console.log(`查询结果: ${userCount}个用户, ${toolCount}个工具, ${articleCount}篇文章`);
    
    // 测试特定查询
    console.log("尝试获取工具列表...");
    const tools = await testPrisma.tool.findMany({
      take: 2,
      include: {
        tags: true,
        ratings: true,
      }
    });
    console.log(`成功获取工具，数量: ${tools.length}`);
    
    // 尝试获取文章
    console.log("尝试获取文章列表...");
    const articles = await testPrisma.article.findMany({
      take: 2,
      include: {
        tags: true,
      }
    });
    console.log(`成功获取文章，数量: ${articles.length}`);
    
    // 断开测试客户端
    await testPrisma.$disconnect();
    console.log("测试客户端已断开连接");
    
    return NextResponse.json({
      status: 'success',
      message: '数据库连接和查询测试成功',
      connectTime: `${connectTime}ms`,
      stats: {
        users: userCount,
        tools: toolCount,
        articles: articleCount,
      },
      samples: {
        tools: tools.map(tool => ({
          id: tool.id,
          name: tool.name,
          tagsCount: tool.tags.length,
          ratingsCount: tool.ratings.length,
        })),
        articles: articles.map(article => ({
          id: article.id,
          title: article.title,
          tagsCount: article.tags.length,
        })),
      },
      environment: process.env.NODE_ENV,
      databaseInfo: {
        provider: 'postgresql',
        url: safeDbUrl,
        hasDirectUrl: Boolean(process.env.DIRECT_URL),
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
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
} 