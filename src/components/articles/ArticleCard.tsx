import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  authorImage: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  likes: number;
  comments: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  slug,
  excerpt,
  authorName,
  authorImage,
  publishedAt,
  readTime,
  tags,
  likes,
  comments,
}) => {
  const formattedDate = new Date(publishedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, 3).map((tag, index) => (
            <Link 
              key={index} 
              href={`/articles?tag=${encodeURIComponent(tag)}`}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200"
            >
              {tag}
            </Link>
          ))}
        </div>
        
        <Link href={`/articles/${slug}`} className="hover:underline">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        </Link>
        
        <p className="text-gray-600 mb-4">{excerpt}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 relative rounded-full overflow-hidden mr-3">
              <Image 
                src={authorImage} 
                alt={authorName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{authorName}</p>
              <p className="text-xs text-gray-500">
                {formattedDate} · {readTime} 分钟阅读
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-xs">{likes}</span>
            </div>
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
              </svg>
              <span className="text-xs">{comments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard; 