'use client';

import React, { useState, useEffect } from 'react';
import { BoardBackground } from '@/types';
import { X, Search, Palette, Image, Grid, Loader2 } from 'lucide-react';

interface BoardBackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (background: BoardBackground) => void;
  currentBackground?: BoardBackground;
}

// Predefined colors
const COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632', '#89609e', '#cd5a91',
  '#4bbf6b', '#00aecc', '#838c91', '#026aa7', '#8f6a00', '#3d6b00',
  '#8b2635', '#5c4c9a', '#b3479d', '#2d8f47', '#0099cc', '#626f86'
];

// Predefined gradients
const GRADIENTS = [
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Cosmic', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Ice', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
];

// Pattern options
const PATTERNS = [
  { name: 'Dots', value: 'dots' },
  { name: 'Grid', value: 'grid' },
  { name: 'Diagonal', value: 'diagonal' },
] as const;

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  description?: string;
}

export const BoardBackgroundSelector: React.FC<BoardBackgroundSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentBackground,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'gradients' | 'patterns' | 'unsplash'>('colors');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedPattern, setSelectedPattern] = useState<'dots' | 'grid' | 'diagonal'>('dots');
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [unsplashQuery, setUnsplashQuery] = useState('nature');
  const [loadingUnsplash, setLoadingUnsplash] = useState(false);

  // Mock Unsplash API call (replace with actual API)
  const searchUnsplash = async (query: string) => {
    setLoadingUnsplash(true);
    try {
      // This is a mock implementation
      // In a real app, you'd call the Unsplash API here
      const mockImages: UnsplashImage[] = [
        {
          id: '1',
          urls: {
            small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
          },
          user: {
            name: 'John Doe',
            username: 'johndoe',
            links: { html: 'https://unsplash.com/@johndoe' },
          },
          description: 'Beautiful mountain landscape',
        },
        {
          id: '2',
          urls: {
            small: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
            regular: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
            full: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
          },
          user: {
            name: 'Jane Smith',
            username: 'janesmith',
            links: { html: 'https://unsplash.com/@janesmith' },
          },
          description: 'Forest path',
        },
        {
          id: '3',
          urls: {
            small: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
            regular: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
            full: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
          },
          user: {
            name: 'Bob Wilson',
            username: 'bobwilson',
            links: { html: 'https://unsplash.com/@bobwilson' },
          },
          description: 'Ocean waves',
        },
      ];
      
      setUnsplashImages(mockImages);
    } catch (error) {
      console.error('Error fetching Unsplash images:', error);
    } finally {
      setLoadingUnsplash(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'unsplash') {
      searchUnsplash(unsplashQuery);
    }
  }, [activeTab, unsplashQuery]);

  const handleColorSelect = (color: string) => {
    onSelect({
      type: 'color',
      value: color,
    });
  };

  const handleGradientSelect = (gradient: { name: string; value: string }) => {
    onSelect({
      type: 'gradient',
      value: gradient.value,
    });
  };

  const handlePatternSelect = (pattern: 'dots' | 'grid' | 'diagonal') => {
    onSelect({
      type: 'pattern',
      value: selectedColor,
      pattern,
    });
  };

  const handleUnsplashSelect = (image: UnsplashImage) => {
    onSelect({
      type: 'unsplash',
      value: image.urls.regular,
      unsplashId: image.id,
      unsplashUrl: image.urls.regular,
      unsplashCredit: {
        name: image.user.name,
        username: image.user.username,
        profileUrl: image.user.links.html,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Choose Background
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'gradients', label: 'Gradients', icon: Palette },
            { id: 'patterns', label: 'Patterns', icon: Grid },
            { id: 'unsplash', label: 'Photos', icon: Image },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'colors' && (
            <div className="grid grid-cols-6 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all
                    ${currentBackground?.type === 'color' && currentBackground.value === color
                      ? 'border-blue-500 scale-105'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}

          {activeTab === 'gradients' && (
            <div className="grid grid-cols-3 gap-4">
              {GRADIENTS.map((gradient) => (
                <button
                  key={gradient.name}
                  onClick={() => handleGradientSelect(gradient)}
                  className={`
                    aspect-video rounded-lg border-2 transition-all relative overflow-hidden
                    ${currentBackground?.type === 'gradient' && currentBackground.value === gradient.value
                      ? 'border-blue-500 scale-105'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }
                  `}
                  style={{ background: gradient.value }}
                >
                  <div className="absolute inset-0 flex items-end p-2">
                    <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                      {gradient.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-6">
              {/* Color selector for patterns */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Base Color
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`
                        aspect-square rounded border-2 transition-all
                        ${selectedColor === color
                          ? 'border-blue-500 scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }
                      `}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Pattern selector */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Pattern
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {PATTERNS.map((pattern) => (
                    <button
                      key={pattern.value}
                      onClick={() => handlePatternSelect(pattern.value)}
                      className={`
                        aspect-video rounded-lg border-2 transition-all relative
                        ${currentBackground?.type === 'pattern' && 
                          currentBackground.pattern === pattern.value &&
                          currentBackground.value === selectedColor
                          ? 'border-blue-500 scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }
                        board-pattern-${pattern.value}
                      `}
                      style={{ backgroundColor: selectedColor }}
                    >
                      <div className="absolute inset-0 flex items-end p-2">
                        <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                          {pattern.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'unsplash' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Images */}
              {loadingUnsplash ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {unsplashImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => handleUnsplashSelect(image)}
                      className={`
                        aspect-video rounded-lg border-2 transition-all relative overflow-hidden
                        ${currentBackground?.type === 'unsplash' && currentBackground.unsplashId === image.id
                          ? 'border-blue-500 scale-105'
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        }
                      `}
                    >
                      <img
                        src={image.urls.small}
                        alt={image.description || 'Unsplash photo'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end p-2">
                        <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                          by {image.user.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Unsplash attribution */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Photos provided by{' '}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Unsplash
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 