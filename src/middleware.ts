import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 中间件函数，处理所有请求
export function middleware(request: NextRequest) {
  // 设置缓存控制头，禁用缓存
  const response = NextResponse.next({
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
  
  return response;
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/:path*',
    // 匹配主页和其他重要页面
    '/',
    '/profile',
    '/login',
    '/register',
    '/tools',
    '/articles',
  ],
};
