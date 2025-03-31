'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../components/layout/Footer'), { ssr: false });

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 检查URL参数，显示注册成功消息
    if (searchParams?.get('registered')) {
      setSuccess('注册成功！请登录您的账号。');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('请输入邮箱和密码');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        // 登录成功，重定向到首页
        router.push('/');
        router.refresh(); // 刷新页面以更新登录状态
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('登录失败，请稍后再试');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('第三方登录错误:', error);
      setError('第三方登录失败，请稍后再试');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              欢迎回来
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              还没有账号？
              <Link href="/register" className="font-medium text-blue-500 hover:text-blue-400">
                立即注册
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  邮箱地址
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="邮箱地址"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="密码"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 bg-gray-800 border-gray-700 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">
                  记住我
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-500 hover:text-blue-400">
                  忘记密码？
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">或者使用</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <span className="text-gray-300">GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <span className="text-gray-300">Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
} 