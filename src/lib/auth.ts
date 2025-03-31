import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';

// 检查用户是否为管理员
export async function isAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return false;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });
  
  return !!user?.isAdmin;
}

// 获取当前用户ID
export async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  
  return user?.id || null;
}

// 检查用户是否已登录
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

// 获取当前登录用户信息
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      createdAt: true,
    },
  });
  
  return user;
} 