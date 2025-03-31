'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Header = dynamic(() => import('../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../components/layout/Footer'), { ssr: false });

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: string;
  _count: {
    tools: number;
    articles: number;
  };
}

interface Tool {
  id: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  createdAt: string;
  tags: { id: string; name: string }[];
  averageRating: number;
  _count: {
    ratings: number;
    comments: number;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  tags: { id: string; name: string }[];
  _count: {
    comments: number;
    likes: number;
  };
}

// 工具卡片组件
const ToolCard = ({ tool }: { tool: Tool }) => {
  // 工具难度显示
  const difficultyColors = {
    BEGINNER: 'text-green-500 bg-green-500/10',
    INTERMEDIATE: 'text-yellow-500 bg-yellow-500/10',
    ADVANCED: 'text-red-500 bg-red-500/10'
  };
  
  const difficultyNames = {
    BEGINNER: '初级',
    INTERMEDIATE: '中级',
    ADVANCED: '高级'
  };

  return (
    <Link 
      href={`/tools/${tool.id}`}
      className="block bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${difficultyColors[tool.difficulty]}`}>
            {difficultyNames[tool.difficulty]}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{tool.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.slice(0, 3).map((tag) => (
            <span key={tag.id} className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">
              {tag.name}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">
              +{tool.tags.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>评分: {tool.averageRating.toFixed(1)}</span>
          <span>{new Date(tool.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </Link>
  );
};

// 文章卡片组件
const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Link 
      href={`/articles/${article.slug}`}
      className="block bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">{article.title}</h3>
          {!article.published && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
              草稿
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag.id} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded-full">
              {tag.name}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded-full">
              +{article.tags.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <div className="flex space-x-3">
            <span>{article._count.comments} 评论</span>
            <span>{article._count.likes} 点赞</span>
          </div>
          <span>{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </Link>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 表单状态
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // 用户工具和文章
  const [tools, setTools] = useState<Tool[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const [articlesError, setArticlesError] = useState<string | null>(null);

  // 获取用户资料
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/user/profile');
        if (response.status === 401) {
          // 未登录，重定向到登录页
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error('获取用户资料失败');
        }
        
        const data = await response.json();
        setUser(data);
        // 初始化表单状态
        setName(data.name || '');
        setBio(data.bio || '');
      } catch (err: any) {
        console.error('获取用户资料错误:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [router]);

  // 获取用户工具
  useEffect(() => {
    const fetchUserTools = async () => {
      if (!user || user._count.tools === 0) return;
      
      setLoadingTools(true);
      try {
        const response = await fetch('/api/user/tools?limit=3');
        if (!response.ok) {
          throw new Error('获取工具失败');
        }
        
        const data = await response.json();
        setTools(data.tools);
      } catch (err: any) {
        console.error('获取用户工具错误:', err);
        setToolsError(err.message);
      } finally {
        setLoadingTools(false);
      }
    };
    
    fetchUserTools();
  }, [user]);

  // 获取用户文章
  useEffect(() => {
    const fetchUserArticles = async () => {
      if (!user || user._count.articles === 0) return;
      
      setLoadingArticles(true);
      try {
        const response = await fetch('/api/user/articles?limit=3');
        if (!response.ok) {
          throw new Error('获取文章失败');
        }
        
        const data = await response.json();
        setArticles(data.articles);
      } catch (err: any) {
        console.error('获取用户文章错误:', err);
        setArticlesError(err.message);
      } finally {
        setLoadingArticles(false);
      }
    };
    
    fetchUserArticles();
  }, [user]);

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          bio,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新资料失败');
      }
      
      const updatedUser = await response.json();
      setUser({
        ...user!,
        name: updatedUser.name,
        bio: updatedUser.bio,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error('更新用户资料错误:', err);
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">个人资料</h1>
            
            {/* 加载状态 */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-400">加载中...</p>
              </div>
            )}
            
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {/* 用户资料 */}
            {!loading && !error && user && (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {/* 资料头部 */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                  <div className="flex items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden mr-6 flex-shrink-0">
                      {user.image ? (
                        <img 
                          src={user.image} 
                          alt={user.name || '用户头像'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                          {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{user.name || '未设置昵称'}</h2>
                      <p className="text-blue-200">{user.email}</p>
                      <div className="flex mt-2 space-x-2">
                        {user.isAdmin && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                            管理员
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                            已验证
                          </span>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium"
                      >
                        编辑资料
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 资料内容 */}
                <div className="p-6">
                  {isEditing ? (
                    // 编辑表单
                    <form onSubmit={handleSubmit}>
                      {submitError && (
                        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                          {submitError}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-300 mb-2">
                          昵称
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="bio" className="block text-gray-300 mb-2">
                          个人简介
                        </label>
                        <textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white min-h-[100px]"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setName(user.name || '');
                            setBio(user.bio || '');
                          }}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? '保存中...' : '保存更改'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    // 显示资料
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">个人简介</h3>
                        <p className="text-gray-300">
                          {user.bio || '暂无个人简介'}
                        </p>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">统计信息</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-2xl font-bold">{user._count.tools}</div>
                            <div className="text-gray-400">发布的工具</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-2xl font-bold">{user._count.articles}</div>
                            <div className="text-gray-400">发布的文章</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">账号信息</h3>
                        <div className="text-gray-300">
                          <p className="mb-2">
                            <span className="text-gray-400">注册时间：</span>
                            {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 工具部分 */}
            {!loading && !error && user && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">我的工具</h2>
                  <Link href="/tools/new" className="text-blue-400 hover:text-blue-300">
                    创建新工具
                  </Link>
                </div>
                
                {user._count.tools === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400 mb-4">你还没有发布过工具</p>
                    <Link
                      href="/tools/new"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium inline-block"
                    >
                      发布新工具
                    </Link>
                  </div>
                ) : loadingTools ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent mb-2"></div>
                    <p className="text-gray-400">加载工具列表中...</p>
                  </div>
                ) : toolsError ? (
                  <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                    {toolsError}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                    {tools.length < user._count.tools && (
                      <Link
                        href="/tools?author=me"
                        className="flex items-center justify-center bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors"
                      >
                        <span className="text-gray-300">查看全部 {user._count.tools} 个工具</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* 文章部分 */}
            {!loading && !error && user && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">我的文章</h2>
                  <Link href="/articles/new" className="text-blue-400 hover:text-blue-300">
                    创建新文章
                  </Link>
                </div>
                
                {user._count.articles === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400 mb-4">你还没有发布过文章</p>
                    <Link
                      href="/articles/new"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium inline-block"
                    >
                      发布新文章
                    </Link>
                  </div>
                ) : loadingArticles ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent mb-2"></div>
                    <p className="text-gray-400">加载文章列表中...</p>
                  </div>
                ) : articlesError ? (
                  <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                    {articlesError}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                    {articles.length < user._count.articles && (
                      <Link
                        href="/articles?author=me"
                        className="flex items-center justify-center bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors"
                      >
                        <span className="text-gray-300">查看全部 {user._count.articles} 篇文章</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 