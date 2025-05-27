'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressData } from '@/types';
import { Thermometer, Flame, Snowflake, Zap } from 'lucide-react';

interface ThermometerProgressProps {
  data: ProgressData;
  height?: number;
  width?: number;
  animated?: boolean;
  theme?: 'hot' | 'cold' | 'electric' | 'classic';
  showBubbles?: boolean;
}

export const ThermometerProgress: React.FC<ThermometerProgressProps> = ({
  data,
  height = 200,
  width = 60,
  animated = true,
  theme = 'classic',
  showBubbles = true
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  const progress = Math.min((data.current / data.target) * 100, 100);
  const fillHeight = (animatedProgress / 100) * (height - 40); // Leave space for bulb

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

  // Generate bubbles for animation
  useEffect(() => {
    if (showBubbles && animatedProgress > 0) {
      const interval = setInterval(() => {
        setBubbles(prev => {
          const newBubbles = [...prev];
          
          // Add new bubble
          if (Math.random() > 0.7) {
            newBubbles.push({
              id: Date.now(),
              x: Math.random() * (width - 20) + 10,
              y: height - 20,
              size: Math.random() * 4 + 2
            });
          }
          
          // Move existing bubbles up and remove old ones
          return newBubbles
            .map(bubble => ({ ...bubble, y: bubble.y - 2 }))
            .filter(bubble => bubble.y > height - fillHeight - 20);
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [showBubbles, animatedProgress, fillHeight, height, width]);

  const getThemeColors = () => {
    switch (theme) {
      case 'hot':
        return {
          liquid: 'from-red-400 via-orange-400 to-yellow-400',
          bulb: 'bg-red-500',
          tube: 'border-red-300',
          icon: <Flame className="h-4 w-4 text-red-600" />
        };
      case 'cold':
        return {
          liquid: 'from-blue-400 via-cyan-400 to-blue-300',
          bulb: 'bg-blue-500',
          tube: 'border-blue-300',
          icon: <Snowflake className="h-4 w-4 text-blue-600" />
        };
      case 'electric':
        return {
          liquid: 'from-purple-400 via-pink-400 to-yellow-400',
          bulb: 'bg-purple-500',
          tube: 'border-purple-300',
          icon: <Zap className="h-4 w-4 text-purple-600" />
        };
      default:
        return {
          liquid: 'from-green-400 via-blue-400 to-green-300',
          bulb: 'bg-green-500',
          tube: 'border-gray-300',
          icon: <Thermometer className="h-4 w-4 text-gray-600" />
        };
    }
  };

  const themeColors = getThemeColors();

  const renderTemperatureMarks = () => {
    const marks = [];
    for (let i = 0; i <= 10; i++) {
      const y = (height - 40) - (i / 10) * (height - 40) + 20;
      const isMainMark = i % 2 === 0;
      
      marks.push(
        <g key={i}>
          <line
            x1={width + 5}
            y1={y}
            x2={width + (isMainMark ? 15 : 10)}
            y2={y}
            stroke="#666"
            strokeWidth={isMainMark ? 2 : 1}
          />
          {isMainMark && (
            <text
              x={width + 20}
              y={y + 4}
              fontSize="10"
              fill="#666"
              textAnchor="start"
            >
              {i * 10}%
            </text>
          )}
        </g>
      );
    }
    return marks;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Thermometer */}
      <div className="relative">
        <svg width={width + 50} height={height + 20} className="overflow-visible">
          {/* Temperature marks */}
          {renderTemperatureMarks()}
          
          {/* Thermometer tube */}
          <rect
            x="10"
            y="20"
            width={width - 20}
            height={height - 40}
            rx="15"
            ry="15"
            fill="white"
            stroke="currentColor"
            strokeWidth="2"
            className={`${themeColors.tube}`}
          />
          
          {/* Thermometer bulb */}
          <circle
            cx={width / 2}
            cy={height - 10}
            r="15"
            fill="white"
            stroke="currentColor"
            strokeWidth="2"
            className={`${themeColors.tube}`}
          />
          
          {/* Liquid fill */}
          <motion.rect
            x="12"
            y={height - 22 - fillHeight}
            width={width - 24}
            height={fillHeight}
            rx="13"
            ry="13"
            className={`bg-gradient-to-t ${themeColors.liquid}`}
            initial={{ height: 0, y: height - 22 }}
            animate={{ 
              height: fillHeight, 
              y: height - 22 - fillHeight 
            }}
            transition={{ 
              duration: animated ? 1.5 : 0,
              ease: "easeOut"
            }}
          />
          
          {/* Bulb fill */}
          <motion.circle
            cx={width / 2}
            cy={height - 10}
            r="13"
            className={themeColors.bulb}
            initial={{ scale: 0 }}
            animate={{ scale: animatedProgress > 0 ? 1 : 0 }}
            transition={{ 
              duration: animated ? 0.5 : 0,
              delay: animated ? 0.2 : 0
            }}
          />
          
          {/* Bubbles */}
          {showBubbles && bubbles.map(bubble => (
            <motion.circle
              key={bubble.id}
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.size}
              fill="rgba(255, 255, 255, 0.6)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            />
          ))}
          
          {/* Glow effect for high progress */}
          {animatedProgress > 80 && (
            <motion.circle
              cx={width / 2}
              cy={height - 10}
              r="20"
              fill="none"
              stroke={theme === 'hot' ? '#ff6b6b' : theme === 'electric' ? '#a855f7' : '#10b981'}
              strokeWidth="2"
              opacity="0.5"
              animate={{ 
                r: 25,
                opacity: 0.8
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </svg>
        
        {/* Theme icon */}
        <div className="absolute top-2 left-2">
          {themeColors.icon}
        </div>
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

      {/* Temperature Status */}
      <div className="flex items-center space-x-2">
        {animatedProgress < 25 && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            ❄️ Getting Started
          </span>
        )}
        {animatedProgress >= 25 && animatedProgress < 50 && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            🌡️ Warming Up
          </span>
        )}
        {animatedProgress >= 50 && animatedProgress < 75 && (
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
            🔥 Heating Up
          </span>
        )}
        {animatedProgress >= 75 && animatedProgress < 100 && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            🌋 Almost Boiling
          </span>
        )}
        {animatedProgress >= 100 && (
          <motion.span 
            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
            animate={{ scale: 1.1 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            💥 Explosive!
          </motion.span>
        )}
      </div>
    </div>
  );
}; 