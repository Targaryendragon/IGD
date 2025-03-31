import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>
  );
} 