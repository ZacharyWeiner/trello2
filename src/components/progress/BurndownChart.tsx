'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { BurndownChart, BurndownTheme } from '@/types';
import { TrendingDown, Calendar, Target, Zap, Sparkles } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BurndownChartProps {
  burndown: BurndownChart;
  theme?: BurndownTheme;
  animated?: boolean;
  showParticles?: boolean;
}

const defaultThemes: Record<string, BurndownTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional burndown chart',
    colors: {
      ideal: '#10b981',
      actual: '#3b82f6',
      scope: '#f59e0b',
      background: '#ffffff',
      grid: '#e5e7eb'
    },
    style: 'classic',
    animations: true
  },
  space: {
    id: 'space',
    name: 'Space Odyssey',
    description: 'Journey through the cosmos',
    colors: {
      ideal: '#8b5cf6',
      actual: '#06b6d4',
      scope: '#f97316',
      background: '#0f172a',
      grid: '#334155'
    },
    style: 'modern',
    animations: true,
    particles: {
      enabled: true,
      type: 'stars',
      density: 50
    }
  },
  forest: {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Nature-inspired progress tracking',
    colors: {
      ideal: '#22c55e',
      actual: '#84cc16',
      scope: '#eab308',
      background: '#f0fdf4',
      grid: '#bbf7d0'
    },
    style: 'playful',
    animations: true,
    particles: {
      enabled: true,
      type: 'bubbles',
      density: 30
    }
  },
  fire: {
    id: 'fire',
    name: 'Blazing Progress',
    description: 'Hot and intense tracking',
    colors: {
      ideal: '#ef4444',
      actual: '#f97316',
      scope: '#eab308',
      background: '#fef2f2',
      grid: '#fecaca'
    },
    style: 'playful',
    animations: true,
    particles: {
      enabled: true,
      type: 'fire',
      density: 40
    }
  }
};

