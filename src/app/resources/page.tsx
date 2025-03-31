import React from 'react';
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">开发资源</h1>
      <p className="text-lg text-gray-600 mb-6">
        发现优质的游戏开发资源，包括素材包、音效库、模型、纹理和更多帮助您开发游戏的资源。
      </p>

      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索资源..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">所有类型</option>
                <option value="精灵表">精灵表</option>
                <option value="3D模型">3D模型</option>
                <option value="音效">音效</option>
                <option value="音乐">音乐</option>
                <option value="纹理">纹理</option>
                <option value="字体">字体</option>
              </select>
              <select className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">所有授权</option>
                <option value="免费">免费</option>
                <option value="付费">付费</option>
                <option value="CC0">CC0</option>
                <option value="CC-BY">CC-BY</option>
              </select>
              <button className="btn-primary">筛选</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* 资源卡片1 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs rounded">免费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Kenney游戏素材包</h3>
            <p className="text-gray-500 text-sm mb-3">超过40,000个游戏资源的免费集合</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">精灵表</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">3D模型</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音效</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">CC0 授权</span>
              <Link 
                href="https://kenney.nl/assets" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 资源卡片2 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs rounded">付费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">游戏开发市场</h3>
            <p className="text-gray-500 text-sm mb-3">优质游戏美术资源的精选市场</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">GUI</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">精灵表</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">背景</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">商业授权</span>
              <Link 
                href="https://gamedevmarket.net/" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 资源卡片3 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs rounded">免费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Freesound</h3>
            <p className="text-gray-500 text-sm mb-3">协作数据库，包含数百万个音效和音乐</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音效</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音乐</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">环境音</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">多种授权</span>
              <Link 
                href="https://freesound.org/" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 资源卡片4 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs rounded">付费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Humble Bundle 游戏开发包</h3>
            <p className="text-gray-500 text-sm mb-3">定期更新的游戏开发资源超值套装</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">工具</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">素材包</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">模型</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">商业授权</span>
              <Link 
                href="https://www.humblebundle.com/" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 资源卡片5 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs rounded">免费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">OpenGameArt</h3>
            <p className="text-gray-500 text-sm mb-3">自由许可的游戏美术资源社区</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">精灵</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">纹理</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音乐</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">多种授权</span>
              <Link 
                href="https://opengameart.org/" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 资源卡片6 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs rounded">付费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">itch.io 游戏素材</h3>
            <p className="text-gray-500 text-sm mb-3">独立开发者创建的众多游戏资源</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">素材包</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">模板</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音效</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">多种授权</span>
              <Link 
                href="https://itch.io/game-assets" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 资源卡片7 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs rounded">免费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Mixkit</h3>
            <p className="text-gray-500 text-sm mb-3">高质量免费视频、音效和音乐资源</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音效</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音乐</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">视频</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">免费商用</span>
              <Link 
                href="https://mixkit.co/" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 资源卡片8 */}
        <div className="card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gray-200 relative">
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs rounded">付费</div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Envato Elements</h3>
            <p className="text-gray-500 text-sm mb-3">订阅式创意资源库，包括游戏资源</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">GUI</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">纹理</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">音乐</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">商业授权</span>
              <Link 
                href="https://elements.envato.com/" 
                target="_blank"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                访问网站 &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex">
          <button className="px-4 py-2 border border-gray-300 rounded-l-md bg-white text-gray-700 hover:bg-gray-50">
            上一页
          </button>
          <button className="px-4 py-2 border-t border-b border-gray-300 bg-primary-50 text-primary-700">
            1
          </button>
          <button className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            3
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-r-md bg-white text-gray-700 hover:bg-gray-50">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
} 