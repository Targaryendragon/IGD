import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import getFavicon from 'get-website-favicon';

// GET /api/tools - 获取工具列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { 
      // 如果有搜索关键词，搜索工具名称或描述
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      // 如果有难度筛选
      ...(difficulty && { difficulty }),
    };

    // 查询工具
    const tools = await prisma.tool.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        ratings: true,
        _count: {
          select: {
            ratings: true,
            comments: true,
          },
        },
      },
    });

    // 获取总工具数量
    const total = await prisma.tool.count({ where });

    return NextResponse.json({
      tools,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取工具列表错误:', error);
    return NextResponse.json(
      { message: '获取工具列表失败', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// 从 URL 获取网站图标
async function getWebsiteIcon(url: string): Promise<string | null> {
  try {
    const data = await getFavicon(url);
    if (data && data.icons && data.icons.length > 0) {
      // 优先选择较大尺寸的图标
      const sortedIcons = data.icons.sort((a, b) => {
        const sizeA = a.width || 0;
        const sizeB = b.width || 0;
        return sizeB - sizeA;
      });
      return sortedIcons[0].src;
    }
  } catch (error) {
    console.error('获取网站图标失败:', error);
  }
  return null;
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
    let icon = null;
    if (officialLink) {
      icon = await getWebsiteIcon(officialLink);
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