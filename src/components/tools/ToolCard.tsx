import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@/components/icons/StarIcon';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  rating: number;
  tags: string[];
  slug?: string;
  icon?: string | null;
}

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  BEGINNER: '入门',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
};

const ToolCard: React.FC<ToolCardProps> = ({
  id,
  name,
  description,
  difficulty,
  rating,
  tags,
  slug = '',
  icon,
}) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={icon}
                  alt={`${name} 图标`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-lg font-medium">
                  {name.charAt(0)}
                </span>
              </div>
            )}
            <Link href={`/tools/${slug || id}`} className="hover:underline">
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            </Link>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[difficulty]}`}>
            {difficultyLabels[difficulty]}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-yellow-500 flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  filled={i < Math.floor(rating)} 
                  half={i === Math.floor(rating) && rating % 1 >= 0.5}
                />
              ))}
            </span>
            <span className="text-gray-600 text-sm ml-2">{rating.toFixed(1)}</span>
          </div>
          <Link 
            href={`/tools/${slug || id}`} 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            查看详情 &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ToolCard; 