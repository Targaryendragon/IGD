import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/user/articles - 获取当前登录用户的文章
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户文章
    const articles = await prisma.article.findMany({
      where: { authorId: user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // 获取总文章数量
    const total = await prisma.article.count({
      where: { authorId: user.id },
    });

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
    console.error('获取用户文章错误:', error);
    return NextResponse.json(
      { error: '获取用户文章失败' },
      { status: 500 }
    );
  }
} 