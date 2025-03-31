import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// GET /api/admin/users - 获取所有用户（管理员权限）
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
    
    // 获取用户列表
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            tools: true,
            articles: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - 更新用户信息（管理员权限）
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
    
    const { id, ...data } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }
    
    // 检查要修改的用户是否存在
    const userExists = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!userExists) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 安全起见，限制可更新的字段
    const allowedFields = ['name', 'isAdmin', 'isVerified'];
    const updateData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});
    
    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isVerified: true,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { error: '更新用户失败' },
      { status: 500 }
    );
  }
} 