import { NextResponse } from 'next/server';
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import getFavicon from 'get-website-favicon';
import { getWebsiteIcon } from '@/lib/utils/website';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/tools - 获取工具列表
export async function GET(request: Request) {
  try {
    console.log("GET /api/tools - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const featured = searchParams.get('featured') === 'true';
    
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {};
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (featured) {
      where.featured = true;
    }
    
    console.log("查询条件:", JSON.stringify(where));
    
    // 计算总数
    const total = await prisma.tool.count({ where });
    console.log(`找到符合条件的工具总数: ${total}`);
    
    // 获取工具列表
    const tools = await prisma.tool.findMany({
      where,
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
    
    // 计算平均评分
    const toolsWithRatings = tools.map(tool => {
      const ratings = tool.ratings || [];
      const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
      
      // 移除ratings数组以减少响应大小
      const { ratings: _, ...toolWithoutRatings } = tool;
      
      return {
        ...toolWithoutRatings,
        averageRating: Math.round(averageRating * 10) / 10, // 保留一位小数
      };
    });
    
    console.log(`GET /api/tools - 查询到 ${tools.length} 个工具`);
    return NextResponse.json({
      tools: toolsWithRatings,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: `成功获取 ${tools.length} 个工具`
    });
  } catch (error) {
    console.error("GET /api/tools - 错误:", error);
    
    return NextResponse.json(
      { error: "获取工具列表失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/tools - 创建新工具
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能发布工具' },
        { status: 401 }
      );
    }
    
    // 获取请求数据
    const { name, description, content, difficulty, officialLink, downloadLink, tags } = await request.json();
    
    // 验证必填字段
    if (!name || !description || !content || !difficulty) {
      return NextResponse.json(
        { error: '名称、描述、内容和难度级别不能为空' },
        { status: 400 }
      );
    }
    
    // 查找用户
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

    // 获取网站图标
    let icon: string | undefined = undefined;
    if (officialLink) {
      const iconUrl = await getWebsiteIcon(officialLink);
      if (iconUrl) {
        icon = iconUrl;
      }
    }
    
    // 创建工具
    const tool = await prisma.tool.create({
      data: {
        name,
        description,
        content,
        difficulty,
        officialLink,
        downloadLink,
        icon,
        author: {
          connect: { id: user.id },
        },
        // 创建工具标签关联
        tags: tags && tags.length > 0
          ? {
              create: tags.map((name: string) => ({
                name,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
      },
    });
    
    return NextResponse.json(tool);
  } catch (error) {
    console.error('创建工具错误:', error);
    return NextResponse.json(
      { error: '创建工具失败' },
      { status: 500 }
    );
  }
} 