'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Board, List, Card, ProgressData } from '@/types';
import { GifEnhancedPizzaChart } from '../progress/GifEnhancedPizzaChart';
import { StoryModeNarrative } from '../progress/StoryModeNarrative';
import { 
  Pizza, 
  BookOpen, 
  Sparkles, 
  Users, 
  Trophy, 
  Target,
  Calendar,
  TrendingUp,
  Zap,
  Heart
} from 'lucide-react';

interface BoardWithStoryModeProps {
  board: Board;
  lists: List[];
  cards: Card[];
  userId: string;
}

export const BoardWithStoryMode: React.FC<BoardWithStoryModeProps> = ({
  board,
  lists,
  cards,
  userId
}) => {
  const [showPizzaWidget, setShowPizzaWidget] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [celebrationGifs, setCelebrationGifs] = useState<string[]>([]);
  const [storyModeActive, setStoryModeActive] = useState(false);

  // Generate real progress data from board
  useEffect(() => {
    const generateProgressFromBoard = () => {
      const doneCards = cards.filter(card => {
        const list = lists.find(l => l.id === card.listId);
        return list?.listType === 'done' || list?.title.toLowerCase().includes('done');
      });

      const totalCards = cards.length;
      const completedCards = doneCards.length;

      const data: ProgressData = {
        id: `progress-${board.id}`,
        name: `${board.title} Progress`,
        current: completedCards,
        target: Math.max(totalCards, 8), // Ensure at least 8 for pizza slices
        color: '#8B5CF6',
        category: 'tasks',
        description: `Track completion progress for ${board.title}`,
        milestones: [
          {
            id: 'quarter',
            name: 'First Quarter',
            value: Math.ceil(Math.max(totalCards, 8) * 0.25),
            reached: completedCards >= Math.ceil(Math.max(totalCards, 8) * 0.25),
            color: '#06b6d4',
            icon: '🎯'
          },
          {
            id: 'half',
            name: 'Halfway There',
            value: Math.ceil(Math.max(totalCards, 8) * 0.5),
            reached: completedCards >= Math.ceil(Math.max(totalCards, 8) * 0.5),
            color: '#3b82f6',
            icon: '🚀'
          },
          {
            id: 'three-quarters',
            name: 'Almost Done',
            value: Math.ceil(Math.max(totalCards, 8) * 0.75),
            reached: completedCards >= Math.ceil(Math.max(totalCards, 8) * 0.75),
            color: '#8b5cf6',
            icon: '⭐'
          },
          {
            id: 'complete',
            name: 'Mission Complete!',
            value: Math.max(totalCards, 8),
            reached: completedCards >= Math.max(totalCards, 8),
            color: '#f59e0b',
            icon: '🏆'
          }
        ]
      };

      setProgressData(data);
    };

    generateProgressFromBoard();
  }, [board, lists, cards]);

  // Trigger celebration GIFs when milestones are reached
  const handleMilestoneReached = (milestone: any) => {
    const celebrationGifUrls = [
      'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', // Typing celebration
      'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', // Success celebration
      'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Team celebration
      'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif', // Victory dance
      'https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif'  // Confetti celebration
    ];

    const randomGif = celebrationGifUrls[Math.floor(Math.random() * celebrationGifUrls.length)];
    setCelebrationGifs(prev => [...prev, randomGif]);

    // Remove GIF after 3 seconds
    setTimeout(() => {
      setCelebrationGifs(prev => prev.filter(gif => gif !== randomGif));
    }, 3000);

    // Trigger browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🎉 Milestone Reached: ${milestone.name}!`, {
        body: `Great progress on ${board.title}!`,
        icon: '/pizza-icon.png'
      });
    }
  };

  const getProgressPercentage = () => {
    if (!progressData) return 0;
    return Math.round((progressData.current / progressData.target) * 100);
  };

  const getCompletedTasks = () => {
    return cards.filter(card => {
      const list = lists.find(l => l.id === card.listId);
      return list?.listType === 'done' || list?.title.toLowerCase().includes('done');
    }).length;
  };

  const getInProgressTasks = () => {
    return cards.filter(card => {
      const list = lists.find(l => l.id === card.listId);
      return list?.listType === 'doing' || list?.title.toLowerCase().includes('progress') || list?.title.toLowerCase().includes('doing');
    }).length;
  };

  const getTodoTasks = () => {
    return cards.filter(card => {
      const list = lists.find(l => l.id === card.listId);
      return list?.listType === 'todo' || list?.title.toLowerCase().includes('todo') || list?.title.toLowerCase().includes('backlog');
    }).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
                <p className="text-gray-600">{board.description || 'Project board with Story Mode'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setShowPizzaWidget(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pizza className="h-4 w-4" />
                View Progress Pizza
              </motion.button>
              
              <motion.button
                onClick={() => setStoryModeActive(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-4 w-4" />
                Launch Story Mode
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Board Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Completed</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{getCompletedTasks()}</p>
            <p className="text-sm text-gray-500">Tasks finished</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">In Progress</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{getInProgressTasks()}</p>
            <p className="text-sm text-gray-500">Active tasks</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">To Do</h3>
            </div>
            <p className="text-3xl font-bold text-gray-600">{getTodoTasks()}</p>
            <p className="text-sm text-gray-500">Pending tasks</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Progress</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{getProgressPercentage()}%</p>
            <p className="text-sm text-gray-500">Overall completion</p>
          </div>
        </motion.div>

        {/* Lists Display */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {lists.map((list, index) => (
            <div key={list.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{list.title}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {cards.filter(card => card.listId === list.id).length} cards
                </span>
              </div>
              
              <div className="space-y-2">
                {cards
                  .filter(card => card.listId === list.id)
                  .slice(0, 3)
                  .map(card => (
                    <div key={card.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{card.title}</h4>
                      {card.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{card.description}</p>
                      )}
                    </div>
                  ))}
                
                {cards.filter(card => card.listId === list.id).length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-500">
                      +{cards.filter(card => card.listId === list.id).length - 3} more cards
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Celebration GIFs Overlay */}
        <AnimatePresence>
          {celebrationGifs.map((gifUrl, index) => (
            <motion.div
              key={`${gifUrl}-${index}`}
              className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-64 h-64 rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={gifUrl}
                  alt="Celebration"
                  className="w-full h-full object-cover"
                  style={{ 
                    filter: 'brightness(1.1) saturate(1.2)',
                    mixBlendMode: 'multiply'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pizza Widget Modal */}
        <AnimatePresence>
          {showPizzaWidget && progressData && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pizza className="h-8 w-8" />
                      <div>
                        <h2 className="text-2xl font-bold">🍕 Progress Pizza with Story Mode</h2>
                        <p className="text-orange-100">Interactive progress tracking with GIF celebrations</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPizzaWidget(false)}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto max-h-[70vh]">
                  <div className="flex flex-col items-center">
                    {/* Enhanced Pizza Chart with GIFs */}
                    <div className="mb-8">
                      <GifEnhancedPizzaChart
                        data={progressData}
                        size="large"
                        animated={true}
                        showMilestones={true}
                        theme="space"
                        userId={userId}
                        boardId={board.id}
                        enableBiometrics={true}
                        enableAI={true}
                        enableStoryMode={true}
                        board={board}
                        lists={lists}
                        cards={cards}
                        onMilestoneReached={handleMilestoneReached}
                      />
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      <div className="bg-purple-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-purple-900 mb-2">Biometric Integration</h3>
                        <p className="text-sm text-purple-700">
                          Heart rate and stress level monitoring with responsive GIF suggestions
                        </p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-blue-900 mb-2">AI-Powered GIFs</h3>
                        <p className="text-sm text-blue-700">
                          Context-aware GIF suggestions based on project progress and team mood
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-green-900 mb-2">Story Mode</h3>
                        <p className="text-sm text-green-700">
                          Transform your project into an epic narrative with animated storytelling
                        </p>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 bg-gray-50 rounded-xl p-6 w-full">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        How to Experience the GIF Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                          <h4 className="font-medium mb-2">🎬 Interactive Elements:</h4>
                          <ul className="space-y-1">
                            <li>• Click completed pizza slices for celebration GIFs</li>
                            <li>• Toggle biometric monitoring for responsive animations</li>
                            <li>• Enable AI mode for context-aware GIF suggestions</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">📚 Story Mode:</h4>
                          <ul className="space-y-1">
                            <li>• Click "📚 Story" button to launch narrative mode</li>
                            <li>• Watch your project journey as an epic tale</li>
                            <li>• Navigate through chapters with cinematic GIFs</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Story Mode Modal */}
        <AnimatePresence>
          {storyModeActive && progressData && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Story Mode Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-8 w-8" />
                      <div>
                        <h2 className="text-2xl font-bold">🎭 Story Mode: {board.title}</h2>
                        <p className="text-purple-100">Experience your project as an epic narrative adventure</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStoryModeActive(false)}
                      className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Story Mode Content */}
                <div className="p-0 overflow-hidden">
                  <StoryModeNarrative
                    board={board}
                    lists={lists}
                    cards={cards}
                    userId={userId}
                    isActive={storyModeActive}
                    onClose={() => setStoryModeActive(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 