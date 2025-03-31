import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/articles - 获取文章列表
export async function GET(request: Request) {
  try {
    console.log("GET /api/articles - 开始处理请求");
    
    // 确保每次查询前重新连接，防止prepared statement错误
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }
    
    // 计算总数
    const total = await prisma.article.count({ where });
    
    // 获取文章
    const articles = await prisma.article.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
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
    
    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    
    console.log(`GET /api/articles - 查询到 ${articles.length} 个文章`);
    
    // 断开连接防止连接积累
    await prisma.$disconnect();
    
    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      total,
      message: `成功获取 ${articles.length} 个文章`
    });
  } catch (error) {
    console.error("GET /api/articles - 错误:", error);
    
    // 确保出错时也断开连接
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("断开连接时出错:", disconnectError);
    }
    
    return NextResponse.json(
      { error: "获取文章列表失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/articles - 创建新文章
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能发布文章' },
        { status: 401 }
      );
    }
    
    // 获取请求数据
    const { title, summary, content, tags, coverImage } = await request.json();
    
    // 验证必填字段
    if (!title || !summary || !content) {
      return NextResponse.json(
        { error: '标题、摘要和内容不能为空' },
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
    
    // 生成slug（使用标题转换为URL友好格式）
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')  // 移除特殊字符
      .replace(/\s+/g, '-')     // 空格转换为连字符
      .concat(`-${Date.now()}`); // 添加时间戳确保唯一性
    
    // 创建文章
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImage: coverImage || null,
        author: {
          connect: { id: user.id },
        },
        // 创建文章标签关联
        tags: tags && tags.length > 0
          ? {
              create: tags.map((tagName: string) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
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
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('创建文章错误:', error);
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
} 