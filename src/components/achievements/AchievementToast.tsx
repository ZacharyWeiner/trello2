'use client';

import React, { useEffect } from 'react';
import { Achievement } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';

interface AchievementToastProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  onCelebrate?: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  isVisible,
  onClose,
  onCelebrate
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000); // Auto-close after 8 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const rarityGradients = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-500'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${rarityGradients[achievement.rarity]} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <span className="font-bold text-lg">Achievement Unlocked!</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AchievementBadge
                    achievement={{ ...achievement, unlockedAt: new Date() }}
                    size="lg"
                    isNew={true}
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">+{achievement.points} points</span>
                    </div>
                    
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                        achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'}
                    `}>
                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    onCelebrate?.();
                    onClose();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Celebrate! 🎉
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cool, thanks!
                </button>
              </div>
            </div>

            {/* Confetti animation for legendary achievements */}
            {achievement.rarity === 'legendary' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400"
                    initial={{
                      x: Math.random() * 400,
                      y: -10,
                      rotate: 0
                    }}
                    animate={{
                      y: 400,
                      rotate: Math.random() * 360,
                      transition: {
                        duration: Math.random() * 2 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }
                    }}
                    style={{
                      left: `${Math.random() * 100}%`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 