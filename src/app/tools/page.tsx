'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';

const Header = dynamic(() => import('../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../components/layout/Footer'), { ssr: false });

interface Tool {
  id: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  icon?: string | null;
  ratings: { rating: number }[];
  tags: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    ratings: number;
  };
}

// 工具难度标签颜色
const difficultyColors = {
  BEGINNER: 'text-green-500 bg-green-500/10',
  INTERMEDIATE: 'text-yellow-500 bg-yellow-500/10',
  ADVANCED: 'text-red-500 bg-red-500/10'
};

// 工具难度中文名称
const difficultyNames = {
  BEGINNER: '初级',
  INTERMEDIATE: '中级',
  ADVANCED: '高级'
};

// 工具卡片组件
const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  // 确保tool.ratings存在且为数组
  const ratings = Array.isArray(tool.ratings) ? tool.ratings : [];
  
  // 确保tool.tags存在且为数组
  const tags = Array.isArray(tool.tags) ? tool.tags : [];
  
  // 确保tool._count存在
  const count = tool._count || { ratings: 0 };
  
  // 计算平均评分
  const averageRating = ratings.length
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
    : 0;

  // 计算评分星星
  const renderStars = (rating: number) => {
    const stars: JSX.Element[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-600'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Link href={`/tools/${tool.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {tool.icon ? (
              <Image
                src={tool.icon}
                alt={`${tool.name} icon`}
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                {tool.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {renderStars(averageRating)}
              </div>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({count.ratings || 0})
              </span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-3 mb-4">
          {tool.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag.id} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs rounded-full ${difficultyColors[tool.difficulty] || 'text-gray-500 bg-gray-500/10'}`}>
            {difficultyNames[tool.difficulty] || '未知难度'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function ToolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [activeCategory, setActiveCategory] = useState('全部');

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      try {
        // 构建API URL
        let url = '/api/tools';
        const params = new URLSearchParams();
        
        if (difficulty) {
          params.append('difficulty', difficulty);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('获取工具列表失败');
        }
        
        const data = await response.json();
        
        // 确保data.tools是一个数组
        const toolsData = Array.isArray(data.tools) ? data.tools : [];
        setTools(toolsData);
        
        console.log('获取工具数据成功:', toolsData);
      } catch (err) {
        console.error('获取工具错误:', err);
        setError(err instanceof Error ? err.message : '未知错误');
        setTools([]); // 确保出错时设置为空数组
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, [difficulty]);

  // 处理分类点击
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    
    if (category === '全部') {
      setDifficulty('');
      router.push('/tools');
    } else if (category === '初级') {
      setDifficulty('BEGINNER');
      router.push('/tools?difficulty=BEGINNER');
    } else if (category === '中级') {
      setDifficulty('INTERMEDIATE');
      router.push('/tools?difficulty=INTERMEDIATE');
    } else if (category === '高级') {
      setDifficulty('ADVANCED');
      router.push('/tools?difficulty=ADVANCED');
    }
  };
  
  return (
    <>
      <Header />
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">游戏开发工具</h1>
            
            {/* 工具分类 */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                className={`px-4 py-2 ${activeCategory === '全部' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} rounded-full text-sm font-medium`}
                onClick={() => handleCategoryClick('全部')}
              >
                全部
              </button>
              <button 
                className={`px-4 py-2 ${activeCategory === '初级' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} rounded-full text-sm font-medium`}
                onClick={() => handleCategoryClick('初级')}
              >
                初级
              </button>
              <button 
                className={`px-4 py-2 ${activeCategory === '中级' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} rounded-full text-sm font-medium`}
                onClick={() => handleCategoryClick('中级')}
              >
                中级
              </button>
              <button 
                className={`px-4 py-2 ${activeCategory === '高级' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'} rounded-full text-sm font-medium`}
                onClick={() => handleCategoryClick('高级')}
              >
                高级
              </button>
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

            {/* 没有工具提示 */}
            {!loading && !error && tools.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                暂无工具数据
              </div>
            )}

            {/* 工具列表 */}
            {!loading && !error && tools.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
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
