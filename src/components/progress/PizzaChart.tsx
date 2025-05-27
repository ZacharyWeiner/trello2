'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressData, ProgressMilestone } from '@/types';
import { Pizza, Star, Trophy, Target } from 'lucide-react';

interface PizzaChartProps {
  data: ProgressData;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showMilestones?: boolean;
  onMilestoneReached?: (milestone: ProgressMilestone) => void;
  theme?: 'classic' | 'space' | 'forest' | 'fire';
}

export const PizzaChart: React.FC<PizzaChartProps> = ({
  data,
  size = 'medium',
  animated = true,
  showMilestones = true,
  onMilestoneReached,
  theme = 'classic'
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [reachedMilestones, setReachedMilestones] = useState<string[]>([]);

  const progress = Math.min((data.current / data.target) * 100, 100);
  const radius = size === 'small' ? 40 : size === 'medium' ? 60 : 80;
  const strokeWidth = size === 'small' ? 6 : size === 'medium' ? 8 : 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  // Check for milestone achievements
  useEffect(() => {
    if (data.milestones) {
      data.milestones.forEach(milestone => {
        const milestoneProgress = (milestone.value / data.target) * 100;
        if (animatedProgress >= milestoneProgress && !reachedMilestones.includes(milestone.id)) {
          setReachedMilestones(prev => [...prev, milestone.id]);
          onMilestoneReached?.(milestone);
        }
      });
    }
  }, [animatedProgress, data.milestones, data.target, reachedMilestones, onMilestoneReached]);

  const getThemeColors = () => {
    switch (theme) {
      case 'space':
        return {
          base: 'bg-slate-900 border-slate-700',
          sliceHueRange: [240, 300], // Purple to blue range
          centerIcon: 'text-purple-400'
        };
      case 'forest':
        return {
          base: 'bg-green-100 border-green-300',
          sliceHueRange: [80, 140], // Green range
          centerIcon: 'text-green-600'
        };
      case 'fire':
        return {
          base: 'bg-red-100 border-red-300',
          sliceHueRange: [0, 60], // Red to orange range
          centerIcon: 'text-red-600'
        };
      default:
        return {
          base: 'bg-yellow-100 border-yellow-200',
          sliceHueRange: [20, 80], // Yellow to orange range
          centerIcon: 'text-orange-600'
        };
    }
  };

  const themeColors = getThemeColors();

  const getSliceColor = (sliceIndex: number, totalSlices: number) => {
    const [minHue, maxHue] = themeColors.sliceHueRange;
    const hue = (sliceIndex / totalSlices) * (maxHue - minHue) + minHue;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const renderPizzaSlices = () => {
    const totalSlices = 8;
    const filledSlices = Math.floor((animatedProgress / 100) * totalSlices);
    const partialSlice = ((animatedProgress / 100) * totalSlices) % 1;

    return (
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 200 200"
        style={{ overflow: 'visible' }}
      >
        {/* Pizza base background */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="#f4d03f"
          stroke="rgba(139, 69, 19, 0.8)"
          strokeWidth="2"
        />
        
        {/* Pizza slices */}
        {Array.from({ length: totalSlices }, (_, index) => {
          const startAngle = (360 / totalSlices) * index - 90; // Start from top
          const endAngle = (360 / totalSlices) * (index + 1) - 90;
          const isComplete = index < filledSlices;
          const isPartial = index === filledSlices && partialSlice > 0;
          const opacity = isComplete ? 1 : isPartial ? partialSlice : 0.2;
          
          const centerX = 100;
          const centerY = 100;
          const radiusOuter = 85;
          
          // Calculate slice coordinates
          const startXOuter = centerX + radiusOuter * Math.cos(startAngle * Math.PI / 180);
          const startYOuter = centerY + radiusOuter * Math.sin(startAngle * Math.PI / 180);
          const endXOuter = centerX + radiusOuter * Math.cos(endAngle * Math.PI / 180);
          const endYOuter = centerY + radiusOuter * Math.sin(endAngle * Math.PI / 180);
          
          const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`, // Move to center
            `L ${startXOuter} ${startYOuter}`, // Line to start of arc
            `A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 1 ${endXOuter} ${endYOuter}`, // Arc
            'Z' // Close path
          ].join(' ');
          
          return (
            <motion.path
              key={index}
              d={pathData}
              fill={getSliceColor(index, totalSlices)}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth="2"
              opacity={opacity}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: animated ? index * 0.1 : 0,
                duration: 0.3,
                type: "spring",
                stiffness: 100
              }}
              style={{ transformOrigin: `${centerX}px ${centerY}px` }}
            />
          );
        })}
        
        {/* Slice divider lines */}
        {Array.from({ length: totalSlices }, (_, index) => {
          const angle = (360 / totalSlices) * index - 90;
          const centerX = 100;
          const centerY = 100;
          const radiusOuter = 85;
          
          const endX = centerX + radiusOuter * Math.cos(angle * Math.PI / 180);
          const endY = centerY + radiusOuter * Math.sin(angle * Math.PI / 180);
          
          return (
            <line
              key={`divider-${index}`}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="rgba(139, 69, 19, 0.4)"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}
        
        {/* Pizza crust border */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="rgba(139, 69, 19, 0.8)"
          strokeWidth="3"
        />
      </svg>
    );
  };

  const renderMilestones = () => {
    if (!showMilestones || !data.milestones) return null;

    return data.milestones.map((milestone, index) => {
      const milestoneProgress = (milestone.value / data.target) * 100;
      const angle = (milestoneProgress / 100) * 360 - 90; // -90 to start from top
      const isReached = reachedMilestones.includes(milestone.id);
      
      const x = 50 + (radius + 20) * Math.cos(angle * Math.PI / 180);
      const y = 50 + (radius + 20) * Math.sin(angle * Math.PI / 180);

      return (
        <motion.div
          key={milestone.id}
          className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isReached 
              ? 'bg-yellow-400 text-yellow-900 shadow-lg' 
              : 'bg-gray-300 text-gray-600'
          }`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0 }}
          animate={{ 
            scale: isReached ? 1.2 : 1,
            rotate: isReached ? 360 : 0
          }}
          transition={{ 
            duration: isReached ? 0.6 : 0.3,
            type: "spring"
          }}
          title={`${milestone.name}: ${milestone.value}/${data.target}`}
        >
          {isReached ? <Star className="h-3 w-3" /> : <Target className="h-3 w-3" />}
        </motion.div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Pizza Chart */}
      <div className="relative" style={{ width: radius * 2 + 60, height: radius * 2 + 60 }}>
        {/* Pizza Base */}
        <div 
          className={`absolute inset-0 rounded-full border-4 shadow-lg ${themeColors.base}`}
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 30,
            top: 30
          }}
        />
        
        {/* Pizza Slices */}
        <div 
          className="absolute rounded-full overflow-hidden"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 30,
            top: 30
          }}
        >
          {renderPizzaSlices()}
        </div>

        {/* Center Icon */}
        <motion.div 
          className="absolute flex items-center justify-center z-10"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 30,
            top: 30
          }}
          animate={{ rotate: animated ? 360 : 0 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <div className="bg-white bg-opacity-90 rounded-full p-2 shadow-sm">
            <Pizza className={`h-6 w-6 ${themeColors.centerIcon}`} />
          </div>
        </motion.div>

        {/* Milestones */}
        {renderMilestones()}
      </div>

      {/* Progress Info */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-gray-900">{data.name}</h3>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl font-bold" style={{ color: data.color }}>
            {Math.round(animatedProgress)}%
          </span>
          <span className="text-sm text-gray-600">
            ({data.current}/{data.target})
          </span>
        </div>
        {data.description && (
          <p className="text-xs text-gray-500 max-w-xs">{data.description}</p>
        )}
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {animatedProgress >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full"
          >
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-medium">Pizza Complete! 🍕</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 