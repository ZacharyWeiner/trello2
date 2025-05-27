'use client';

import React from 'react';
import { Achievement } from '@/types';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = false,
  isNew = false,
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl'
  };

  const rarityColors = {
    common: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      shadow: 'shadow-gray-400/20',
      glow: ''
    },
    rare: {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      shadow: 'shadow-blue-400/30',
      glow: 'shadow-lg shadow-blue-400/20'
    },
    epic: {
      bg: 'bg-purple-100',
      border: 'border-purple-400',
      shadow: 'shadow-purple-400/30',
      glow: 'shadow-lg shadow-purple-400/30'
    },
    legendary: {
      bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
      border: 'border-yellow-500',
      shadow: 'shadow-yellow-400/40',
      glow: 'shadow-xl shadow-yellow-400/40 animate-pulse'
    }
  };

  const colors = rarityColors[achievement.rarity];
  const isUnlocked = achievement.unlockedAt !== undefined;
  const progress = achievement.progress || 0;
  const maxProgress = achievement.maxProgress || achievement.criteria.target;
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={isNew ? { scale: 0, rotate: -180 } : false}
      animate={isNew ? { scale: 1, rotate: 0 } : false}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <button
        onClick={onClick}
        className={`
          relative ${sizeClasses[size]} rounded-full flex items-center justify-center
          ${isUnlocked ? colors.bg : 'bg-gray-200'}
          ${isUnlocked ? colors.border : 'border-gray-400'}
          ${isUnlocked ? colors.glow : ''}
          border-2 transition-all duration-300
          ${isUnlocked ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-60'}
          ${isNew ? 'ring-4 ring-yellow-400 ring-opacity-60 animate-bounce' : ''}
        `}
      >
        <span className={`${isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </span>
        
        {/* Progress ring for locked achievements */}
        {!isUnlocked && showProgress && progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-300"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progressPercentage / 100)}`}
              className="text-blue-500 transition-all duration-500"
            />
          </svg>
        )}
        
        {/* Progress text */}
        {!isUnlocked && showProgress && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
            {progress}/{maxProgress}
          </div>
        )}
      </button>
      
      {/* New badge indicator */}
      {isNew && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white text-xs font-bold">!</span>
        </motion.div>
      )}
      
      {/* Rarity indicator */}
      {isUnlocked && size !== 'sm' && (
        <div className={`
          absolute -bottom-2 left-1/2 transform -translate-x-1/2
          text-xs font-medium px-2 py-0.5 rounded-full
          ${achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
            achievement.rarity === 'epic' ? 'bg-purple-500 text-white' :
            achievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'}
        `}>
          {achievement.rarity}
        </div>
      )}
    </motion.div>
  );
}; 