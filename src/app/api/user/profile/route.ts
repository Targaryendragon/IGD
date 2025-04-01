import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/user/profile - 获取当前登录用户的信息
export async function GET() {
  try {
    console.log("GET /api/user/profile - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("GET /api/user/profile - 未授权访问");
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    const email = session.user.email;
    console.log(`GET /api/user/profile - 查询用户: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email: email || "" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            tools: true,
            articles: true,
          },
        },
      },
    });
    
    if (!user) {
      console.log("GET /api/user/profile - 用户不存在");
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    console.log(`GET /api/user/profile - 成功获取用户信息`);
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user/profile - 错误:", error);
    return NextResponse.json(
      { error: "获取用户信息失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - 更新当前登录用户的信息
export async function PUT(request: Request) {
  try {
    console.log("PUT /api/user/profile - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("PUT /api/user/profile - 未授权访问");
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    console.log("PUT /api/user/profile - 更新数据:", JSON.stringify(data));
    
    const { name, bio, image } = data;
    
    // 验证更新数据
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "用户名不能为空" },
        { status: 400 }
      );
    }
    
    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email || "" },
      data: {
        name,
        bio,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
      },
    });
    
    console.log(`PUT /api/user/profile - 成功更新用户信息`);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /api/user/profile - 错误:", error);
    return NextResponse.json(
      { error: "更新用户信息失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 
