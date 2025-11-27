import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface AudioThumbnailProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AudioThumbnail: React.FC<AudioThumbnailProps> = ({
  src,
  alt,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleImageError = () => {
    console.warn(`Failed to load audio thumbnail: ${src}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`Successfully loaded audio thumbnail: ${src}`);
    setImageError(false);
    setImageLoading(false);
  };

  // Show fallback if no src, image error, or still loading and error occurred
  const showFallback = !src || imageError;

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden relative ${className}`}>
      {src && !imageError && (
        <>
          <img
            src={src}
            alt={alt}
            className={`${sizeClasses[size]} object-cover rounded-lg shadow-sm transition-opacity duration-200 ${
              imageLoading ? 'opacity-50' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          {imageLoading && (
            <div className={`${sizeClasses[size]} absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center`}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}
        </>
      )}
      
      {showFallback && (
        <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm ${
          src && imageLoading ? 'absolute inset-0' : ''
        }`}>
          <Volume2 className={iconSizes[size]} />
        </div>
      )}
    </div>
  );
};

export default AudioThumbnail;
