import { NextResponse } from 'next/server';
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/users - 获取所有用户（管理员权限）
export async function GET(request: Request) {
  try {
    console.log("GET /api/admin/users - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录并且是管理员
    if (!session || !session.user) {
      console.log("GET /api/admin/users - 未授权访问");
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 检查用户是否为管理员
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      console.log("GET /api/admin/users - 缺少管理员权限");
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    console.log("GET /api/admin/users - 查询用户列表");
    
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
    
    console.log(`GET /api/admin/users - 查询到 ${users.length} 个用户`);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/admin/users - 错误:', error);
    return NextResponse.json(
      { error: '获取用户列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - 更新用户信息（管理员权限）
export async function PATCH(request: Request) {
  try {
    console.log("PATCH /api/admin/users - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const session = await getServerSession(authOptions);
    
    // 检查用户是否登录并且是管理员
    if (!session || !session.user) {
      console.log("PATCH /api/admin/users - 未授权访问");
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 检查用户是否为管理员
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!admin?.isAdmin) {
      console.log("PATCH /api/admin/users - 缺少管理员权限");
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
    
    console.log(`PATCH /api/admin/users - 更新用户 ${id}`);
    
    // 检查要修改的用户是否存在
    const userExists = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    
    if (!userExists) {
      console.log(`PATCH /api/admin/users - 用户 ${id} 不存在`);
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
    
    console.log(`PATCH /api/admin/users - 用户 ${id} 更新成功`);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('PATCH /api/admin/users - 错误:', error);
    return NextResponse.json(
      { error: '更新用户失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 