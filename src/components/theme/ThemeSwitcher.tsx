'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Sunset, 
  Zap, 
  Waves, 
  Star, 
  Circle,
  Check,
  X,
  Sparkles
} from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  category: 'light' | 'dark' | 'vibrant';
}

const themes: Theme[] = [
  {
    id: 'dawn',
    name: 'Dawn',
    description: 'Warm sunrise gradients with energetic oranges and pinks',
    icon: <Sun className="h-5 w-5" />,
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 50%, #ffcc02 100%)',
    preview: {
      primary: '#ff6b6b',
      secondary: '#ffa726',
      accent: '#ffcc02'
    },
    category: 'light'
  },
  {
    id: 'zenith',
    name: 'Zenith',
    description: 'Bold, high-contrast blues and purples for productivity',
    icon: <Zap className="h-5 w-5" />,
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3f51b5 100%)',
    preview: {
      primary: '#1e3c72',
      secondary: '#2a5298',
      accent: '#3f51b5'
    },
    category: 'light'
  },
  {
    id: 'dusk',
    name: 'Dusk',
    description: 'Sophisticated teals and indigos for evening use',
    icon: <Waves className="h-5 w-5" />,
    gradient: 'linear-gradient(135deg, #004d40 0%, #00695c 50%, #00897b 100%)',
    preview: {
      primary: '#004d40',
      secondary: '#00695c',
      accent: '#00897b'
    },
    category: 'light'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep, rich darks with jewel-tone accents',
    icon: <Moon className="h-5 w-5" />,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    preview: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#533483'
    },
    category: 'dark'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Experimental gradients with unexpected color combinations',
    icon: <Star className="h-5 w-5" />,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    preview: {
      primary: '#667eea',
      secondary: '#f093fb',
      accent: '#4facfe'
    },
    category: 'vibrant'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Elegant grayscale with single accent color',
    icon: <Circle className="h-5 w-5" />,
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #5d6d7e 100%)',
    preview: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#3498db'
    },
    category: 'light'
  }
];

interface ThemeSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  isOpen,
  onClose,
  currentTheme = 'dawn',
  onThemeChange
}) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'light' | 'dark' | 'vibrant'>('all');

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    onThemeChange?.(themeId);
    
    // Force immediate re-render of all components
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  const handleThemePreview = (themeId: string | null) => {
    setPreviewTheme(themeId);
    if (themeId) {
      applyTheme(themeId);
    } else {
      applyTheme(selectedTheme);
    }
  };

  const applyTheme = (themeId: string) => {
    document.documentElement.setAttribute('data-theme', themeId);
    
    // Store theme preference
    localStorage.setItem('preferred-theme', themeId);
  };

  const filteredThemes = themes.filter(theme => 
    filterCategory === 'all' || theme.category === filterCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'vibrant':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col"
        style={{
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Design System Themes</h2>
              <p className="text-sm opacity-75">
                Choose from 6 carefully crafted color palettes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            style={{ 
              background: 'transparent',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Filter */}
        <div 
          className="p-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-secondary)' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium opacity-75">Filter by category:</span>
            {(['all', 'light', 'dark', 'vibrant'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  filterCategory === category
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredThemes.map((theme) => (
                <motion.div
                  key={theme.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedTheme === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleThemeSelect(theme.id)}
                  onMouseEnter={() => handleThemePreview(theme.id)}
                  onMouseLeave={() => handleThemePreview(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Theme Preview */}
                  <div className="mb-4">
                    <div
                      className="h-24 rounded-lg mb-3 relative overflow-hidden"
                      style={{ background: theme.gradient }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                    </div>
                    
                    {/* Color Swatches */}
                    <div className="flex gap-2 justify-center">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.preview.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.preview.secondary }}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {theme.icon}
                        <h3 className="font-semibold text-lg">{theme.name}</h3>
                      </div>
                      {selectedTheme === theme.id && (
                        <div className="p-1 bg-blue-500 rounded-full">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm opacity-75 leading-relaxed">
                      {theme.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(theme.category)}
                      <span className="text-xs uppercase tracking-wide opacity-60 font-medium">
                        {theme.category}
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-6 border-t flex-shrink-0"
          style={{ 
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-tertiary)'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-sm opacity-75">
              <p>
                <strong>Current theme:</strong> {themes.find(t => t.id === selectedTheme)?.name}
              </p>
              <p className="mt-1">
                Themes automatically adapt to mobile, tablet, and desktop layouts
              </p>
            </div>
            
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  applyTheme(selectedTheme);
                  onThemeChange?.(selectedTheme);
                  // Force immediate re-render
                  setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                  }, 100);
                  onClose();
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Apply Theme
              </button>
              <button
                onClick={() => {
                  applyTheme(currentTheme);
                  setSelectedTheme(currentTheme);
                  onClose();
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Hook for theme management
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('dawn');

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'midnight' : 'dawn';
      setCurrentTheme(defaultTheme);
      document.documentElement.setAttribute('data-theme', defaultTheme);
    }
  }, []);

  const changeTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('preferred-theme', themeId);
  };

  return {
    currentTheme,
    changeTheme,
    themes
  };
}; 