'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../components/layout/Footer'), { ssr: false });

// 文章卡片组件
const ArticleCard = ({ article }) => {
  return (
    <article className="bg-gray-800 rounded-lg p-6 hover:ring-2 hover:ring-blue-500 transition-all">
      <div className="flex flex-wrap gap-2 mb-3">
        {article.tags.map((tag) => (
          <span key={tag.id} className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">
            {tag.name}
          </span>
        ))}
      </div>
      
      <Link href={`/articles/${article.slug}`}>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-400 cursor-pointer">
          {article.title}
        </h2>
      </Link>
      
      <p className="text-gray-400 mb-4">
        {article.content.length > 150 
          ? `${article.content.substring(0, 150)}...` 
          : article.content}
      </p>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
              {article.author.image && (
                <img 
                  src={article.author.image} 
                  alt={article.author.name || '作者头像'} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-gray-300">{article.author.name || '匿名用户'}</span>
          </div>
          <span className="text-gray-500">
            {new Date(article.createdAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <span>评论: {article._count.comments}</span>
          <span>点赞: {article._count.likes}</span>
        </div>
      </div>
    </article>
  );
};

export default function ArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [activeCategory, setActiveCategory] = useState('全部');
  
  // 获取所有标签
  const [tags, setTags] = useState([
    '全部', '游戏设计', '编程技术', '美术资源', '音效配乐'
  ]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // 构建API URL
        let url = '/api/articles';
        const params = new URLSearchParams();
        
        if (tag && tag !== '全部') {
          params.append('tag', tag);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('获取文章列表失败');
        }
        
        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        console.error('获取文章错误:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [tag]);

  // 处理分类点击
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    
    if (category === '全部') {
      setTag('');
      router.push('/articles');
    } else {
      setTag(category);
      router.push(`/articles?tag=${encodeURIComponent(category)}`);
    }
  };

  return (
    <>
      <Header />
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">技术文章</h1>
            
            {/* 文章分类 */}
            <div className="flex flex-wrap gap-4 mb-8">
              {tags.map((categoryTag) => (
                <button
                  key={categoryTag}
                  className={`px-4 py-2 ${activeCategory === categoryTag ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} rounded-full text-sm font-medium`}
                  onClick={() => handleCategoryClick(categoryTag)}
                >
                  {categoryTag}
                </button>
              ))}
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

            {/* 没有文章提示 */}
            {!loading && !error && articles.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                暂无文章数据
              </div>
            )}

            {/* 文章列表 */}
            {!loading && !error && articles.length > 0 && (
              <div className="space-y-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 