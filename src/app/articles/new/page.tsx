"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// 动态导入组件以避免SSR问题
const Header = dynamic(() => import('../../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../../components/layout/Footer'), { ssr: false });
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// 表单数据接口
interface FormState {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  coverImage: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // 表单状态
  const [formState, setFormState] = useState<FormState>({
    title: '',
    summary: '',
    content: '',
    tags: [],
    coverImage: '',
  });
  
  // 状态控制
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // 检查用户是否已登录
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);
  
  // 处理输入变化
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 处理内容变化（Markdown编辑器）
  const handleContentChange = (value: string | undefined) => {
    setFormState((prev) => ({ ...prev, content: value || '' }));
    
    // 清除内容字段的错误
    if (errors.content) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      });
    }
  };
  
  // 添加标签
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (formState.tags.includes(newTag.trim())) {
      setErrors((prev) => ({ ...prev, tag: '标签已存在' }));
      return;
    }
    
    setFormState((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag('');
    
    // 清除标签字段的错误
    if (errors.tag) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tag;
        return newErrors;
      });
    }
  };
  
  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormState((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };
  
  // 处理按键事件（回车添加标签）
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // 验证表单
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formState.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (!formState.summary.trim()) {
      newErrors.summary = '摘要不能为空';
    }
    
    if (!formState.content.trim()) {
      newErrors.content = '内容不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '提交文章失败');
      }
      
      const data = await response.json();
      router.push(`/articles/${data.slug}`);
    } catch (err: any) {
      console.error('发布文章错误:', err);
      setSubmitError(err.message || '发布文章时出错，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 如果用户未登录，显示加载中
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">发布新文章</h1>
          
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入文章标题"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>
            
            {/* 摘要 */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                摘要 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={3}
                value={formState.summary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="简短介绍文章内容"
              ></textarea>
              {errors.summary && (
                <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
              )}
            </div>
            
            {/* 封面图片 */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                封面图片 URL
              </label>
              <input
                type="text"
                id="coverImage"
                name="coverImage"
                value={formState.coverImage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入图片URL"
              />
            </div>
            
            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
              <div className="flex">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="添加标签"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  添加
                </button>
              </div>
              {errors.tag && (
                <p className="text-red-500 text-sm mt-1">{errors.tag}</p>
              )}
              
              {/* 标签列表 */}
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容 <span className="text-red-500">*</span>
              </label>
              <MDEditor
                value={formState.content}
                onChange={handleContentChange}
                preview="edit"
                height={400}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>
            
            {/* 提交按钮 */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? '发布中...' : '发布文章'}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 