export const BurndownChartComponent: React.FC<BurndownChartProps> = ({
  burndown,
  theme = defaultThemes.classic,
  animated = true,
  showParticles = true
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Generate particles based on theme
    if (showParticles && theme.particles?.enabled) {
      const newParticles = Array.from({ length: theme.particles.density }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setParticles(newParticles);
    }
  }, [theme, showParticles]);

  useEffect(() => {
    // Prepare chart data
    const labels = burndown.dailyData.map(point => 
      new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const idealData = burndown.dailyData.map(point => point.idealRemaining);
    const actualData = burndown.dailyData.map(point => point.remainingWork);
    const scopeData = burndown.dailyData.map(point => point.scope);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Ideal Burndown',
          data: idealData,
          borderColor: theme.colors.ideal,
          backgroundColor: `${theme.colors.ideal}20`,
          borderWidth: 3,
          borderDash: [5, 5],
          fill: false,
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Actual Progress',
          data: actualData,
          borderColor: theme.colors.actual,
          backgroundColor: `${theme.colors.actual}20`,
          borderWidth: 4,
          fill: 'origin',
          tension: 0.2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: theme.colors.actual,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Scope Changes',
          data: scopeData,
          borderColor: theme.colors.scope,
          backgroundColor: `${theme.colors.scope}30`,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderDash: [10, 5]
        }
      ]
    });
  }, [burndown, theme]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    animation: animated ? {
      duration: 2000,
      easing: 'easeInOutQuart' as const
    } : {
      duration: 0
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: theme.colors.background,
        titleColor: theme.style === 'modern' ? '#ffffff' : '#000000',
        bodyColor: theme.style === 'modern' ? '#ffffff' : '#000000',
        borderColor: theme.colors.actual,
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Sprint Days',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: theme.colors.grid,
          lineWidth: 1
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Remaining Work',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: theme.colors.grid,
          lineWidth: 1
        },
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const getParticleComponent = () => {
    if (!theme.particles?.enabled || !showParticles) return null;

    return particles.map(particle => {
      const ParticleIcon = () => {
        switch (theme.particles?.type) {
          case 'stars':
            return <Sparkles className="h-2 w-2 text-yellow-400" />;
          case 'fire':
            return <span className="text-orange-500">🔥</span>;
          case 'bubbles':
            return <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60" />;
          default:
            return <div className="w-1 h-1 bg-gray-400 rounded-full" />;
        }
      };

      return (
        <motion.div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity
          }}
          animate={{
            y: theme.particles?.type === 'bubbles' ? -20 : -10,
            x: theme.particles?.type === 'fire' ? 5 : 2,
            scale: 1.2
          }}
          transition={{
            duration: theme.particles?.type === 'fire' ? 1 : 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.id * 0.1
          }}
        >
          <ParticleIcon />
        </motion.div>
      );
    });
  };

  const calculateProgress = () => {
    const totalDays = burndown.dailyData.length;
    const currentDay = burndown.dailyData.findIndex(point => 
      new Date(point.date) <= new Date()
    );
    const progressPercentage = totalDays > 0 ? ((currentDay + 1) / totalDays) * 100 : 0;
    
    const latestData = burndown.dailyData[burndown.dailyData.length - 1];
    const isOnTrack = latestData ? latestData.remainingWork <= latestData.idealRemaining : true;
    
    return { progressPercentage, isOnTrack, currentDay: currentDay + 1, totalDays };
  };

  const { progressPercentage, isOnTrack, currentDay, totalDays } = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="rounded-lg shadow-md p-6 relative overflow-hidden"
        style={{ backgroundColor: theme.colors.background }}
      >
        {getParticleComponent()}
        
        <div className="relative z-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold flex items-center gap-2" 
                  style={{ color: theme.style === 'modern' ? '#ffffff' : '#000000' }}>
                <TrendingDown className="h-5 w-5" style={{ color: theme.colors.actual }} />
                {burndown.sprintName}
              </h3>
              <p className="text-sm opacity-75" 
                 style={{ color: theme.style === 'modern' ? '#ffffff' : '#666666' }}>
                {theme.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-2 text-sm" 
                   style={{ color: theme.style === 'modern' ? '#ffffff' : '#666666' }}>
                <Calendar className="h-4 w-4" />
                Day {currentDay} of {totalDays}
              </div>
              <div className="text-xs opacity-75">
                {new Date(burndown.startDate).toLocaleDateString()} - {new Date(burndown.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                burndown.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {burndown.isActive ? '🏃 Active Sprint' : '⏸️ Sprint Paused'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isOnTrack 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isOnTrack ? '✅ On Track' : '⚠️ Behind Schedule'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Target className="h-4 w-4" style={{ color: theme.colors.ideal }} />
              <span className="text-sm font-medium" 
                    style={{ color: theme.style === 'modern' ? '#ffffff' : '#000000' }}>
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div 
        className="rounded-lg shadow-md p-6 relative"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="h-80 relative w-full">
          {chartData && (
            <div className="w-full h-full">
            <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="bg-white rounded-lg shadow-md p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Work</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.actual }}>
                {burndown.totalWork}
              </p>
            </div>
            <Zap className="h-8 w-8" style={{ color: theme.colors.actual }} />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-md p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.scope }}>
                {burndown.dailyData[burndown.dailyData.length - 1]?.remainingWork || 0}
              </p>
            </div>
            <Target className="h-8 w-8" style={{ color: theme.colors.scope }} />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-md p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Velocity</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.ideal }}>
                {burndown.dailyData.length > 1 ? 
                  Math.round((burndown.totalWork - (burndown.dailyData[burndown.dailyData.length - 1]?.remainingWork || 0)) / burndown.dailyData.length) 
                  : 0}
              </p>
            </div>
            <TrendingDown className="h-8 w-8" style={{ color: theme.colors.ideal }} />
          </div>
        </motion.div>
      </div>

      {/* Sprint Completion Celebration */}
      <AnimatePresence>
        {progressPercentage >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-center text-white"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 mx-auto mb-3" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">🎉 Sprint Complete! 🎉</h3>
            <p className="text-sm opacity-90">
              Congratulations! You've successfully completed the sprint. Time to celebrate! 🚀
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};