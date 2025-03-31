import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/tools/[slug]/ratings - 获取用户对工具的评分
// 注意：当前数据库设计中，工具没有slug字段，所以我们使用ID作为路由参数
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能获取评分信息' },
        { status: 401 }
      );
    }
    
    const toolId = params.slug; // 路由参数名为slug，但实际使用ID值
    
    // 检查工具是否存在
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true },
    });
    
    if (!tool) {
      return NextResponse.json(
        { error: '工具不存在' },
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
    
    // 查询用户评分
    const userRating = await prisma.toolRating.findUnique({
      where: {
        userId_toolId: {
          userId: user.id,
          toolId,
        },
      },
    });
    
    return NextResponse.json({
      rating: userRating?.rating || 0,
    });
  } catch (error) {
    console.error('获取评分错误:', error);
    return NextResponse.json(
      { error: '获取评分失败' },
      { status: 500 }
    );
  }
}

// POST /api/tools/[slug]/ratings - 评分
// 注意：当前数据库设计中，工具没有slug字段，所以我们使用ID作为路由参数
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '需要登录才能评分' },
        { status: 401 }
      );
    }
    
    const toolId = params.slug; // 路由参数名为slug，但实际使用ID值
    const { rating } = await request.json();
    
    // 验证评分
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '评分必须是1到5之间的数字' },
        { status: 400 }
      );
    }
    
    // 检查工具是否存在
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true },
    });
    
    if (!tool) {
      return NextResponse.json(
        { error: '工具不存在' },
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
    
    // 添加或更新评分
    const userRating = await prisma.toolRating.upsert({
      where: {
        userId_toolId: {
          userId: user.id,
          toolId,
        },
      },
      update: { rating },
      create: {
        rating,
        user: { connect: { id: user.id } },
        tool: { connect: { id: toolId } },
      },
    });
    
    // 获取平均评分
    const ratings = await prisma.toolRating.findMany({
      where: { toolId },
      select: { rating: true },
    });
    
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    
    return NextResponse.json({
      userRating: userRating.rating,
      averageRating,
    });
  } catch (error) {
    console.error('评分错误:', error);
    return NextResponse.json(
      { error: '评分失败' },
      { status: 500 }
    );
  }
} 