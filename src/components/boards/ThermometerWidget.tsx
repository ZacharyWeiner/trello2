'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, List, Card, ProgressData } from '@/types';
import { ThermometerProgress } from '@/components/progress/ThermometerProgress';
import { Thermometer, Target, Calendar, TrendingUp, Settings, X, Flame, Snowflake, Zap } from 'lucide-react';

interface ThermometerWidgetProps {
  board: Board;
  lists: List[];
  cards: Record<string, Card[]>;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermometerWidget: React.FC<ThermometerWidgetProps> = ({
  board,
  lists,
  cards,
  isOpen,
  onClose,
}) => {
  const [progressType, setProgressType] = useState<'tasks_completed' | 'cards_created' | 'checklist_completion' | 'sprint_progress'>('tasks_completed');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'sprint'>('weekly');
  const [theme, setTheme] = useState<'classic' | 'hot' | 'cold' | 'electric'>('classic');
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

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
    let milestones: ProgressData['milestones'] = [];

    switch (progressType) {
      case 'tasks_completed':
        // Count completed cards (cards in "Done" lists)
        const doneListIds = lists
          .filter(list => list.listType === 'done' || list.title.toLowerCase().includes('done'))
          .map(list => list.id);
        
        current = allCards.filter(card => 
          doneListIds.includes(card.listId) &&
          card.updatedAt >= startDate &&
          card.updatedAt <= endDate
        ).length;
        
        target = Math.max(current + 10, 20); // Dynamic target based on current progress
        name = 'Task Completion Progress';
        description = 'Track completed tasks moved to Done lists';
        color = '#10b981';
        
        milestones = [
          { id: 'm1', name: '25% Complete', value: Math.round(target * 0.25), reached: current >= Math.round(target * 0.25), color: '#84cc16', icon: '🎯' },
          { id: 'm2', name: '50% Complete', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#f59e0b', icon: '⚡' },
          { id: 'm3', name: '75% Complete', value: Math.round(target * 0.75), reached: current >= Math.round(target * 0.75), color: '#ef4444', icon: '🔥' },
          { id: 'm4', name: 'Goal Achieved!', value: target, reached: current >= target, color: '#8b5cf6', icon: '🏆' }
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
        
        milestones = [
          { id: 'm1', name: 'Getting Started', value: Math.round(target * 0.2), reached: current >= Math.round(target * 0.2), color: '#06b6d4', icon: '📝' },
          { id: 'm2', name: 'Building Momentum', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#3b82f6', icon: '🚀' },
          { id: 'm3', name: 'Almost There', value: Math.round(target * 0.8), reached: current >= Math.round(target * 0.8), color: '#8b5cf6', icon: '⭐' },
          { id: 'm4', name: 'Creation Master!', value: target, reached: current >= target, color: '#f59e0b', icon: '👑' }
        ];
        break;
        
      case 'checklist_completion':
        // Count completed checklist items
        let totalItems = 0;
        let completedItems = 0;
        
        allCards.forEach(card => {
          (card.checklists || []).forEach(checklist => {
            (checklist.items || []).forEach(item => {
              totalItems++;
              if (item.completed) completedItems++;
            });
          });
        });
        
        current = completedItems;
        target = Math.max(totalItems, 1);
        name = 'Checklist Completion';
        description = 'Track progress on all checklist items';
        color = '#ef4444';
        
        milestones = [
          { id: 'm1', name: 'First Steps', value: Math.round(target * 0.25), reached: current >= Math.round(target * 0.25), color: '#10b981', icon: '✅' },
          { id: 'm2', name: 'Halfway Point', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#f59e0b', icon: '📋' },
          { id: 'm3', name: 'Final Push', value: Math.round(target * 0.75), reached: current >= Math.round(target * 0.75), color: '#ef4444', icon: '🎯' },
          { id: 'm4', name: 'All Done!', value: target, reached: current >= target, color: '#8b5cf6', icon: '🎉' }
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
        target = totalCards || 1;
        name = 'Sprint Progress';
        description = 'Overall progress through the sprint workflow';
        color = '#8b5cf6';
        
        milestones = [
          { id: 'm1', name: 'Sprint Started', value: Math.round(target * 0.1), reached: current >= Math.round(target * 0.1), color: '#06b6d4', icon: '🏁' },
          { id: 'm2', name: 'Mid-Sprint', value: Math.round(target * 0.5), reached: current >= Math.round(target * 0.5), color: '#3b82f6', icon: '⚡' },
          { id: 'm3', name: 'Sprint Review', value: Math.round(target * 0.9), reached: current >= Math.round(target * 0.9), color: '#f59e0b', icon: '🔍' },
          { id: 'm4', name: 'Sprint Complete!', value: target, reached: current >= target, color: '#10b981', icon: '🎯' }
        ];
        break;
    }

    const progress: ProgressData = {
      id: `thermometer-${progressType}-${timeframe}`,
      name,
      current,
      target,
      color,
      category: 'tasks',
      description,
      startDate,
      endDate,
      milestones
    };

    setProgressData(progress);
  };

  const getProgressTypeIcon = () => {
    switch (progressType) {
      case 'tasks_completed':
        return '✅';
      case 'cards_created':
        return '📝';
      case 'checklist_completion':
        return '📋';
      case 'sprint_progress':
        return '🏃';
      default:
        return '📊';
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'hot':
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'cold':
        return <Snowflake className="h-4 w-4 text-blue-500" />;
      case 'electric':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Thermometer className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeframeTitle = () => {
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
        return '';
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Thermometer className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Progress Thermometer - {board.title}
              </h2>
              <p className="text-sm text-gray-600">
                Visual temperature-based progress tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Progress Type:</label>
              <select
                value={progressType}
                onChange={(e) => setProgressType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tasks_completed">✅ Tasks Completed</option>
                <option value="cards_created">📝 Cards Created</option>
                <option value="checklist_completion">📋 Checklist Items</option>
                <option value="sprint_progress">🏃 Sprint Progress</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">📅 Today</option>
                <option value="weekly">📊 This Week</option>
                <option value="monthly">📈 This Month</option>
                <option value="sprint">🏃 Current Sprint</option>
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
                <option value="classic">🌡️ Classic</option>
                <option value="hot">🔥 Hot</option>
                <option value="cold">❄️ Cold</option>
                <option value="electric">⚡ Electric</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progress Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {progressData ? (
            <div className="space-y-6">
              {/* Progress Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getProgressTypeIcon()}</span>
                    <h3 className="font-medium text-gray-900">Progress Type</h3>
                  </div>
                  <p className="text-sm text-gray-600">{progressData.description}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium text-gray-900">Current Progress</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {progressData.current} of {progressData.target}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((progressData.current / progressData.target) * 100)}% complete
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium text-gray-900">Timeframe</h3>
                  </div>
                  <p className="text-sm text-gray-600">{getTimeframeTitle()}</p>
                  <p className="text-xs text-gray-500">
                    {progressData.startDate?.toLocaleDateString()} - {progressData.endDate?.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Thermometer Visualization */}
              <div className="flex justify-center items-center py-8">
                <div className="flex items-center gap-8">
                  <ThermometerProgress
                    data={progressData}
                    height={300}
                    width={80}
                    animated={true}
                    theme={theme}
                    showBubbles={true}
                  />
                  
                  {/* Milestones */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 mb-3">Milestones</h4>
                    {progressData.milestones?.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          milestone.reached ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <span className="text-lg">{milestone.icon}</span>
                        <div className="flex-1">
                          <p className={`font-medium ${milestone.reached ? 'text-green-900' : 'text-gray-700'}`}>
                            {milestone.name}
                          </p>
                          <p className={`text-sm ${milestone.reached ? 'text-green-600' : 'text-gray-500'}`}>
                            {milestone.value} {progressType.replace('_', ' ')}
                          </p>
                        </div>
                        {milestone.reached && (
                          <div className="text-green-500">
                            ✅
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">🌡️ Thermometer Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• The thermometer fills up as you make progress toward your goal</li>
                  <li>• Different themes provide visual variety (hot, cold, electric)</li>
                  <li>• Milestones mark important progress checkpoints</li>
                  <li>• Bubbles animate when progress is being made</li>
                  <li>• Try different progress types to track various metrics</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Thermometer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Calculating progress...
              </h3>
              <p className="text-gray-600">
                Analyzing board data to create your progress thermometer!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Progress updates automatically based on board activity
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => generateProgressData()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Progress
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