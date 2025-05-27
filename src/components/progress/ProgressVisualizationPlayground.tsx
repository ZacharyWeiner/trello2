'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PizzaChart } from './PizzaChart';
import { ThermometerProgress } from './ThermometerProgress';
import { TeamProgressRaceComponent } from './TeamProgressRace';
import { BurndownChartComponent } from './BurndownChart';
import { 
  ProgressData, 
  TeamProgressRace, 
  BurndownChart, 
  BurndownTheme,
  ProgressTheme 
} from '@/types';
import { 
  BarChart3, 
  Pizza, 
  Thermometer, 
  Trophy, 
  TrendingDown, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  Palette,
  Zap,
  Sparkles
} from 'lucide-react';

interface ProgressVisualizationPlaygroundProps {
  className?: string;
}

export const ProgressVisualizationPlayground: React.FC<ProgressVisualizationPlaygroundProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'pizza' | 'thermometer' | 'race' | 'burndown'>('pizza');
  const [isAnimated, setIsAnimated] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classic');

  // Mock data for demonstrations
  const [progressData, setProgressData] = useState<ProgressData>({
    id: 'demo-progress',
    name: 'Sprint Goals',
    current: 65,
    target: 100,
    color: '#3b82f6',
    category: 'tasks',
    description: 'Complete all sprint tasks and deliverables',
    milestones: [
      { id: 'm1', name: 'Planning', value: 20, reached: true, reachedAt: new Date(), color: '#10b981', icon: '📋' },
      { id: 'm2', name: 'Development', value: 60, reached: true, reachedAt: new Date(), color: '#f59e0b', icon: '⚡' },
      { id: 'm3', name: 'Testing', value: 80, reached: false, color: '#ef4444', icon: '🧪' },
      { id: 'm4', name: 'Deployment', value: 100, reached: false, color: '#8b5cf6', icon: '🚀' }
    ]
  });

  const [teamRace, setTeamRace] = useState<TeamProgressRace>({
    id: 'demo-race',
    name: 'Weekly Task Sprint',
    description: 'Who can complete the most tasks this week?',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    participants: [
      { userId: 'user1', userName: 'Alice', currentProgress: 85, position: 1, color: '#3b82f6' },
      { userId: 'user2', userName: 'Bob', currentProgress: 72, position: 2, color: '#10b981' },
      { userId: 'user3', userName: 'Carol', currentProgress: 68, position: 3, color: '#f59e0b' },
      { userId: 'user4', userName: 'David', currentProgress: 45, position: 4, color: '#ef4444' }
    ],
    category: 'tasks_completed',
    target: 100,
    isActive: true,
    theme: {
      id: 'racing',
      name: 'Racing Theme',
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#000000'
      },
      animations: {
        duration: 1000,
        easing: 'ease-out',
        effects: ['bounce', 'pulse']
      },
      icons: {
        progress: '🏃',
        milestone: '🏁',
        celebration: '🎉'
      }
    }
  });

  const [burndownData, setBurndownData] = useState<BurndownChart>({
    id: 'demo-burndown',
    boardId: 'demo-board',
    sprintName: 'Sprint 23 - Feature Development',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    totalWork: 100,
    isActive: true,
    theme: {
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
    dailyData: [
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), remainingWork: 100, idealRemaining: 100, completedWork: 0, scope: 100 },
      { date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), remainingWork: 92, idealRemaining: 93, completedWork: 8, scope: 100 },
      { date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), remainingWork: 85, idealRemaining: 86, completedWork: 15, scope: 100 },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), remainingWork: 78, idealRemaining: 79, completedWork: 22, scope: 100 },
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), remainingWork: 70, idealRemaining: 71, completedWork: 30, scope: 100 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), remainingWork: 65, idealRemaining: 64, completedWork: 35, scope: 100 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), remainingWork: 58, idealRemaining: 57, completedWork: 42, scope: 100 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), remainingWork: 50, idealRemaining: 50, completedWork: 50, scope: 100 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remainingWork: 42, idealRemaining: 43, completedWork: 58, scope: 100 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remainingWork: 35, idealRemaining: 36, completedWork: 65, scope: 100 }
    ]
  });

  // Auto-update simulation
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      setProgressData(prev => ({
        ...prev,
        current: Math.min(prev.current + Math.random() * 5, prev.target)
      }));

      setTeamRace(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          currentProgress: Math.min(p.currentProgress + Math.random() * 3, prev.target)
        }))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [autoUpdate]);

  const resetProgress = () => {
    setProgressData(prev => ({ ...prev, current: 0 }));
    setTeamRace(prev => ({
      ...prev,
      participants: prev.participants.map(p => ({ ...p, currentProgress: 0 }))
    }));
  };

  // Get the current burndown theme based on selected theme
  const getCurrentBurndownTheme = () => {
    const themeMap = {
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
    
    return themeMap[selectedTheme as keyof typeof themeMap] || themeMap.classic;
  };

  const themes = {
    classic: { name: 'Classic', icon: '📊', color: '#3b82f6' },
    space: { name: 'Space', icon: '🚀', color: '#8b5cf6' },
    forest: { name: 'Forest', icon: '🌲', color: '#10b981' },
    fire: { name: 'Fire', icon: '🔥', color: '#ef4444' }
  };

  const tabs = [
    { id: 'pizza', name: 'Pizza Chart', icon: Pizza, color: '#f59e0b' },
    { id: 'thermometer', name: 'Thermometer', icon: Thermometer, color: '#ef4444' },
    { id: 'race', name: 'Team Race', icon: Trophy, color: '#10b981' },
    { id: 'burndown', name: 'Burndown', icon: TrendingDown, color: '#8b5cf6' }
  ] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              Progress Visualization Playground
            </h2>
            <p className="text-gray-600 mt-1">
              Explore different ways to visualize and track progress with animated charts and fun themes
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAnimated(!isAnimated)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAnimated 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Zap className="h-4 w-4" />
              {isAnimated ? 'Animated' : 'Static'}
            </button>
            
            <button
              onClick={() => setAutoUpdate(!autoUpdate)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoUpdate 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoUpdate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {autoUpdate ? 'Auto Update' : 'Manual'}
            </button>
            
            <button
              onClick={resetProgress}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Theme:</span>
          </div>
          <div className="flex gap-2">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedTheme === key
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={selectedTheme === key ? { backgroundColor: theme.color } : {}}
              >
                <span>{theme.icon}</span>
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={activeTab === tab.id ? { backgroundColor: tab.color } : {}}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          {activeTab === 'pizza' && (
            <div className="flex flex-col items-center">
              <PizzaChart
                data={{
                  ...progressData,
                  color: selectedTheme === 'space' ? '#8b5cf6' : selectedTheme === 'forest' ? '#22c55e' : selectedTheme === 'fire' ? '#ef4444' : '#3b82f6'
                }}
                size="large"
                animated={isAnimated}
                showMilestones={true}
                theme={selectedTheme as any}
                onMilestoneReached={(milestone) => {
                  console.log('Milestone reached:', milestone.name);
                }}
              />
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🍕 Pizza Progress Chart</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  Watch your progress fill up like delicious pizza slices! Each slice represents progress toward your goal, 
                  with milestones marked around the pizza for key achievements.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'thermometer' && (
            <div className="flex flex-col items-center">
              <ThermometerProgress
                data={{
                  ...progressData,
                  color: selectedTheme === 'space' ? '#8b5cf6' : selectedTheme === 'forest' ? '#22c55e' : selectedTheme === 'fire' ? '#ef4444' : '#3b82f6'
                }}
                height={250}
                width={80}
                animated={isAnimated}
                theme={selectedTheme === 'fire' ? 'hot' : selectedTheme === 'space' ? 'electric' : selectedTheme === 'forest' ? 'cold' : 'classic'}
                showBubbles={true}
              />
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌡️ Thermometer Progress</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  Feel the heat as your progress rises! The thermometer fills with animated bubbles and changes 
                  color based on your progress level. Different themes provide unique visual experiences.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'race' && (
            <div>
              <TeamProgressRaceComponent
                race={{
                  ...teamRace,
                  theme: {
                    ...teamRace.theme,
                    colors: {
                      primary: selectedTheme === 'space' ? '#8b5cf6' : selectedTheme === 'forest' ? '#22c55e' : selectedTheme === 'fire' ? '#ef4444' : '#3b82f6',
                      secondary: selectedTheme === 'space' ? '#06b6d4' : selectedTheme === 'forest' ? '#84cc16' : selectedTheme === 'fire' ? '#f97316' : '#10b981',
                      accent: selectedTheme === 'space' ? '#f97316' : selectedTheme === 'forest' ? '#eab308' : selectedTheme === 'fire' ? '#eab308' : '#f59e0b',
                      background: selectedTheme === 'space' ? '#0f172a' : '#ffffff',
                      text: selectedTheme === 'space' ? '#ffffff' : '#000000'
                    }
                  }
                }}
                animated={isAnimated}
                showAvatars={true}
                raceHeight={300}
              />
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🏁 Team Progress Race</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  Turn progress tracking into a fun competition! Watch team members race toward the finish line 
                  with animated avatars, real-time leaderboards, and celebration effects.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'burndown' && (
            <div>
              <BurndownChartComponent
                burndown={burndownData}
                theme={getCurrentBurndownTheme()}
                animated={isAnimated}
                showParticles={selectedTheme !== 'classic'}
              />
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📉 Burndown Chart</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  Track sprint progress with style! Choose from different themes including space, forest, and fire 
                  themes with animated particles and visual effects that make data analysis engaging.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-4 text-white"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Pizza className="h-8 w-8 mb-3" />
          <h4 className="font-semibold mb-1">Pizza Slices</h4>
          <p className="text-sm opacity-90">Visual progress with delicious pizza slices and milestone markers</p>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-red-400 to-pink-500 rounded-lg p-4 text-white"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Thermometer className="h-8 w-8 mb-3" />
          <h4 className="font-semibold mb-1">Thermometers</h4>
          <p className="text-sm opacity-90">Temperature-based progress with bubbles and themed visualizations</p>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-4 text-white"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Trophy className="h-8 w-8 mb-3" />
          <h4 className="font-semibold mb-1">Team Races</h4>
          <p className="text-sm opacity-90">Competitive progress tracking with animated racing elements</p>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg p-4 text-white"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Sparkles className="h-8 w-8 mb-3" />
          <h4 className="font-semibold mb-1">Fun Themes</h4>
          <p className="text-sm opacity-90">Space, forest, fire themes with particles and special effects</p>
        </motion.div>
      </div>
    </div>
  );
}; 