'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, List, Card, BurndownChart, BurndownDataPoint, BurndownTheme } from '@/types';
import { BurndownChartComponent } from '@/components/progress/BurndownChart';
import { TrendingDown, Calendar, Target, Settings, X, Sparkles, Zap, Flame, TreePine } from 'lucide-react';

interface BurndownWidgetProps {
  board: Board;
  lists: List[];
  cards: Record<string, Card[]>;
  isOpen: boolean;
  onClose: () => void;
}

export const BurndownWidget: React.FC<BurndownWidgetProps> = ({
  board,
  lists,
  cards,
  isOpen,
  onClose,
}) => {
  const [sprintDuration, setSprintDuration] = useState<7 | 14 | 21 | 30>(14);
  const [theme, setTheme] = useState<'classic' | 'space' | 'forest' | 'fire'>('classic');
  const [burndownData, setBurndownData] = useState<BurndownChart | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateBurndownData();
    }
  }, [isOpen, board, lists, cards, sprintDuration]);

  const generateBurndownData = () => {
    const allCards = Object.values(cards).flat();
    const now = new Date();
    
    // Calculate sprint start and end dates
    const sprintStartDate = new Date(now.getTime() - (sprintDuration / 2) * 24 * 60 * 60 * 1000);
    const sprintEndDate = new Date(now.getTime() + (sprintDuration / 2) * 24 * 60 * 60 * 1000);
    
    // Calculate total work (story points or card count)
    const totalWork = allCards.length;
    
    // Generate daily data points
    const dailyData: BurndownDataPoint[] = [];
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    for (let day = 0; day <= sprintDuration; day++) {
      const currentDate = new Date(sprintStartDate.getTime() + day * millisecondsPerDay);
      
      // Calculate ideal remaining work (linear burndown)
      const idealRemaining = totalWork - (totalWork * day / sprintDuration);
      
      // Calculate actual remaining work based on completed cards
      const doneListIds = lists
        .filter(list => list.listType === 'done' || list.title.toLowerCase().includes('done'))
        .map(list => list.id);
      
      const completedCards = allCards.filter(card => 
        doneListIds.includes(card.listId) &&
        card.updatedAt <= currentDate
      ).length;
      
      const remainingWork = Math.max(totalWork - completedCards, 0);
      
      // Calculate scope changes (new cards added during sprint)
      const cardsAddedDuringSprint = allCards.filter(card =>
        card.createdAt >= sprintStartDate &&
        card.createdAt <= currentDate
      ).length;
      
      const scope = totalWork + cardsAddedDuringSprint;
      
      dailyData.push({
        date: currentDate,
        remainingWork,
        idealRemaining: Math.max(idealRemaining, 0),
        completedWork: completedCards,
        scope
      });
    }

    const burndown: BurndownChart = {
      id: `burndown-${board.id}-${sprintDuration}`,
      boardId: board.id,
      sprintName: `${board.title} - ${sprintDuration} Day Sprint`,
      startDate: sprintStartDate,
      endDate: sprintEndDate,
      totalWork,
      dailyData,
      isActive: true,
      theme: getBurndownTheme()
    };

    setBurndownData(burndown);
  };

  const getBurndownTheme = (): BurndownTheme => {
    const themes = {
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
        style: 'classic' as const,
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
        style: 'modern' as const,
        animations: true,
        particles: {
          enabled: true,
          type: 'stars' as const,
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
        style: 'playful' as const,
        animations: true,
        particles: {
          enabled: true,
          type: 'bubbles' as const,
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
        style: 'playful' as const,
        animations: true,
        particles: {
          enabled: true,
          type: 'fire' as const,
          density: 40
        }
      }
    };

    return themes[theme];
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'space':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'forest':
        return <TreePine className="h-4 w-4 text-green-500" />;
      case 'fire':
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSprintDurationText = () => {
    switch (sprintDuration) {
      case 7:
        return '1 Week Sprint';
      case 14:
        return '2 Week Sprint';
      case 21:
        return '3 Week Sprint';
      case 30:
        return '1 Month Sprint';
      default:
        return `${sprintDuration} Day Sprint`;
    }
  };

  const calculateSprintMetrics = () => {
    if (!burndownData) return null;

    const latestData = burndownData.dailyData[burndownData.dailyData.length - 1];
    const startData = burndownData.dailyData[0];
    
    const completedWork = latestData.completedWork;
    const remainingWork = latestData.remainingWork;
    const totalWork = burndownData.totalWork;
    const progressPercentage = Math.round((completedWork / totalWork) * 100);
    
    // Calculate velocity (cards completed per day)
    const daysElapsed = burndownData.dailyData.length - 1;
    const velocity = daysElapsed > 0 ? (completedWork / daysElapsed).toFixed(1) : '0';
    
    // Estimate completion date
    const remainingDays = remainingWork > 0 && parseFloat(velocity) > 0 
      ? Math.ceil(remainingWork / parseFloat(velocity))
      : 0;
    
    const estimatedCompletion = new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000);
    
    // Sprint health assessment
    const idealRemaining = latestData.idealRemaining;
    const isOnTrack = remainingWork <= idealRemaining * 1.1; // 10% tolerance
    const isAhead = remainingWork < idealRemaining * 0.9;
    const isBehind = remainingWork > idealRemaining * 1.2;
    
    let sprintHealth = 'On Track';
    let healthColor = 'text-green-600';
    
    if (isAhead) {
      sprintHealth = 'Ahead of Schedule';
      healthColor = 'text-blue-600';
    } else if (isBehind) {
      sprintHealth = 'Behind Schedule';
      healthColor = 'text-red-600';
    }

    return {
      completedWork,
      remainingWork,
      totalWork,
      progressPercentage,
      velocity,
      estimatedCompletion,
      sprintHealth,
      healthColor,
      isOnTrack,
      isAhead,
      isBehind
    };
  };

  const metrics = calculateSprintMetrics();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Sprint Burndown Chart - {board.title}
              </h2>
              <p className="text-sm text-gray-600">
                Track sprint progress and velocity with visual burndown analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Sprint Duration:</label>
                <select
                  value={sprintDuration}
                  onChange={(e) => setSprintDuration(Number(e.target.value) as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>📅 1 Week</option>
                  <option value={14}>📊 2 Weeks</option>
                  <option value={21}>📈 3 Weeks</option>
                  <option value={30}>🗓️ 1 Month</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {getThemeIcon()}
                <label className="text-sm font-medium text-gray-700">Theme:</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="classic">📊 Classic</option>
                  <option value="space">🌌 Space Odyssey</option>
                  <option value="forest">🌲 Enchanted Forest</option>
                  <option value="fire">🔥 Blazing Progress</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>{burndownData?.totalWork || 0} total cards</span>
            </div>
          </div>
        </div>

        {/* Burndown Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {burndownData && metrics ? (
            <div className="space-y-6">
              {/* Sprint Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">Progress</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {metrics.completedWork} of {metrics.totalWork} cards
                    </p>
                    <p className="text-xs text-gray-500">
                      {metrics.progressPercentage}% complete
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">Velocity</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {metrics.velocity} cards/day
                    </p>
                    <p className="text-xs text-gray-500">
                      Current team velocity
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-500 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">Completion</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {metrics.estimatedCompletion.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Estimated finish date
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">Sprint Health</h3>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${metrics.healthColor}`}>
                      {metrics.sprintHealth}
                    </p>
                    <p className="text-xs text-gray-500">
                      {metrics.remainingWork} cards remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* Burndown Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getSprintDurationText()} Burndown
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full opacity-60"></div>
                      <span className="text-gray-600">Ideal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-600">Scope</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-96 w-full">
                  <BurndownChartComponent
                    burndown={burndownData}
                    theme={getBurndownTheme()}
                    animated={true}
                    showParticles={true}
                  />
                </div>
              </div>

              {/* Sprint Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">📈 Performance Analysis</h4>
                  <div className="space-y-2 text-sm">
                    {metrics.isAhead && (
                      <div className="flex items-start gap-2 text-blue-600">
                        <span className="flex-shrink-0">🚀</span>
                        <span>Team is ahead of schedule - excellent velocity!</span>
                      </div>
                    )}
                    {metrics.isOnTrack && !metrics.isAhead && (
                      <div className="flex items-start gap-2 text-green-600">
                        <span className="flex-shrink-0">✅</span>
                        <span>Sprint is on track - maintaining good pace</span>
                      </div>
                    )}
                    {metrics.isBehind && (
                      <div className="flex items-start gap-2 text-red-600">
                        <span className="flex-shrink-0">⚠️</span>
                        <span>Sprint is behind schedule - consider scope adjustment</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-gray-600">
                      <span className="flex-shrink-0">📊</span>
                      <span>
                        Current velocity: {metrics.velocity} cards/day
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <span className="flex-shrink-0">🎯</span>
                      <span>
                        {metrics.remainingWork} cards remaining in sprint
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sprint Tips */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">💡 Sprint Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ideal line shows perfect linear progress</li>
                    <li>• Actual line should trend toward zero by sprint end</li>
                    <li>• Scope changes appear as yellow line variations</li>
                    <li>• Velocity helps predict sprint completion</li>
                    <li>• Use different themes for visual variety</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Generating burndown chart...
              </h3>
              <p className="text-gray-600">
                Analyzing sprint data to create your burndown visualization!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Burndown data updates automatically based on card completion
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => generateBurndownData()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Chart
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 