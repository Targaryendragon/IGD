import { NextResponse } from 'next/server';
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/user/tools - 获取当前登录用户的工具
export async function GET(request: Request) {
  try {
    console.log("GET /api/user/tools - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    // 获取用户会话
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("GET /api/user/tools - 未授权访问");
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
    
    console.log(`GET /api/user/tools - 查询用户 ${userId} 的工具`);
    
    // 获取用户工具
    const tools = await prisma.tool.findMany({
      where: {
        authorId: userId,
      },
      include: {
        tags: true,
        ratings: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // 计算评分
    const ratings = await prisma.toolRating.groupBy({
      by: ['toolId'],
      where: {
        tool: {
          authorId: userId,
        }
      },
      _avg: {
        rating: true,
      },
    });
    
    // 合并评分信息
    const toolsWithRatings = tools.map(tool => {
      const ratingInfo = ratings.find(r => r.toolId === tool.id);
      return {
        ...tool,
        averageRating: ratingInfo?._avg.rating || 0,
      };
    });
    
    // 获取总数
    const total = await prisma.tool.count({
      where: {
        authorId: userId,
      },
    });
    
    console.log(`GET /api/user/tools - 查询到 ${tools.length} 个工具`);
    
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
    console.error("GET /api/user/tools - 错误:", error);
    return NextResponse.json(
      { error: "获取用户工具失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 

