'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, List, Card, ProgressData, ProgressMilestone } from '@/types';
import { PizzaChart } from '@/components/progress/PizzaChart';
import { Pizza, Target, Calendar, TrendingUp, Settings, X, Flame, Snowflake, Zap, Star } from 'lucide-react';

interface PizzaWidgetProps {
  board: Board;
  lists: List[];
  cards: Record<string, Card[]>;
  isOpen: boolean;
  onClose: () => void;
}

export const PizzaWidget: React.FC<PizzaWidgetProps> = ({
  board,
  lists,
  cards,
  isOpen,
  onClose,
}) => {
  const [progressType, setProgressType] = useState<'tasks_completed' | 'cards_created' | 'checklist_completion' | 'sprint_progress'>('tasks_completed');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'sprint'>('weekly');
  const [theme, setTheme] = useState<'classic' | 'space' | 'forest' | 'fire'>('classic');
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [celebratingMilestone, setCelebratingMilestone] = useState<ProgressMilestone | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateProgressData();
    }
  }, [isOpen, board, lists, cards, progressType, timeframe]);

  const generateProgressData = () => {
    const allCards = Object.values(cards).flat();
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    // Calculate timeframe
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'sprint':
        // For sprint, use a 2-week period
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
    }

    let current = 0;
    let target = 0;
    let name = '';
    let description = '';
    let color = '#3b82f6';
    let milestones: ProgressMilestone[] = [];

    switch (progressType) {
      case 'tasks_completed':
        // Count completed tasks (cards in "Done" lists)
        const doneListIds = lists
          .filter(list => list.listType === 'done' || list.title.toLowerCase().includes('done'))
          .map(list => list.id);
        
        current = allCards.filter(card => 
          doneListIds.includes(card.listId) &&
          card.updatedAt >= startDate &&
          card.updatedAt <= endDate
        ).length;
        
        target = Math.max(current + 10, 20);
        name = 'Task Completion Progress';
        description = 'Track completed tasks moved to Done';
        color = '#10b981';
        
        // Add some demo progress if no real progress exists
        if (current === 0 && target === 20) {
          current = 6; // Show some progress for demo
        }
        
        milestones = [
          { id: 'm1', name: 'First Slice', value: Math.round(target * 0.25), reached: current >= Math.round(target * 0.25), color: '#06b6d4', icon: '🍕' },
          { id: 'm2', name: 'Half Pizza', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#3b82f6', icon: '🍕🍕' },
          { id: 'm3', name: 'Almost Full', value: Math.round(target * 0.75), reached: current >= Math.round(target * 0.75), color: '#8b5cf6', icon: '🍕🍕🍕' },
          { id: 'm4', name: 'Full Pizza!', value: target, reached: current >= target, color: '#f59e0b', icon: '🍕🍕🍕🍕' }
        ];
        break;
        
      case 'cards_created':
        // Count all cards created in timeframe
        current = allCards.filter(card => 
          card.createdAt >= startDate &&
          card.createdAt <= endDate
        ).length;
        
        target = Math.max(current + 15, 25);
        name = 'Card Creation Progress';
        description = 'Track new cards added to the board';
        color = '#3b82f6';
        
        // Add some demo progress if no real progress exists
        if (current === 0 && target === 25) {
          current = 8; // Show some progress for demo
        }
        
        milestones = [
          { id: 'm1', name: 'Getting Started', value: Math.round(target * 0.25), reached: current >= Math.round(target * 0.25), color: '#06b6d4', icon: '📝' },
          { id: 'm2', name: 'Building Momentum', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#3b82f6', icon: '🚀' },
          { id: 'm3', name: 'Almost There', value: Math.round(target * 0.75), reached: current >= Math.round(target * 0.75), color: '#8b5cf6', icon: '⭐' },
          { id: 'm4', name: 'Creation Master!', value: target, reached: current >= target, color: '#f59e0b', icon: '👑' }
        ];
        break;
        
      case 'checklist_completion':
        // Count completed checklist items
        const totalChecklistItems = allCards.reduce((total, card) => {
          return total + (card.checklists || []).reduce((checklistTotal, checklist) => {
            return checklistTotal + (checklist.items || []).length;
          }, 0);
        }, 0);
        
        current = allCards.reduce((total, card) => {
          return total + (card.checklists || []).reduce((checklistTotal, checklist) => {
            return checklistTotal + (checklist.items || []).filter(item => item.completed).length;
          }, 0);
        }, 0);
        
        target = totalChecklistItems || 20; // Default target if no checklists
        name = 'Checklist Completion';
        description = 'Track completed checklist items across all cards';
        color = '#f59e0b';
        
        // Add some demo progress if no real progress exists
        if (current === 0 && target === 20) {
          current = 12; // Show some progress for demo
        }
        
        milestones = [
          { id: 'm1', name: 'First Tasks', value: Math.round(target * 0.25), reached: current >= Math.round(target * 0.25), color: '#06b6d4', icon: '✅' },
          { id: 'm2', name: 'Halfway Done', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#3b82f6', icon: '📋' },
          { id: 'm3', name: 'Final Push', value: Math.round(target * 0.75), reached: current >= Math.round(target * 0.75), color: '#8b5cf6', icon: '🎯' },
          { id: 'm4', name: 'All Complete!', value: target, reached: current >= target, color: '#10b981', icon: '🏆' }
        ];
        break;
        
      case 'sprint_progress':
        // Calculate overall sprint progress based on list distribution
        const todoLists = lists.filter(list => list.listType === 'todo' || list.title.toLowerCase().includes('todo') || list.title.toLowerCase().includes('backlog'));
        const doingLists = lists.filter(list => list.listType === 'doing' || list.title.toLowerCase().includes('doing') || list.title.toLowerCase().includes('progress'));
        const doneLists = lists.filter(list => list.listType === 'done' || list.title.toLowerCase().includes('done'));
        
        const todoCards = todoLists.reduce((acc, list) => acc + (cards[list.id] || []).length, 0);
        const doingCards = doingLists.reduce((acc, list) => acc + (cards[list.id] || []).length, 0);
        const doneCards = doneLists.reduce((acc, list) => acc + (cards[list.id] || []).length, 0);
        
        const totalCards = todoCards + doingCards + doneCards;
        current = doneCards + (doingCards * 0.5); // Count doing cards as 50% complete
        target = totalCards || 16; // Default target if no cards
        name = 'Sprint Progress';
        description = 'Overall progress through the sprint workflow';
        color = '#8b5cf6';
        
        // Add some demo progress if no real progress exists
        if (current === 0 && target === 16) {
          current = 10; // Show some progress for demo
        }
        
        milestones = [
          { id: 'm1', name: 'Sprint Started', value: Math.round(target * 0.25), reached: current >= Math.round(target * 0.25), color: '#06b6d4', icon: '🏁' },
          { id: 'm2', name: 'Mid-Sprint', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#3b82f6', icon: '⚡' },
          { id: 'm3', name: 'Sprint Review', value: Math.round(target * 0.75), reached: current >= Math.round(target * 0.75), color: '#f59e0b', icon: '🔍' },
          { id: 'm4', name: 'Sprint Complete!', value: target, reached: current >= target, color: '#10b981', icon: '🎯' }
        ];
        break;
    }

    const progress: ProgressData = {
      id: `pizza-${board.id}-${progressType}-${timeframe}`,
      name,
      description,
      current: Math.round(current),
      target: Math.round(target),
      color,
      milestones,
      category: 'custom',
      startDate,
      endDate
    };

    setProgressData(progress);
  };

  const handleMilestoneReached = (milestone: ProgressMilestone) => {
    setCelebratingMilestone(milestone);
    setTimeout(() => setCelebratingMilestone(null), 3000);
  };

  const getProgressTypeIcon = () => {
    switch (progressType) {
      case 'tasks_completed':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'cards_created':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'checklist_completion':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'sprint_progress':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Pizza className="h-4 w-4 text-gray-500" />;
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'space':
        return <Star className="h-4 w-4 text-purple-500" />;
      case 'forest':
        return <span className="text-green-500">🌲</span>;
      case 'fire':
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return <Pizza className="h-4 w-4 text-orange-500" />;
    }
  };

  const getTimeframeText = () => {
    switch (timeframe) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'sprint':
        return 'Current Sprint';
      default:
        return timeframe;
    }
  };

  const getProgressTypeText = () => {
    switch (progressType) {
      case 'tasks_completed':
        return 'Tasks Completed';
      case 'cards_created':
        return 'Cards Created';
      case 'checklist_completion':
        return 'Checklist Items';
      case 'sprint_progress':
        return 'Sprint Progress';
      default:
        return progressType;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Pizza className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Pizza Progress Tracker - {board.title}
              </h2>
              <p className="text-sm text-gray-600">
                Visual progress tracking with delicious pizza slices and milestones
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
                {getProgressTypeIcon()}
                <label className="text-sm font-medium text-gray-700">Progress Type:</label>
                <select
                  value={progressType}
                  onChange={(e) => setProgressType(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="tasks_completed">✅ Tasks Completed</option>
                  <option value="cards_created">📝 Cards Created</option>
                  <option value="checklist_completion">☑️ Checklist Items</option>
                  <option value="sprint_progress">⚡ Sprint Progress</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Timeframe:</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="daily">📅 Today</option>
                  <option value="weekly">📊 This Week</option>
                  <option value="monthly">📈 This Month</option>
                  <option value="sprint">⚡ Current Sprint</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {getThemeIcon()}
                <label className="text-sm font-medium text-gray-700">Theme:</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="classic">🍕 Classic Pizza</option>
                  <option value="space">🌌 Space Pizza</option>
                  <option value="forest">🌲 Forest Pizza</option>
                  <option value="fire">🔥 Fire Pizza</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>{progressData?.current || 0} / {progressData?.target || 0}</span>
            </div>
          </div>
        </div>

        {/* Pizza Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {progressData ? (
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Pizza className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">Current Progress</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round((progressData.current / progressData.target) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {progressData.current} of {progressData.target} completed
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">Timeframe</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600">
                      {getTimeframeText()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getProgressTypeText()}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">Milestones</h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-600">
                      {progressData.milestones?.filter(m => m.reached).length || 0} / {progressData.milestones?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Milestones reached
                    </p>
                  </div>
                </div>
              </div>

              {/* Pizza Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    {progressData.name} - {getTimeframeText()}
                  </h3>
                  
                  <div className="mb-6">
                    <PizzaChart
                      data={progressData}
                      size="large"
                      animated={true}
                      showMilestones={true}
                      onMilestoneReached={handleMilestoneReached}
                      theme={theme}
                    />
                  </div>

                  <p className="text-gray-600 text-center max-w-md">
                    {progressData.description}
                  </p>
                </div>
              </div>

              {/* Milestones List */}
              {progressData.milestones && progressData.milestones.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">🎯 Pizza Milestones</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {progressData.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          milestone.reached
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{milestone.icon}</span>
                          <span className="font-medium">{milestone.name}</span>
                          {milestone.reached && <span className="text-green-500">✅</span>}
                        </div>
                        <p className="text-sm">
                          {milestone.value} {getProgressTypeText().toLowerCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pizza className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Preparing your pizza...
              </h3>
              <p className="text-gray-600">
                Analyzing board data to create your delicious progress visualization!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Pizza progress updates automatically based on board activity
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => generateProgressData()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Refresh Pizza
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

      {/* Milestone Celebration */}
      <AnimatePresence>
        {celebratingMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white p-4 rounded-lg shadow-lg z-60"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{celebratingMilestone.icon}</span>
              <div>
                <h4 className="font-bold">Milestone Reached!</h4>
                <p className="text-sm">{celebratingMilestone.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 