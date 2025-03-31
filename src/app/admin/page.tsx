'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const Header = dynamic(() => import('../../components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('../../components/layout/Footer'), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 检查用户权限
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === 'loading') return;
      
      if (status !== 'authenticated') {
        router.push('/login');
        return;
      }
      
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('获取用户信息失败');
        }
        
        const userData = await response.json();
        
        if (!userData.isAdmin) {
          router.push('/');
          return;
        }
        
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('检查管理员状态错误:', error);
        router.push('/');
      }
    };
    
    checkAdminStatus();
  }, [router, status]);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('获取用户列表错误:', error);
    }
  };

  // 获取工具列表
  const fetchTools = async () => {
    try {
      const response = await fetch('/api/admin/tools');
      if (!response.ok) {
        throw new Error('获取工具列表失败');
      }
      
      const data = await response.json();
      setTools(data);
    } catch (error) {
      console.error('获取工具列表错误:', error);
    }
  };

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/articles');
      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }
      
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('获取文章列表错误:', error);
    }
  };

  // 切换标签页时加载数据
  useEffect(() => {
    if (!isAdmin) return;
    
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'tools') {
      fetchTools();
    } else if (activeTab === 'articles') {
      fetchArticles();
    }
  }, [activeTab, isAdmin]);

  if (loading) {
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
          <h1 className="text-3xl font-bold mb-8">管理员控制面板</h1>
          
          {/* 标签页导航 */}
          <div className="flex border-b border-gray-700 mb-8">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              仪表盘
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('users')}
            >
              用户管理
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'tools' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('tools')}
            >
              工具管理
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'articles' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('articles')}
            >
              文章管理
            </button>
          </div>
          
          {/* 仪表盘 */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">用户统计</h2>
                <p className="text-3xl font-bold text-blue-500">{users.length}</p>
                <p className="text-sm text-gray-400 mt-2">总注册用户数</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                  onClick={() => setActiveTab('users')}
                >
                  管理用户
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">工具统计</h2>
                <p className="text-3xl font-bold text-blue-500">{tools.length}</p>
                <p className="text-sm text-gray-400 mt-2">已发布工具数</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                  onClick={() => setActiveTab('tools')}
                >
                  管理工具
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">文章统计</h2>
                <p className="text-3xl font-bold text-blue-500">{articles.length}</p>
                <p className="text-sm text-gray-400 mt-2">已发布文章数</p>
                <button
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                  onClick={() => setActiveTab('articles')}
                >
                  管理文章
                </button>
              </div>
            </div>
          )}
          
          {/* 用户管理 */}
          {activeTab === 'users' && (
            <div>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">用户名</th>
                      <th className="px-4 py-2 text-left">邮箱</th>
                      <th className="px-4 py-2 text-left">注册时间</th>
                      <th className="px-4 py-2 text-left">管理员</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-gray-700">
                        <td className="px-4 py-2 text-gray-400">{user.id.substring(0, 8)}...</td>
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2 text-gray-400">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${user.isAdmin ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {user.isAdmin ? '是' : '否'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button className="text-blue-500 hover:text-blue-400 mr-2">
                            编辑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* 工具管理 */}
          {activeTab === 'tools' && (
            <div>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">名称</th>
                      <th className="px-4 py-2 text-left">作者</th>
                      <th className="px-4 py-2 text-left">发布时间</th>
                      <th className="px-4 py-2 text-left">评分</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map((tool) => (
                      <tr key={tool.id} className="border-t border-gray-700">
                        <td className="px-4 py-2">{tool.name}</td>
                        <td className="px-4 py-2">{tool.author.name}</td>
                        <td className="px-4 py-2 text-gray-400">{new Date(tool.createdAt).toLocaleDateString('zh-CN')}</td>
                        <td className="px-4 py-2">{tool.averageRating?.toFixed(1) || '暂无'}</td>
                        <td className="px-4 py-2">
                          <Link href={`/tools/${tool.id}`} className="text-blue-500 hover:text-blue-400 mr-2">
                            查看
                          </Link>
                          <button className="text-red-500 hover:text-red-400">
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* 文章管理 */}
          {activeTab === 'articles' && (
            <div>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">标题</th>
                      <th className="px-4 py-2 text-left">作者</th>
                      <th className="px-4 py-2 text-left">发布时间</th>
                      <th className="px-4 py-2 text-left">状态</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id} className="border-t border-gray-700">
                        <td className="px-4 py-2">{article.title}</td>
                        <td className="px-4 py-2">{article.author.name}</td>
                        <td className="px-4 py-2 text-gray-400">{new Date(article.createdAt).toLocaleDateString('zh-CN')}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${article.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {article.published ? '已发布' : '草稿'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Link href={`/articles/${article.slug}`} className="text-blue-500 hover:text-blue-400 mr-2">
                            查看
                          </Link>
                          <button className="text-red-500 hover:text-red-400">
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 