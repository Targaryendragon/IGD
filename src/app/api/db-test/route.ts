import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  // 创建一个隔离的 Prisma 客户端实例
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // 尝试连接数据库并查询
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      testResult: result,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
      // 添加更详细的错误信息，但隐藏敏感数据
      errorType: error.constructor.name,
      prismaErrorCode: error.code,
      // 安全地返回 URL 的一部分
      dbUrlStart: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:***@***` : 'not set',
    }, { status: 500 });
  } finally {
    // 关闭 Prisma 连接
    await prisma.$disconnect();
  }
} 