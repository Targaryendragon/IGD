import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/articles/[slug]/likes - 获取文章点赞数
export async function GET(
  request: Request,
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
    
    // 获取点赞数量
    const likesCount = await prisma.articleLike.count({
      where: { articleId: article.id },
    });
    
    // 获取当前用户是否已点赞
    const session = await getServerSession(authOptions);
    let userLiked = false;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      
      if (user) {
        const like = await prisma.articleLike.findUnique({
          where: {
            userId_articleId: {
              userId: user.id,
              articleId: article.id,
            },
          },
        });
        
        userLiked = !!like;
      }
    }
    
    return NextResponse.json({
      count: likesCount,
      userLiked,
    });
  } catch (error) {
    console.error('获取点赞错误:', error);
    return NextResponse.json(
      { error: '获取点赞数失败' },
      { status: 500 }
    );
  }
}

// POST /api/articles/[slug]/likes - 点赞或取消点赞
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能点赞' },
        { status: 401 }
      );
    }
    
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
    
    // 检查用户是否已点赞
    const existingLike = await prisma.articleLike.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: article.id,
        },
      },
    });
    
    let action;
    
    // 如果已点赞，则取消点赞
    if (existingLike) {
      await prisma.articleLike.delete({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId: article.id,
          },
        },
      });
      action = 'unliked';
    } 
    // 否则创建点赞
    else {
      await prisma.articleLike.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          article: {
            connect: { id: article.id },
          },
        },
      });
      action = 'liked';
    }
    
    // 获取更新后的点赞数量
    const likesCount = await prisma.articleLike.count({
      where: { articleId: article.id },
    });
    
    return NextResponse.json({
      count: likesCount,
      action,
    });
  } catch (error) {
    console.error('点赞处理错误:', error);
    return NextResponse.json(
      { error: '点赞处理失败' },
      { status: 500 }
    );
  }
} 