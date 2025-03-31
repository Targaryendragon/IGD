import { NextResponse } from 'next/server';

export async function GET() {
  // 不返回敏感信息，仅返回是否存在
  return NextResponse.json({
    environment: process.env.NODE_ENV || 'unknown',
    database_url_exists: !!process.env.DATABASE_URL,
    nextauth_secret_exists: !!process.env.NEXTAUTH_SECRET,
    nextauth_url_exists: !!process.env.NEXTAUTH_URL,
    database_url_start: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set',
  });
} 