import React from 'react';
import ToolCard from './ToolCard';

interface ToolsGridProps {
  limit?: number;
  filter?: {
    tag?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    search?: string;
  };
}

// 假数据，实际应用中从API获取
const mockTools = [
  {
    id: '1',
    name: 'Unity3D',
    description: '强大的跨平台游戏引擎，适用于2D和3D游戏开发',
    difficulty: 'INTERMEDIATE' as const,
    rating: 4.7,
    tags: ['引擎', '3D', '2D', 'C#'],
    slug: 'unity3d',
  },
  {
    id: '2',
    name: 'Godot Engine',
    description: '开源免费的游戏引擎，轻量级且功能强大',
    difficulty: 'BEGINNER' as const,
    rating: 4.5,
    tags: ['引擎', '开源', '2D', '3D', 'GDScript'],
    slug: 'godot-engine',
  },
  {
    id: '3',
    name: 'Aseprite',
    description: '专业的像素风格图像和动画编辑器',
    difficulty: 'BEGINNER' as const,
    rating: 4.8,
    tags: ['美术', '像素风', '精灵动画'],
    slug: 'aseprite',
  },
  {
    id: '4',
    name: 'Blender',
    description: '专业级开源3D建模和动画软件',
    difficulty: 'ADVANCED' as const,
    rating: 4.6,
    tags: ['美术', '3D建模', '开源', '动画'],
    slug: 'blender',
  },
  {
    id: '5',
    name: 'FMOD',
    description: '专业级游戏音频中间件和声音引擎',
    difficulty: 'INTERMEDIATE' as const,
    rating: 4.4,
    tags: ['音频', '音效', '中间件'],
    slug: 'fmod',
  },
  {
    id: '6',
    name: 'Tiled Map Editor',
    description: '灵活的瓦片地图编辑器，支持多种游戏引擎',
    difficulty: 'BEGINNER' as const,
    rating: 4.3,
    tags: ['关卡设计', '2D', '瓦片地图'],
    slug: 'tiled-map-editor',
  },
  {
    id: '7',
    name: 'ChatGPT for Game Design',
    description: 'AI辅助游戏设计工具，帮助生成创意和故事情节',
    difficulty: 'BEGINNER' as const,
    rating: 4.0,
    tags: ['AI辅助', '游戏设计', '创意'],
    slug: 'chatgpt-for-game-design',
  },
  {
    id: '8',
    name: 'Spine',
    description: '专业的2D骨骼动画工具',
    difficulty: 'INTERMEDIATE' as const,
    rating: 4.5,
    tags: ['美术', '2D动画', '骨骼动画'],
    slug: 'spine',
  },
];

const ToolsGrid: React.FC<ToolsGridProps> = ({ limit = 8, filter }) => {
  // 实际应用中这里会有数据获取和过滤逻辑
  let displayTools = mockTools;
  
  if (filter) {
    if (filter.tag) {
      displayTools = displayTools.filter(tool => 
        tool.tags.some(tag => tag.toLowerCase().includes(filter.tag!.toLowerCase()))
      );
    }
    
    if (filter.difficulty) {
      displayTools = displayTools.filter(tool => 
        tool.difficulty === filter.difficulty
      );
    }
    
    if (filter.search) {
      displayTools = displayTools.filter(tool => 
        tool.name.toLowerCase().includes(filter.search!.toLowerCase()) ||
        tool.description.toLowerCase().includes(filter.search!.toLowerCase())
      );
    }
  }
  
  // 限制显示数量
  displayTools = displayTools.slice(0, limit);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayTools.map(tool => (
        <ToolCard
          key={tool.id}
          id={tool.id}
          name={tool.name}
          description={tool.description}
          difficulty={tool.difficulty}
          rating={tool.rating}
          tags={tool.tags}
          slug={tool.slug}
        />
      ))}
    </div>
  );
};

export default ToolsGrid; 