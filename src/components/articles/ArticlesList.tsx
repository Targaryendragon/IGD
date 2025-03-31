import React from 'react';
import ArticleCard from './ArticleCard';

interface ArticlesListProps {
  limit?: number;
  filter?: {
    tag?: string;
    search?: string;
    sortBy?: 'recent' | 'popular';
  };
}

// 假数据，实际应用中从API获取
const mockArticles = [
  {
    id: '1',
    title: '如何制作一个小型独立游戏 - 从创意到发布',
    slug: 'how-to-make-a-small-indie-game',
    excerpt: '从创意构思、原型设计到最终发布，分享独立游戏开发的全过程经验和教训。',
    authorName: '陈开发',
    authorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    publishedAt: '2023-05-12',
    readTime: 12,
    tags: ['游戏设计', '开发经验', '项目管理'],
    likes: 156,
    comments: 24,
  },
  {
    id: '2',
    title: 'Unity引擎中实现高效的2D角色控制系统',
    slug: 'efficient-2d-character-controller-unity',
    excerpt: '详细讲解如何在Unity中实现一个流畅且可扩展的2D角色控制系统，包含跳跃、冲刺等高级功能。',
    authorName: '李程序',
    authorImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    publishedAt: '2023-04-28',
    readTime: 18,
    tags: ['Unity', '编程', '2D游戏'],
    likes: 234,
    comments: 35,
  },
  {
    id: '3',
    title: '我的Roguelike游戏开发日记 - 月总结',
    slug: 'roguelike-dev-diary-monthly',
    excerpt: '记录过去一个月我在开发像素风Roguelike游戏过程中的挑战和成长，以及解决问题的思路。',
    authorName: '王独立',
    authorImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    publishedAt: '2023-06-01',
    readTime: 8,
    tags: ['开发日记', 'Roguelike', '像素风'],
    likes: 95,
    comments: 12,
  },
  {
    id: '4',
    title: '游戏开发者应该了解的5个AI工具',
    slug: 'ai-tools-for-game-developers',
    excerpt: '介绍5个能够显著提升游戏开发效率的AI工具，从资源生成到测试自动化。',
    authorName: '张智能',
    authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    publishedAt: '2023-05-22',
    readTime: 6,
    tags: ['AI工具', '效率提升', '资源生成'],
    likes: 187,
    comments: 19,
  },
  {
    id: '5',
    title: '独立游戏的营销策略 - 预算有限下的最大影响',
    slug: 'indie-game-marketing-limited-budget',
    excerpt: '在预算有限的情况下，如何制定有效的独立游戏营销策略，从社区建设到发布时机的选择。',
    authorName: '刘营销',
    authorImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    publishedAt: '2023-06-10',
    readTime: 14,
    tags: ['游戏营销', '社区建设', '发布策略'],
    likes: 132,
    comments: 27,
  },
];

const ArticlesList: React.FC<ArticlesListProps> = ({ limit = 10, filter }) => {
  // 实际应用中这里会有数据获取和过滤逻辑
  let displayArticles = mockArticles;
  
  if (filter) {
    if (filter.tag) {
      displayArticles = displayArticles.filter(article => 
        article.tags.some(tag => tag.toLowerCase().includes(filter.tag!.toLowerCase()))
      );
    }
    
    if (filter.search) {
      displayArticles = displayArticles.filter(article => 
        article.title.toLowerCase().includes(filter.search!.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(filter.search!.toLowerCase())
      );
    }
    
    if (filter.sortBy === 'popular') {
      displayArticles.sort((a, b) => b.likes - a.likes);
    } else {
      // 默认按最新排序
      displayArticles.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
  }
  
  // 限制显示数量
  displayArticles = displayArticles.slice(0, limit);
  
  return (
    <div className="space-y-8">
      {displayArticles.map(article => (
        <ArticleCard
          key={article.id}
          id={article.id}
          title={article.title}
          slug={article.slug}
          excerpt={article.excerpt}
          authorName={article.authorName}
          authorImage={article.authorImage}
          publishedAt={article.publishedAt}
          readTime={article.readTime}
          tags={article.tags}
          likes={article.likes}
          comments={article.comments}
        />
      ))}
    </div>
  );
};

export default ArticlesList; 