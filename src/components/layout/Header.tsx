'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            IGD社区
          </Link>

          {/* 主导航 */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/tools" className="text-gray-300 hover:text-white transition-colors">
              开发工具
            </Link>
            <Link href="/articles" className="text-gray-300 hover:text-white transition-colors">
              技术文章
            </Link>
          </nav>

          {/* 用户操作 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="search"
                placeholder="搜索..."
                className="w-40 px-4 py-1 text-sm bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:border-blue-500 text-gray-300"
              />
            </div>
            
            {status === 'authenticated' && session ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                    {session.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name || '用户头像'} 
                        width={32} 
                        height={32} 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        {session.user?.name?.charAt(0) || '游'}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-300 hover:text-white transition-colors hidden sm:block">
                    {session.user?.name || '用户'}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      个人资料
                    </Link>
                    {session.user?.isAdmin && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        管理面板
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 pb-4 md:hidden">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-300 hover:text-white">首页</Link>
              <Link href="/tools" className="text-gray-300 hover:text-white">开发工具</Link>
              <Link href="/articles" className="text-gray-300 hover:text-white">社区文章</Link>
            </nav>
            <div className="mt-4 flex flex-col space-y-2">
              {status !== 'authenticated' && (
                <div className="flex space-x-2">
                  <Link href="/login" className="py-2 px-4 text-sm bg-gray-800 text-white rounded flex-1 text-center">登录</Link>
                  <Link href="/register" className="py-2 px-4 text-sm bg-blue-600 text-white rounded flex-1 text-center">注册</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 