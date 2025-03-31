'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('../../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../../components/layout/Footer'), { ssr: false });

// 定义文章类型接口
interface Author {
  id: string;
  name: string;
  image?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

interface Tag {
  id: string;
  name: string;
}

interface ArticleDetail {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: Author;
  tags: Tag[];
  comments: Comment[];
  _count: {
    comments: number;
    likes: number;
  };
}

// 评论组件
const CommentForm = ({ slug, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        setIsLoggedIn(!!session.user);
      } catch (err) {
        console.error('检查登录状态失败:', err);
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('评论内容不能为空');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '发表评论失败');
      }
      
      const comment = await response.json();
      setContent('');
      onCommentAdded(comment);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAuth) {
    return <div className="text-center py-4 text-gray-400">正在检查登录状态...</div>;
  }
  
  if (!isLoggedIn) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-300 mb-4">您需要登录后才能发表评论</p>
        <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white inline-block">
          登录
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的评论..."
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          required
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? '发表中...' : '发表评论'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default function ArticleDetail() {
  const params = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticleDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/${params.slug}`);
      if (!response.ok) {
        throw new Error('获取文章详情失败');
      }
      const data = await response.json();
      // 确保 comments 和 tags 属性存在
      data.comments = data.comments || [];
      data.tags = data.tags || [];
      setArticle(data);
    } catch (err: any) {
      console.error('获取文章详情错误:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) {
      fetchArticleDetail();
    }
  }, [params.slug]);

  // 处理新评论添加
  const handleCommentAdded = (newComment) => {
    if (article) {
      setArticle({
        ...article,
        comments: [newComment, ...article.comments],
        _count: {
          ...article._count,
          comments: article._count.comments + 1
        }
      });
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            {/* 面包屑导航 */}
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
              <Link href="/" className="hover:text-white">首页</Link>
              <span>/</span>
              <Link href="/articles" className="hover:text-white">文章</Link>
              <span>/</span>
              <span className="text-white">{article?.title || '加载中...'}</span>
            </div>

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

            {/* 文章详情 */}
            {!loading && !error && article && (
              <article>
                {/* 文章头部 */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags && article.tags.map((tag) => (
                      <Link 
                        key={tag.id} 
                        href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                        className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full hover:bg-blue-500/20 transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                        {article.author.image && (
                          <img 
                            src={article.author.image} 
                            alt={article.author.name || '作者头像'} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-gray-300 font-medium">{article.author.name || '匿名用户'}</div>
                        <div className="text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-400 ml-auto">
                      <span>{article._count.comments} 评论</span>
                      <span>{article._count.likes} 点赞</span>
                    </div>
                  </div>
                </div>
                
                {/* 文章内容 */}
                <div className="prose prose-invert max-w-none mb-12">
                  {article.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                
                {/* 评论部分 */}
                <div className="border-t border-gray-800 pt-8">
                  <h2 className="text-xl font-semibold mb-6">
                    评论 ({article._count.comments})
                  </h2>
                  
                  {/* 评论表单 */}
                  <div className="mb-8">
                    <CommentForm slug={params.slug} onCommentAdded={handleCommentAdded} />
                  </div>
                  
                  {!article.comments || article.comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      暂无评论，成为第一个评论的人吧！
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {article.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                              {comment.author.image ? (
                                <img 
                                  src={comment.author.image} 
                                  alt={comment.author.name} 
                                  className="w-8 h-8 object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium">{comment.author.name?.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{comment.author.name}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 