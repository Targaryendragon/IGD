import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">页面未找到</h2>
        <div className="text-gray-700 mb-6">
          <p className="mb-2">很抱歉，您访问的页面不存在或已被移除。</p>
        </div>
        <Link 
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
} 