import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/user/tools - 获取当前登录用户的工具
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

    // 获取用户工具
    const tools = await prisma.tool.findMany({
      where: { authorId: user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        _count: {
          select: {
            ratings: true,
            comments: true,
          },
        },
      },
    });

    // 获取工具评分
    const toolIds = tools.map(tool => tool.id);
    const ratings = await prisma.toolRating.groupBy({
      by: ['toolId'],
      where: { toolId: { in: toolIds } },
      _avg: { rating: true },
    });

    // 合并评分信息
    const toolsWithRatings = tools.map(tool => {
      const toolRating = ratings.find(r => r.toolId === tool.id);
      return {
        ...tool,
        averageRating: toolRating?._avg.rating || 0,
      };
    });

    // 获取总工具数量
    const total = await prisma.tool.count({
      where: { authorId: user.id },
    });

    return NextResponse.json({
      tools: toolsWithRatings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取用户工具错误:', error);
    return NextResponse.json(
      { error: '获取用户工具失败' },
      { status: 500 }
    );
  }
} 