import { NextResponse } from 'next/server';
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/user/articles - 获取当前登录用户的文章
export async function GET(request: Request) {
  try {
    console.log("GET /api/user/articles - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("GET /api/user/articles - 未授权访问");
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    const userId = session.user.id;
    
    console.log(`GET /api/user/articles - 查询用户 ${userId} 的文章`);
    
    // 获取用户文章
    const articles = await prisma.article.findMany({
      where: {
        authorId: userId,
      },
      include: {
        tags: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // 获取总数
    const total = await prisma.article.count({
      where: {
        authorId: userId,
      },
    });
    
    console.log(`GET /api/user/articles - 查询到 ${articles.length} 篇文章`);
    
    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/user/articles - 错误:", error);
    return NextResponse.json(
      { error: "获取用户文章失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 