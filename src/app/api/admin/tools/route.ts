import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/admin/tools - 获取所有工具（管理员权限）
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
    
    // 获取所有工具
    const tools = await prisma.tool.findMany({
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
            ratings: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // 获取工具评分
    const toolIds = tools.map(tool => tool.id);
    const ratings = await prisma.toolRating.groupBy({
      by: ['toolId'],
      where: { toolId: { in: toolIds } },
      _avg: { rating: true },
    });
    
    // 合并评分信息
    const toolsWithRatings = tools.map(tool => {
      const toolRating = ratings.find(r => r.toolId === tool.id);
      return {
        ...tool,
        averageRating: toolRating?._avg.rating || 0,
      };
    });
    
    return NextResponse.json(toolsWithRatings);
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return NextResponse.json(
      { error: '获取工具列表失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tools - 删除工具（管理员权限）
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
        { error: '缺少工具ID' },
        { status: 400 }
      );
    }
    
    // 检查工具是否存在
    const toolExists = await prisma.tool.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!toolExists) {
      return NextResponse.json(
        { error: '工具不存在' },
        { status: 404 }
      );
    }
    
    // 删除相关评分和评论
    await prisma.toolRating.deleteMany({
      where: { toolId: id },
    });
    
    await prisma.comment.deleteMany({
      where: { toolId: id },
    });
    
    await prisma.favorite.deleteMany({
      where: { toolId: id },
    });
    
    await prisma.toolTag.deleteMany({
      where: { toolId: id },
    });
    
    // 删除工具
    await prisma.tool.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: '工具已成功删除'
    });
  } catch (error) {
    console.error('删除工具失败:', error);
    return NextResponse.json(
      { error: '删除工具失败' },
      { status: 500 }
    );
  }
} 