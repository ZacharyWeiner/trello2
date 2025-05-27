'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Search, Clock, Heart, ThumbsUp, Zap } from 'lucide-react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position?: { x: number; y: number };
}

// Popular emojis organized by category
const EMOJI_CATEGORIES = {
  recent: ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'],
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢'
  ],
  gestures: [
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
    '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🤜',
    '🤛', '✊', '👊', '🤚', '👋', '🤟', '✌️', '🤞'
  ],
  hearts: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '♥️', '💯', '💢', '💥', '💫'
  ],
  objects: [
    '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
    '⭐', '🌟', '💫', '✨', '🔥', '💥', '⚡', '💯',
    '💢', '💨', '💦', '💤', '🕳️', '💣', '💬', '👁️‍🗨️'
  ]
};

const CATEGORY_ICONS = {
  recent: Clock,
  smileys: Smile,
  gestures: ThumbsUp,
  hearts: Heart,
  objects: Zap
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  position
}) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recent-emojis');
      return stored ? JSON.parse(stored) : EMOJI_CATEGORIES.recent;
    }
    return EMOJI_CATEGORIES.recent;
  });
  
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEmojiClick = (emoji: string) => {
    // Add to recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 8);
    setRecentEmojis(newRecent);
    localStorage.setItem('recent-emojis', JSON.stringify(newRecent));
    
    onEmojiSelect(emoji);
    onClose();
  };

  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES).flat().filter(emoji => 
        // Simple emoji search - in a real app you'd want emoji names/keywords
        emoji.includes(searchQuery)
      )
    : activeCategory === 'recent' 
      ? recentEmojis 
      : EMOJI_CATEGORIES[activeCategory];

  if (!isOpen) return null;

  const pickerStyle = position 
    ? { 
        position: 'fixed' as const, 
        left: position.x, 
        top: position.y,
        zIndex: 1000
      }
    : {};

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-96 overflow-hidden"
        style={pickerStyle}
      >
        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search emojis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {Object.keys(EMOJI_CATEGORIES).map((category) => {
              const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                  className={`flex-1 p-2 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    activeCategory === category 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="h-4 w-4 mx-auto" />
                </button>
              );
            })}
          </div>
        )}

        {/* Emoji Grid */}
        <div className="p-2 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                         rounded transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          {filteredEmojis.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Smile className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No emojis found</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 