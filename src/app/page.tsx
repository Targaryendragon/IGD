'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const Header = dynamic(() => import('../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../components/layout/Footer'), { ssr: false });

// 定义接口
interface Tag {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
  image?: string;
}

interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags: Tag[];
  icon?: string;
  ratings: { rating: number }[];
  _count: {
    ratings: number;
    comments: number;
  };
}

interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  author: Author;
  tags: Tag[];
  _count: {
    comments: number;
    likes: number;
  };
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [latestTools, setLatestTools] = useState<Tool[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingTools, setLoadingTools] = useState(true);
  const [errorArticles, setErrorArticles] = useState<string | null>(null);
  const [errorTools, setErrorTools] = useState<string | null>(null);

  // 获取最新文章
  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const response = await fetch('/api/articles?limit=4');
        if (!response.ok) {
          throw new Error('获取文章失败');
        }
        const data = await response.json();
        // 确保data.articles是一个数组
        const articlesData = Array.isArray(data.articles) ? data.articles : [];
        setLatestArticles(articlesData);
        
        console.log('获取文章数据成功:', articlesData);
      } catch (error: any) {
        console.error('获取最新文章错误:', error);
        setErrorArticles(error.message);
        setLatestArticles([]); // 确保出错时也设置为空数组
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchLatestArticles();
  }, []);

  // 获取最新工具
  useEffect(() => {
    const fetchLatestTools = async () => {
      try {
        const response = await fetch('/api/tools?limit=4');
        if (!response.ok) {
          throw new Error('获取工具失败');
        }
        const data = await response.json();
        // 确保data.tools是一个数组
        const toolsData = Array.isArray(data.tools) ? data.tools : [];
        setLatestTools(toolsData);
        
        console.log('获取工具数据成功:', toolsData);
      } catch (error: any) {
        console.error('获取最新工具错误:', error);
        setErrorTools(error.message);
        setLatestTools([]); // 确保出错时也设置为空数组
      } finally {
        setLoadingTools(false);
      }
    };

    fetchLatestTools();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow">
        {/* 英雄区域 */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">探索游戏开发的无限可能</h1>
              <p className="text-xl md:text-2xl mb-8">
                在这里发现最新的独立游戏开发工具、技术和资源，与全球独立游戏开发者社区一起成长
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/tools" 
                  className="px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  浏览工具
                </Link>
                <Link 
                  href="/articles" 
                  className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors"
                >
                  阅读文章
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* 最新工具 */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">最新工具</h2>
              <Link href="/tools" className="text-blue-400 hover:text-blue-300">
                查看全部 &rarr;
              </Link>
            </div>
            
            {loadingTools ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-400">加载中...</p>
              </div>
            ) : errorTools ? (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {errorTools}
              </div>
            ) : latestTools.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                暂无工具数据
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestTools.map((tool) => {
                  // 确保tool.ratings存在且为数组
                  const ratings = Array.isArray(tool.ratings) ? tool.ratings : [];
                  // 确保tool.tags存在且为数组
                  const tags = Array.isArray(tool.tags) ? tool.tags : [];
                  // 确保tool._count存在
                  const count = tool._count || { ratings: 0, comments: 0 };
                  
                  return (
                    <Link 
                      key={tool.id} 
                      href={`/tools/${tool.slug || tool.id}`}
                      className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg overflow-hidden">
                            {tool.icon ? (
                              <img
                                src={tool.icon}
                                alt={`${tool.name} icon`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-semibold text-gray-400">
                                {tool.name?.charAt(0) || "?"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const rating = ratings.length 
                                    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length 
                                    : 0;
                                  return (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= rating
                                          ? 'text-yellow-400'
                                          : 'text-gray-600'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  );
                                })}
                              </div>
                              <span className="text-sm text-gray-400">
                                ({count.ratings || 0})
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tool.difficulty === 'BEGINNER' ? 'bg-green-500/20 text-green-400' :
                            tool.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {tool.difficulty === 'BEGINNER' ? '初学者' :
                             tool.difficulty === 'INTERMEDIATE' ? '中级' : '高级'}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-4 line-clamp-2">
                          {tool.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                              {tag.name}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        
        {/* 最新文章 */}
        <section className="py-16 px-4 bg-gray-800">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">最新文章</h2>
              <Link href="/articles" className="text-blue-400 hover:text-blue-300">
                查看全部 &rarr;
              </Link>
            </div>
            
            {loadingArticles ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-400">加载中...</p>
              </div>
            ) : errorArticles ? (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {errorArticles}
              </div>
            ) : latestArticles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                暂无文章数据
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestArticles.map((article) => {
                  // 确保article.tags存在且为数组
                  const tags = Array.isArray(article.tags) ? article.tags : [];
                  // 确保article.author存在
                  const author = article.author || { name: '未知作者', id: '' };
                  // 确保article._count存在
                  const count = article._count || { comments: 0, likes: 0 };
                  
                  return (
                    <Link 
                      key={article.id} 
                      href={`/articles/${article.slug}`}
                      className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
                    >
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tags.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">{article.title}</h3>
                        <p className="text-gray-400 mb-4 line-clamp-3">
                          {article.content ? article.content.substring(0, 150) + '...' : '暂无内容'}
                        </p>
                        <div className="flex items-center mt-auto text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-700 rounded-full overflow-hidden">
                              {author.image && (
                                <img 
                                  src={author.image} 
                                  alt={author.name} 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <span>{author.name}</span>
                          </div>
                          <span className="mx-2">·</span>
                          <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString('zh-CN') : '未知日期'}</span>
                          <div className="flex items-center ml-auto space-x-2">
                            <span>{count.comments} 评论</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 
