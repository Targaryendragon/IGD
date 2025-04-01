import { NextRequest, NextResponse } from 'next/server';

// 记录请求信息的中间件
export async function middleware(request: NextRequest) {
  // 获取请求路径
  const pathname = request.nextUrl.pathname;
  
  // 仅记录API请求
  if (pathname.startsWith('/api/')) {
    // 生成唯一请求ID
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] 开始请求: ${request.method} ${pathname} (ID: ${requestId})`);
    
    // 对于API请求，添加特殊响应头以帮助调试
    const response = NextResponse.next();
    
    // 添加请求跟踪ID
    response.headers.set('X-Request-ID', requestId);
    
    // 添加指示Prisma应该每次创建新实例的头部
    response.headers.set('X-Prisma-New-Instance', '1');
    
    // 允许查看Prisma相关错误
    response.headers.set('X-Prisma-Debug', '1');
    
    // 添加缓存控制头，禁止缓存API响应
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
  
  return NextResponse.next();
}

// 配置匹配路径
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/:path*',
  ],
};
