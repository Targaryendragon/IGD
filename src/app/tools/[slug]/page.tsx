"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MDEditor from '@uiw/react-md-editor';

// 动态导入头部和尾部组件
const Header = dynamic(() => import('../../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../../components/layout/Footer'), { ssr: false });

// 工具详情信息接口
interface ToolDetail {
  id: string;
  name: string;
  content: string;
  description: string;
  difficulty: string;
  officialLink: string | null;
  downloadLink: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  tags: {
    id: string;
    name: string;
    toolId: string;
  }[];
  _count: {
    ratings: number;
    comments?: number;
    favorites?: number;
  };
  averageRating: number;
}

// 评论接口
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
}

// 工具详情页面组件
export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 获取工具ID（在路由中使用slug参数名，但实际上使用的是ID）
  const toolId = params.slug;
  
  // 状态管理
  const [tool, setTool] = useState<ToolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  
  // 加载工具详情
  useEffect(() => {
    async function fetchToolDetail() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/tools/${toolId}`);
        
        if (!response.ok) {
          throw new Error('获取工具详情失败');
        }
        
        const data = await response.json();
        setTool(data);
      } catch (err) {
        console.error('获取工具详情错误:', err);
        setError('无法加载工具详情。请稍后再试。');
      } finally {
        setLoading(false);
      }
    }
    
    if (toolId) {
      fetchToolDetail();
      fetchComments();
    }
  }, [toolId]);
  
  // 如果用户已登录，获取用户的评分
  useEffect(() => {
    async function fetchUserRating() {
      if (status === 'authenticated' && session?.user) {
        try {
          const response = await fetch(`/api/tools/${toolId}/ratings`);
          
          if (response.ok) {
            const data = await response.json();
            setUserRating(data.rating);
          }
        } catch (err) {
          console.error('获取用户评分错误:', err);
        }
      }
    }
    
    if (toolId && status !== 'loading') {
      fetchUserRating();
    }
  }, [toolId, session, status]);
  
  // 加载评论
  async function fetchComments() {
    try {
      const response = await fetch(`/api/tools/${toolId}/comments`);
      
      if (!response.ok) {
        throw new Error('获取评论失败');
      }
      
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('获取评论错误:', err);
    }
  }
  
  // 提交评论
  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setCommentError('评论内容不能为空');
      return;
    }
    
    if (!session?.user) {
      router.push('/api/auth/signin');
      return;
    }
    
    try {
      setCommentError(null);
      
      const response = await fetch(`/api/tools/${toolId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '提交评论失败');
      }
      
      // 重新获取评论
      fetchComments();
      setNewComment('');
    } catch (err: any) {
      console.error('提交评论错误:', err);
      setCommentError(err.message || '提交评论时出错');
    }
  }
  
  // 提交评分
  async function handleRatingSubmit(rating: number) {
    if (!session?.user) {
      router.push('/api/auth/signin');
      return;
    }
    
    try {
      const response = await fetch(`/api/tools/${toolId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      
      if (!response.ok) {
        throw new Error('提交评分失败');
      }
      
      const data = await response.json();
      
      // 更新用户评分和工具平均评分
      setUserRating(data.userRating);
      if (tool) {
        setTool({
          ...tool,
          averageRating: data.averageRating,
        });
      }
    } catch (err) {
      console.error('提交评分错误:', err);
    }
  }
  
  // 显示评分星星
  function renderStars(rating: number, interactive = false) {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={interactive ? () => handleRatingSubmit(star) : undefined}
            size={interactive ? 24 : 20}
          />
        ))}
      </div>
    );
  }
  
  // 加载状态
  if (loading) {
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
  
  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">错误：</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // 未找到工具
  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">未找到工具</h2>
            <p className="mb-4">抱歉，无法找到请求的工具。</p>
            <Link href="/tools" className="text-blue-600 hover:underline">
              返回工具列表
            </Link>
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
        <div className="mb-8">
          <Link href="/tools" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; 返回工具列表
          </Link>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
              <div className="flex items-center">
                <div className="mr-2">
                  <span className="font-medium text-gray-700">
                    {tool.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({tool._count.ratings} 评分)
                  </span>
                </div>
                {renderStars(tool.averageRating)}
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 text-lg mb-2">{tool.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {Array.isArray(tool.tags) && tool.tags.map((tag) => (
                  <span
                    key={tag?.id || Math.random().toString()}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag?.name || '未命名标签'}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">难度级别</h3>
                <p className="text-gray-700">{tool.difficulty}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">创建者</h3>
                <div className="flex items-center">
                  {tool.author && tool.author.image ? (
                    <img
                      src={tool.author.image}
                      alt={tool.author.name || '匿名用户'}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                      <span className="text-gray-600 text-xs">
                        {tool.author && tool.author.name ? tool.author.name[0].toUpperCase() : 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700">{tool.author?.name || '匿名用户'}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">官方链接</h3>
                {tool.officialLink ? (
                  <a
                    href={tool.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    访问官方网站
                  </a>
                ) : (
                  <p className="text-gray-500">未提供</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">下载链接</h3>
                {tool.downloadLink ? (
                  <a
                    href={tool.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    下载工具
                  </a>
                ) : (
                  <p className="text-gray-500">未提供</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">工具详情</h2>
              <div className="prose max-w-none">
                <MDEditor.Markdown source={tool.content} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">用户评分</h2>
            
            {status === 'authenticated' ? (
              <div className="mb-6">
                <p className="text-gray-700 mb-2">你的评分:</p>
                {renderStars(userRating, true)}
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
                    登录
                  </Link>
                  以添加评分
                </p>
              </div>
            )}
            
            <div>
              <div className="flex items-center mb-2">
                <p className="text-gray-700 mr-2">平均评分:</p>
                {renderStars(tool.averageRating || 0)}
                <span className="ml-2 text-gray-600">
                  ({(tool.averageRating || 0).toFixed(1)})
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                基于 {tool._count?.ratings || 0} 位用户的评分
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">评论 ({Array.isArray(comments) ? comments.length : 0})</h2>
            
            {status === 'authenticated' ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="mb-4">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="分享您对这个工具的看法..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  {commentError && (
                    <p className="text-red-500 text-sm mt-1">{commentError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  提交评论
                </button>
              </form>
            ) : (
              <div className="mb-6">
                <p className="text-gray-700">
                  <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
                    登录
                  </Link>
                  以添加评论
                </p>
              </div>
            )}
            
            {Array.isArray(comments) && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment?.id || Math.random().toString()} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start">
                      <div className="mr-3">
                        {comment?.author && comment.author.image ? (
                          <img
                            src={comment.author.image}
                            alt={comment.author.name || '用户'}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600">
                              {comment?.author && comment.author.name ? (comment.author.name[0].toUpperCase()) : 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <p className="font-semibold mr-2">
                            {comment?.author?.name || '匿名用户'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '未知日期'}
                          </p>
                        </div>
                        <p className="text-gray-700">{comment?.content || ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">暂无评论。成为第一个评论者！</p>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 