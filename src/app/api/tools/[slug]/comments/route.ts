import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/tools/[slug]/comments - 获取工具评论
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const toolId = params.slug; // 路由参数名为slug，但实际使用ID值
    
    // 确保只获取此工具的评论
    const comments = await prisma.comment.findMany({
      where: { 
        toolId
      },
      include: {
        author: { // 使用author以匹配数据库模型
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { 
        createdAt: 'desc' 
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

// POST /api/tools/[slug]/comments - 添加评论
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
        { error: '需要登录才能评论' },
        { status: 401 }
      );
    }
    
    const toolId = params.slug; // 路由参数名为slug，但实际使用ID值
    const { content } = await request.json();
    
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: '评论内容不能为空' },
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
    
    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: user.id } }, // 使用author以匹配数据库模型
        tool: { connect: { id: toolId } },
      },
      include: {
        author: { // 使用author以匹配数据库模型
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
    console.error('创建评论错误:', error);
    return NextResponse.json(
      { error: '创建评论失败' },
      { status: 500 }
    );
  }
} 