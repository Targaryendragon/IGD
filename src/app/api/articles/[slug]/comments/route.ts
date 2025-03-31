import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/articles/[slug]/comments - 获取文章评论
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 获取评论
    const comments = await prisma.comment.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('获取评论错误:', error);
    return NextResponse.json(
      { error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// POST /api/articles/[slug]/comments - 添加评论
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能评论' },
        { status: 401 }
      );
    }
    
    const { slug } = params;
    const { content } = await request.json();
    
    // 验证评论内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      );
    }
    
    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
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
    
    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content,
        article: {
          connect: { id: article.id },
        },
        author: {
          connect: { id: user.id },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('添加评论错误:', error);
    return NextResponse.json(
      { error: '添加评论失败' },
      { status: 500 }
    );
  }
} 