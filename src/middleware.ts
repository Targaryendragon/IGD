import { NextRequest, NextResponse } from 'next/server';

// 记录请求信息的中间件
export async function middleware(request: NextRequest) {
  // 获取请求路径
  const pathname = request.nextUrl.pathname;
  
  // 仅记录API请求
  if (pathname.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] 请求: ${request.method} ${pathname}`);
    
    // 对于API请求，添加特殊响应头以帮助调试
    const response = NextResponse.next();
    
    // 添加请求跟踪ID
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);
    
    // 允许查看Prisma相关错误
    response.headers.set('X-Prisma-Debug', '1');
    
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
