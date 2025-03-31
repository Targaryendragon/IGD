import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tools/[slug] - 获取单个工具详情
// 注意：当前数据库设计中，工具没有slug字段，所以我们使用ID作为路由参数
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const toolId = params.slug; // 路由参数名为slug，但实际使用ID值

    // 查询工具详情
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            ratings: true,
            favorites: true,
          },
        },
      },
    });

    if (!tool) {
      return NextResponse.json(
        { message: '工具不存在' },
        { status: 404 }
      );
    }

    // 获取平均评分
    const ratings = await prisma.toolRating.findMany({
      where: { toolId },
      select: { rating: true },
    });

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : 0;

    return NextResponse.json({
      ...tool,
      averageRating,
    });
  } catch (error) {
    console.error('获取工具详情错误:', error);
    return NextResponse.json(
      { message: '获取工具详情失败', error: (error as Error).message },
      { status: 500 }
    );
  }
} 