'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

// Markdown编辑器
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-700 animate-pulse rounded-lg"></div>
  ),
});

interface FormState {
  name: string;
  description: string;
  content: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags: string[];
  officialLink: string;
  downloadLink: string;
}

const NewToolPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({
    name: '',
    description: '',
    content: '',
    difficulty: 'BEGINNER',
    tags: [],
    officialLink: '',
    downloadLink: '',
  });
  
  // 标签输入
  const [tagInput, setTagInput] = useState('');
  
  // 检查登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        setIsLoggedIn(true);
      } catch (error) {
        console.error('检查登录状态错误:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, [router]);
  
  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理Markdown内容变化
  const handleContentChange = (value: string | undefined) => {
    setFormState(prev => ({ ...prev, content: value || '' }));
  };
  
  // 添加标签
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    // 避免重复标签
    if (!formState.tags.includes(tagInput.trim())) {
      setFormState(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
    }
    
    setTagInput('');
  };
  
  // 移除标签
  const removeTag = (tagToRemove: string) => {
    setFormState(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // 处理标签输入回车
  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // 验证必填字段
    if (!formState.name || !formState.description || !formState.content) {
      setError('请填写所有必填字段');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '发布工具失败');
      }
      
      const tool = await response.json();
      router.push(`/tools/${tool.id}`);
    } catch (err: any) {
      console.error('发布工具错误:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="ml-4 text-gray-400">加载中...</p>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">发布新工具</h1>
              <Link 
                href="/tools" 
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
              >
                返回工具列表
              </Link>
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
              {/* 工具名称 */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-300 mb-2">
                  工具名称 <span className="text-red-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
                  required
                />
              </div>
              
              {/* 工具描述 */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-300 mb-2">
                  简短描述 <span className="text-red-400">*</span>
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formState.description}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">
                  最多200个字符，简洁地描述工具的主要功能
                </p>
              </div>
              
              {/* 工具难度 */}
              <div className="mb-4">
                <label htmlFor="difficulty" className="block text-gray-300 mb-2">
                  难度级别 <span className="text-red-400">*</span>
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formState.difficulty}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
                  required
                >
                  <option value="BEGINNER">初级 - 适合新手</option>
                  <option value="INTERMEDIATE">中级 - 需要一定经验</option>
                  <option value="ADVANCED">高级 - 适合专业人士</option>
                </select>
              </div>
              
              {/* 标签 */}
              <div className="mb-4">
                <label htmlFor="tags" className="block text-gray-300 mb-2">
                  标签
                </label>
                <div className="flex">
                  <input
                    id="tagInput"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-l-md px-4 py-2 text-white"
                    placeholder="输入标签，按回车添加"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
                  >
                    添加
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  添加关键词标签，帮助用户更容易找到你的工具
                </p>
                
                {/* 标签显示区域 */}
                {formState.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formState.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-300 hover:text-blue-100"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 官方链接 */}
              <div className="mb-4">
                <label htmlFor="officialLink" className="block text-gray-300 mb-2">
                  官方网站
                </label>
                <input
                  id="officialLink"
                  name="officialLink"
                  type="url"
                  value={formState.officialLink}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
                  placeholder="https://example.com"
                />
              </div>
              
              {/* 下载链接 */}
              <div className="mb-6">
                <label htmlFor="downloadLink" className="block text-gray-300 mb-2">
                  下载链接
                </label>
                <input
                  id="downloadLink"
                  name="downloadLink"
                  type="url"
                  value={formState.downloadLink}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
                  placeholder="https://example.com/download"
                />
              </div>
              
              {/* 详细内容 */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-gray-300 mb-2">
                  详细内容 <span className="text-red-400">*</span>
                </label>
                <div data-color-mode="dark">
                  <MDEditor
                    value={formState.content}
                    onChange={handleContentChange}
                    height={400}
                    preview="edit"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  使用Markdown格式编写工具的详细介绍、功能特点、使用方法等
                </p>
              </div>
              
              {/* 提交按钮 */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? '发布中...' : '发布工具'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewToolPage; 