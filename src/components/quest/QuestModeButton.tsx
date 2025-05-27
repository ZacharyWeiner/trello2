import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Sparkles, Crown, Star } from 'lucide-react';
import { QuestModeManager } from './QuestModeManager';
import { Board, List, Card } from '@/types';

interface QuestModeButtonProps {
  board: Board;
  lists: List[];
  cards: Card[];
  userId: string;
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuestModeButton: React.FC<QuestModeButtonProps> = ({
  board,
  lists,
  cards,
  userId,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const [isQuestModeActive, setIsQuestModeActive] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getButtonContent = () => {
    if (variant === 'icon') {
      return (
        <div className="flex items-center justify-center">
          <Sword className={iconSizes[size]} />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Sword className={iconSizes[size]} />
        <span className="font-bold">Quest Mode</span>
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  };

  const getButtonClasses = () => {
    const baseClasses = `
      relative overflow-hidden rounded-lg font-medium transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      ${sizeClasses[size]}
    `;

    if (variant === 'primary') {
      return `
        ${baseClasses}
        bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600
        hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700
        text-white shadow-lg hover:shadow-xl
        border border-purple-500/20
      `;
    }

    if (variant === 'secondary') {
      return `
        ${baseClasses}
        bg-white border-2 border-purple-300 text-purple-700
        hover:bg-purple-50 hover:border-purple-400
        shadow-md hover:shadow-lg
        cursor-pointer
      `;
    }

    if (variant === 'icon') {
      return `
        ${baseClasses}
        bg-gradient-to-r from-purple-600 to-blue-600
        hover:from-purple-700 hover:to-blue-700
        text-white shadow-lg hover:shadow-xl
        w-10 h-10 rounded-full
        border border-purple-500/20
      `;
    }

    return baseClasses;
  };

  const handleClick = () => {
    console.log('Quest Mode button clicked!');
    setIsQuestModeActive(true);
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        className={`${getButtonClasses()} ${className} cursor-pointer relative hover:scale-105 active:scale-95 transition-transform`}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        title="Launch Quest Mode - Transform your project into an epic adventure!"
        style={{ pointerEvents: 'auto', zIndex: 10 }}
      >
        {/* Button content */}
        <div className="relative z-10 pointer-events-none">
          {getButtonContent()}
        </div>
      </motion.button>

      {/* Quest Mode Manager */}
      <QuestModeManager
        board={board}
        lists={lists}
        cards={cards}
        userId={userId}
        isActive={isQuestModeActive}
        onClose={() => setIsQuestModeActive(false)}
      />
    </>
  );
}; 