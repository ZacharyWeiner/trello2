'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GifEnhancedPizzaChart } from '../progress/GifEnhancedPizzaChart';
import { ProgressData } from '@/types';
import { BookOpen, Play, Users, Trophy, Sparkles, Zap } from 'lucide-react';

export const StoryModeDemo: React.FC = () => {
  const [demoProgress, setDemoProgress] = useState(65);
  const [storyModeActive, setStoryModeActive] = useState(false);

  // Sample data for the demo
  const sampleProgressData: ProgressData = {
    id: 'demo-progress-1',
    name: 'Epic Project Quest',
    current: Math.round((demoProgress / 100) * 20),
    target: 20,
    color: '#8B5CF6',
    category: 'tasks',
    description: 'Building the ultimate productivity platform'
  };

  const sampleBoard = {
    id: 'demo-board-1',
    title: 'Epic Project Quest: The Ultimate Productivity Platform',
    description: 'A legendary journey to create the most amazing project management tool ever conceived',
    members: [
      {
        userId: 'user-1',
        displayName: 'Alex the Architect',
        role: 'Project Lead'
      },
      {
        userId: 'user-2',
        displayName: 'Sam the Strategist',
        role: 'Product Manager'
      },
      {
        userId: 'user-3',
        displayName: 'Jordan the Genius',
        role: 'Lead Developer'
      },
      {
        userId: 'user-4',
        displayName: 'Casey the Creative',
        role: 'UX Designer'
      }
    ]
  };

  const sampleLists = [
    {
      id: 'list-1',
      title: 'The Planning Phase',
      listType: 'done',
      position: 1
    },
    {
      id: 'list-2',
      title: 'The Development Saga',
      listType: 'in_progress',
      position: 2
    },
    {
      id: 'list-3',
      title: 'The Testing Trials',
      listType: 'todo',
      position: 3
    },
    {
      id: 'list-4',
      title: 'The Launch Legend',
      listType: 'todo',
      position: 4
    }
  ];

  const sampleCards = [
    {
      id: 'card-1',
      title: 'Design the Ultimate User Interface',
      description: 'Create a UI so beautiful it brings tears of joy',
      listId: 'list-1',
      position: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      priority: 'high'
    },
    {
      id: 'card-2',
      title: 'Implement the Core Engine',
      description: 'Build the heart of our productivity beast',
      listId: 'list-2',
      position: 1,
      createdAt: '2024-01-21T09:00:00Z',
      updatedAt: '2024-01-25T14:20:00Z',
      priority: 'high'
    },
    {
      id: 'card-3',
      title: 'Create the Story Mode Feature',
      description: 'Transform boring project management into epic adventures',
      listId: 'list-2',
      position: 2,
      createdAt: '2024-01-22T11:00:00Z',
      updatedAt: '2024-01-26T16:45:00Z',
      priority: 'medium'
    },
    {
      id: 'card-4',
      title: 'Add Biometric Integration',
      description: 'Connect hearts and minds to productivity',
      listId: 'list-3',
      position: 1,
      createdAt: '2024-01-23T13:00:00Z',
      updatedAt: '2024-01-27T10:15:00Z',
      priority: 'medium'
    },
    {
      id: 'card-5',
      title: 'Launch the Revolution',
      description: 'Change the world, one task at a time',
      listId: 'list-4',
      position: 1,
      createdAt: '2024-01-24T08:00:00Z',
      updatedAt: '2024-01-28T12:00:00Z',
      priority: 'epic'
    }
  ];

  const storyFeatures = [
    {
      icon: '🎭',
      title: 'Cinematic Storytelling',
      description: 'Transform your project journey into an epic narrative with dramatic chapters and character development'
    },
    {
      icon: '🎬',
      title: 'Animated GIF Sequences',
      description: 'Watch your progress come alive with contextual GIFs that respond to your achievements'
    },
    {
      icon: '👥',
      title: 'Character Development',
      description: 'Team members become heroes, mentors, and supporters in your project\'s epic tale'
    },
    {
      icon: '🏆',
      title: 'Milestone Celebrations',
      description: 'Major achievements trigger spectacular story moments with voice narration'
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Track story statistics including events, collaborations, and plot twists'
    },
    {
      icon: '🎮',
      title: 'Interactive Controls',
      description: 'Navigate through chapters, pause for reflection, or skip to exciting moments'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl font-bold text-white mb-4"
            animate={{ 
              textShadow: [
                "0 0 20px #fff",
                "0 0 30px #8B5CF6, 0 0 40px #8B5CF6",
                "0 0 20px #fff"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨ STORY MODE ACTIVATED ✨
          </motion.h1>
          <p className="text-xl text-purple-200 mb-8">
            Transform your project management into an epic narrative adventure
          </p>
          
          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <button
              onClick={() => setStoryModeActive(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <Play className="h-6 w-6" />
              Launch Story Mode
            </button>
            
            <button
              onClick={() => setDemoProgress(Math.min(100, demoProgress + 15))}
              className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Trophy className="h-5 w-5" />
              Complete Task
            </button>
          </motion.div>
        </motion.div>

        {/* Demo Pizza Chart */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20">
            <GifEnhancedPizzaChart
              data={sampleProgressData}
              size="large"
              animated={true}
              showMilestones={true}
              theme="space"
              userId="demo-user"
              boardId="demo-board-1"
              enableBiometrics={true}
              enableAI={true}
              enableStoryMode={true}
              board={sampleBoard}
              lists={sampleLists}
              cards={sampleCards}
            />
          </div>
        </motion.div>

        {/* Story Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {storyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-purple-200">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Demo Controls */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            Interactive Demo Controls
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Progress Control */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Project Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-purple-200 min-w-[100px]">Progress:</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${demoProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-white font-bold min-w-[50px]">{demoProgress}%</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setDemoProgress(Math.max(0, demoProgress - 10))}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => setDemoProgress(Math.min(100, demoProgress + 10))}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => setDemoProgress(100)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Complete!
                  </button>
                </div>
              </div>
            </div>

            {/* Story Stats */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Story Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-800 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{sampleCards.length}</div>
                  <div className="text-purple-200 text-sm">Story Events</div>
                </div>
                <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{sampleBoard.members.length}</div>
                  <div className="text-blue-200 text-sm">Characters</div>
                </div>
                <div className="bg-green-800 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-green-200 text-sm">Chapters</div>
                </div>
                <div className="bg-yellow-800 bg-opacity-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">2</div>
                  <div className="text-yellow-200 text-sm">Collaborations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <motion.button
              onClick={() => setStoryModeActive(true)}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-bold text-xl hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center gap-4 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="h-6 w-6" />
              Experience the Epic Journey
              <Zap className="h-6 w-6" />
            </motion.button>
            <p className="text-purple-200 mt-4">
              Click the "📚 Story" button on the pizza chart above to begin your narrative adventure!
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p className="text-purple-300">
            🎭 Transform your productivity into an epic tale • 🚀 Where every task becomes a heroic quest
          </p>
        </motion.div>
      </div>
    </div>
  );
}; 