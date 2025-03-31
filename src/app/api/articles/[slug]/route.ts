import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/articles/[slug] - 获取文章详情
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // 查找文章
    const article = await prisma.article.findUnique({
      where: { slug },
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
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 获取是否已点赞（如果用户已登录）
    const session = await getServerSession(authOptions);
    let userLiked = false;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      
      if (user) {
        const like = await prisma.like.findFirst({
          where: {
            userId: user.id,
            articleId: article.id,
          },
        });
        
        userLiked = !!like;
      }
    }
    
    return NextResponse.json({
      ...article,
      userLiked,
    });
  } catch (error) {
    console.error('获取文章详情错误:', error);
    return NextResponse.json(
      { error: '获取文章详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[slug] - 更新文章
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能更新文章' },
        { status: 401 }
      );
    }
    
    const { slug } = params;
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
      select: { id: true, isAdmin: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 查找文章
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 检查权限（必须是作者或管理员）
    if (article.authorId !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: '没有权限修改此文章' },
        { status: 403 }
      );
    }
    
    // 生成新的slug（如果标题变化了）
    let newSlug = slug;
    if (title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .concat(`-${Date.now()}`);
    }
    
    // 更新文章
    // 1. 先删除现有标签关联
    if (tags && tags.length > 0) {
      await prisma.articleTag.deleteMany({
        where: { articleId: article.id },
      });
    }
    
    // 2. 更新文章和创建新的标签关联
    const updatedArticle = await prisma.article.update({
      where: { id: article.id },
      data: {
        title,
        slug: newSlug,
        summary,
        content,
        coverImage: coverImage || null,
        // 创建新的文章标签关联
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
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('更新文章错误:', error);
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[slug] - 删除文章
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能删除文章' },
        { status: 401 }
      );
    }
    
    const { slug } = params;
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 查找文章
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 检查权限（必须是作者或管理员）
    if (article.authorId !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: '没有权限删除此文章' },
        { status: 403 }
      );
    }
    
    // 删除文章（相关的评论、点赞和标签关联会通过外键级联删除）
    await prisma.article.delete({
      where: { id: article.id },
    });
    
    return NextResponse.json(
      { message: '文章已成功删除' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除文章错误:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
} 