import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/admin/articles - 获取所有文章（管理员权限）
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录并且是管理员
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录' },
        { status: 401 }
      );
    }
    
    // 检查用户是否为管理员
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    // 获取所有文章
    const articles = await prisma.article.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/articles - 更新文章状态（管理员权限）
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录并且是管理员
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录' },
        { status: 401 }
      );
    }
    
    // 检查用户是否为管理员
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!admin?.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    const { id, published } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    // 检查文章是否存在
    const articleExists = await prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!articleExists) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 更新文章状态
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { published },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
      },
    });
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('更新文章状态失败:', error);
    return NextResponse.json(
      { error: '更新文章状态失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles - 删除文章（管理员权限）
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录并且是管理员
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录' },
        { status: 401 }
      );
    }
    
    // 检查用户是否为管理员
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!admin?.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    // 检查文章是否存在
    const articleExists = await prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!articleExists) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 删除相关评论、点赞等
    await prisma.comment.deleteMany({
      where: { articleId: id },
    });
    
    await prisma.like.deleteMany({
      where: { articleId: id },
    });
    
    await prisma.favorite.deleteMany({
      where: { articleId: id },
    });
    
    await prisma.articleTag.deleteMany({
      where: { articleId: id },
    });
    
    // 删除文章
    await prisma.article.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: '文章已成功删除'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
}