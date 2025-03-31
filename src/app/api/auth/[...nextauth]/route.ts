import NextAuth from 'next-auth';
import { authOptions } from './auth';

// 设置为动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 创建NextAuth路由处理程序
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };