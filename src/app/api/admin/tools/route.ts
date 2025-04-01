import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma, ensureDatabaseConnection } from '@/lib/prisma';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/tools - 获取所有工具（管理员权限）
export async function GET(request: Request) {
  try {
    console.log("GET /api/admin/tools - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("GET /api/admin/tools - 未授权访问");
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 检查管理员权限
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      console.log("GET /api/admin/tools - 缺少管理员权限");
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(status ? { status: status } : {}),
    };
    
    console.log(`GET /api/admin/tools - 查询工具列表，页码: ${page}, 状态: ${status || '全部'}, 关键词: ${search || '无'}`);
    
    // 查询工具
    const tools = await prisma.tool.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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
    });
    
    // 获取总数
    const total = await prisma.tool.count({ where });
    
    console.log(`GET /api/admin/tools - 查询到 ${tools.length} 个工具`);
    
    return NextResponse.json({
      tools,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/tools - 错误:", error);
    return NextResponse.json(
      { error: '获取工具列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tools - 更新工具状态（管理员权限）
export async function PUT(request: Request) {
  try {
    console.log("PUT /api/admin/tools - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("PUT /api/admin/tools - 未授权访问");
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 检查管理员权限
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      console.log("PUT /api/admin/tools - 缺少管理员权限");
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    // 解析请求体
    const data = await request.json();
    const { id, status } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: '工具ID不能为空' },
        { status: 400 }
      );
    }
    
    if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: '无效的工具状态' },
        { status: 400 }
      );
    }
    
    console.log(`PUT /api/admin/tools - 更新工具 ${id} 状态为 ${status}`);
    
    // 更新工具状态
    const updatedTool = await prisma.tool.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    console.log(`PUT /api/admin/tools - 工具 ${id} 状态更新成功`);
    
    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error("PUT /api/admin/tools - 错误:", error);
    return NextResponse.json(
      { error: '更新工具状态失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tools - 删除工具（管理员权限）
export async function DELETE(request: Request) {
  try {
    console.log("DELETE /api/admin/tools - 开始处理请求");
    
    // 确保数据库连接已建立
    await ensureDatabaseConnection();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("DELETE /api/admin/tools - 未授权访问");
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 检查管理员权限
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });
    
    if (!user?.isAdmin) {
      console.log("DELETE /api/admin/tools - 缺少管理员权限");
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }
    
    // 解析请求
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '工具ID不能为空' },
        { status: 400 }
      );
    }
    
    console.log(`DELETE /api/admin/tools - 删除工具 ${id}`);
    
    // 删除工具
    await prisma.tool.delete({
      where: { id },
    });
    
    console.log(`DELETE /api/admin/tools - 工具 ${id} 删除成功`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/tools - 错误:", error);
    return NextResponse.json(
      { error: '删除工具失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 