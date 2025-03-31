import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * 扩展默认会话类型
   */
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }

  /**
   * 扩展默认用户类型
   */
  interface User {
    id: string;
    isAdmin?: boolean;
  }
}

declare module 'next-auth/jwt' {
  /**
   * 扩展默认JWT类型
   */
  interface JWT {
    id?: string;
    isAdmin?: boolean;
  }
} 