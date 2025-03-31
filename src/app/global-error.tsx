'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh">
      <body>
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
          <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">系统错误</h2>
            <p className="text-gray-700 mb-6">
              抱歉，系统遇到了意外错误。我们的技术团队已经收到通知。
            </p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 