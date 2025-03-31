'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-4">出错了</h2>
        <div className="text-gray-700 mb-6">
          <p className="mb-2">抱歉，页面加载时出现了错误。您可以尝试刷新页面或返回首页。</p>
          {error.message && (
            <p className="text-xs text-gray-500">错误信息: {error.message}</p>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 