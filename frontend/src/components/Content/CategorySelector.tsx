import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CONTENT_CATEGORIES, getActiveCategories, getCategoryById } from '@/constants/categories';

interface CategorySelectorProps {
  selectedCategoryId?: number;
  onCategorySelect?: (categoryId: number) => void;
  showAll?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onCategorySelect,
  showAll = false
}) => {
  const categories = showAll ? CONTENT_CATEGORIES : getActiveCategories();

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      red: 'bg-red-100 text-red-600 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
      pink: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
      indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
      teal: 'bg-teal-100 text-teal-600 hover:bg-teal-200',
      gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  };

  const getIconEmoji = (icon: string) => {
    const iconMap: Record<string, string> = {
      brain: '🧠',
      heart: '❤️',
      user: '👤',
      users: '👥',
      'book-open': '📖',
      headphones: '🎧',
      video: '📹',
      mic: '🎤',
      shield: '🛡️',
      sun: '☀️',
      moon: '🌙',
      star: '⭐',
      leaf: '🍃',
      flower: '🌸',
      compass: '🧭',
      lightbulb: '💡',
      target: '🎯',
      zap: '⚡',
      activity: '📊',
      'trending-up': '📈',
    };
    return iconMap[icon] || '📁';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${selectedCategoryId === category.id 
                  ? `${getColorClass(category.color)} border-current` 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
                }
              `}
              onClick={() => onCategorySelect?.(category.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-lg
                  ${selectedCategoryId === category.id 
                    ? 'bg-white/20' 
                    : getColorClass(category.color)
                  }
                `}>
                  {getIconEmoji(category.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {selectedCategoryId && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Selected Category</h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getColorClass(getCategoryById(selectedCategoryId)?.color || 'gray')}>
                {getIconEmoji(getCategoryById(selectedCategoryId)?.icon || 'folder')}
                {getCategoryById(selectedCategoryId)?.name}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategorySelector;
