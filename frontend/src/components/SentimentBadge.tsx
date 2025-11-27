
import React from 'react';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment, size = 'md' }) => {
  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'positive':
        return {
          emoji: '😃',
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Positive'
        };
      case 'negative':
        return {
          emoji: '😠',
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Negative'
        };
      default:
        return {
          emoji: '😐',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Neutral'
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = getSentimentConfig();

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default SentimentBadge;
