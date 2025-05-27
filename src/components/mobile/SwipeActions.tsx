'use client';

import React, { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Archive, Edit, Star, MoreHorizontal } from 'lucide-react';

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  backgroundColor: string;
  onAction: () => void;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

export const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className = '',
  disabled = false,
  hapticFeedback = true,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedSide, setRevealedSide] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, -threshold, 0, threshold, 200], [1, 0.8, 1, 0.8, 1]);

  // Haptic feedback function
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback) return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const { offset } = info;
    const absOffset = Math.abs(offset.x);
    
    // Trigger haptic feedback when crossing threshold
    if (absOffset > threshold && !isRevealed) {
      triggerHaptic('medium');
      setIsRevealed(true);
      setRevealedSide(offset.x > 0 ? 'left' : 'right');
    } else if (absOffset <= threshold && isRevealed) {
      setIsRevealed(false);
      setRevealedSide(null);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const absOffset = Math.abs(offset.x);
    const absVelocity = Math.abs(velocity.x);
    
    // Determine if we should reveal actions or snap back
    const shouldReveal = absOffset > threshold || absVelocity > 500;
    
    if (shouldReveal && !disabled) {
      const side = offset.x > 0 ? 'left' : 'right';
      const actions = side === 'left' ? leftActions : rightActions;
      
      if (actions.length > 0) {
        // Snap to revealed position
        const targetX = side === 'left' ? 120 : -120;
        x.set(targetX);
        setIsRevealed(true);
        setRevealedSide(side);
        triggerHaptic('heavy');
        return;
      }
    }
    
    // Snap back to center
    x.set(0);
    setIsRevealed(false);
    setRevealedSide(null);
  };

  const handleActionClick = (action: SwipeAction) => {
    triggerHaptic('medium');
    action.onAction();
    
    // Snap back after action
    x.set(0);
    setIsRevealed(false);
    setRevealedSide(null);
  };

  const resetPosition = () => {
    x.set(0);
    setIsRevealed(false);
    setRevealedSide(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`swipe-container relative overflow-hidden ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 h-full flex items-center">
          {leftActions.map((action, index) => (
            <motion.button
              key={action.id}
              className="h-full px-4 flex flex-col items-center justify-center min-w-[80px] text-white text-xs font-medium"
              style={{ backgroundColor: action.backgroundColor }}
              onClick={() => handleActionClick(action)}
              initial={{ x: -100 }}
              animate={{ 
                x: revealedSide === 'left' ? 0 : -100,
                opacity: revealedSide === 'left' ? 1 : 0,
              }}
              transition={{ 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <div className="mb-1">{action.icon}</div>
              <span>{action.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 h-full flex items-center">
          {rightActions.map((action, index) => (
            <motion.button
              key={action.id}
              className="h-full px-4 flex flex-col items-center justify-center min-w-[80px] text-white text-xs font-medium"
              style={{ backgroundColor: action.backgroundColor }}
              onClick={() => handleActionClick(action)}
              initial={{ x: 100 }}
              animate={{ 
                x: revealedSide === 'right' ? 0 : 100,
                opacity: revealedSide === 'right' ? 1 : 0,
              }}
              transition={{ 
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <div className="mb-1">{action.icon}</div>
              <span>{action.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <motion.div
        className="swipe-content relative z-10 bg-white dark:bg-gray-800"
        style={{ x, opacity }}
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={isRevealed ? resetPosition : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Predefined action sets
export const createCardActions = (
  onEdit: () => void,
  onArchive: () => void,
  onDelete: () => void,
  onStar?: () => void
): { left: SwipeAction[]; right: SwipeAction[] } => ({
  left: [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit size={20} />,
      color: '#ffffff',
      backgroundColor: '#3b82f6',
      onAction: onEdit,
    },
    ...(onStar ? [{
      id: 'star',
      label: 'Star',
      icon: <Star size={20} />,
      color: '#ffffff',
      backgroundColor: '#f59e0b',
      onAction: onStar,
    }] : []),
  ],
  right: [
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive size={20} />,
      color: '#ffffff',
      backgroundColor: '#6b7280',
      onAction: onArchive,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={20} />,
      color: '#ffffff',
      backgroundColor: '#ef4444',
      onAction: onDelete,
    },
  ],
});

export const createListActions = (
  onEdit: () => void,
  onArchive: () => void,
  onMore: () => void
): { left: SwipeAction[]; right: SwipeAction[] } => ({
  left: [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit size={20} />,
      color: '#ffffff',
      backgroundColor: '#3b82f6',
      onAction: onEdit,
    },
  ],
  right: [
    {
      id: 'more',
      label: 'More',
      icon: <MoreHorizontal size={20} />,
      color: '#ffffff',
      backgroundColor: '#6b7280',
      onAction: onMore,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive size={20} />,
      color: '#ffffff',
      backgroundColor: '#f59e0b',
      onAction: onArchive,
    },
  ],
});

// Hook for managing swipe state
export const useSwipeActions = () => {
  const [activeSwipe, setActiveSwipe] = useState<string | null>(null);
  
  const openSwipe = (id: string) => {
    setActiveSwipe(id);
  };
  
  const closeSwipe = () => {
    setActiveSwipe(null);
  };
  
  const isSwipeOpen = (id: string) => {
    return activeSwipe === id;
  };
  
  return {
    activeSwipe,
    openSwipe,
    closeSwipe,
    isSwipeOpen,
  };
}; 