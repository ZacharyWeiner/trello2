'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sword, 
  Shield, 
  Crown, 
  Star, 
  Users, 
  BookOpen, 
  Sparkles, 
  Trophy,
  Zap,
  Heart,
  Gem,
  Target,
  ArrowRight,
  Play
} from 'lucide-react';
import { QuestModeButton } from '@/components/quest/QuestModeButton';
import { Board, List, Card } from '@/types';

export default function QuestModeDemoPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Sample data for the demo
  const sampleBoard: Board = {
    id: 'quest-demo-board',
    title: 'Epic Project Quest',
    description: 'A legendary project where heroes unite to build something amazing',
    createdBy: 'quest-master',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [
      {
        userId: 'hero-1',
        email: 'sarah@example.com',
        displayName: 'Sarah the Strategist',
        role: 'admin',
        joinedAt: new Date(),
        invitedBy: 'quest-master'
      },
      {
        userId: 'hero-2',
        email: 'alex@example.com',
        displayName: 'Alex the Architect',
        role: 'member',
        joinedAt: new Date(),
        invitedBy: 'quest-master'
      },
      {
        userId: 'hero-3',
        email: 'jordan@example.com',
        displayName: 'Jordan the Innovator',
        role: 'member',
        joinedAt: new Date(),
        invitedBy: 'quest-master'
      }
    ]
  };

  const sampleLists: List[] = [
    {
      id: 'quest-backlog',
      boardId: 'quest-demo-board',
      title: 'Quest Backlog',
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      listType: 'backlog'
    },
    {
      id: 'active-quests',
      boardId: 'quest-demo-board',
      title: 'Active Quests',
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      listType: 'doing'
    },
    {
      id: 'completed-quests',
      boardId: 'quest-demo-board',
      title: 'Completed Quests',
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      listType: 'done'
    }
  ];

  const sampleCards: Card[] = [
    {
      id: 'quest-1',
      listId: 'completed-quests',
      boardId: 'quest-demo-board',
      title: 'Design the User Interface',
      description: 'Create a beautiful and intuitive interface that users will love',
      position: 0,
      createdBy: 'hero-1',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: 'quest-2',
      listId: 'completed-quests',
      boardId: 'quest-demo-board',
      title: 'Implement Authentication System',
      description: 'Build a secure login and registration system',
      position: 1,
      createdBy: 'hero-2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: 'quest-3',
      listId: 'completed-quests',
      boardId: 'quest-demo-board',
      title: 'Create Database Schema',
      description: 'Design and implement the database structure',
      position: 2,
      createdBy: 'hero-3',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      priority: 'high'
    },
    {
      id: 'quest-4',
      listId: 'active-quests',
      boardId: 'quest-demo-board',
      title: 'Build API Endpoints',
      description: 'Create RESTful API endpoints for the application',
      position: 0,
      createdBy: 'hero-2',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      priority: 'medium'
    }
  ];

  const questFeatures = [
    {
      id: 'rpg-elements',
      title: 'RPG Progression System',
      description: 'Level up, earn experience points, and unlock achievements as you complete tasks',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      details: [
        'Character levels and experience points',
        '25+ achievements across 4 categories',
        'Skill trees and character progression',
        'Legendary artifacts and rewards'
      ]
    },
    {
      id: 'collaborative-storytelling',
      title: 'Collaborative Storytelling',
      description: 'Transform your project journey into an epic narrative with your team as heroes',
      icon: BookOpen,
      color: 'from-purple-500 to-blue-500',
      details: [
        'Dynamic story generation from project data',
        'Team members become story characters',
        'Chapter-based narrative structure',
        'Voice narration and cinematic presentation'
      ]
    },
    {
      id: 'quest-system',
      title: 'Epic Quest System',
      description: 'Turn mundane tasks into heroic quests with difficulty levels and rewards',
      icon: Sword,
      color: 'from-red-500 to-pink-500',
      details: [
        'Task difficulty assessment (Easy → Legendary)',
        'Dynamic reward calculation',
        'Boss battles for major milestones',
        'Alliance formation for team collaboration'
      ]
    },
    {
      id: 'character-development',
      title: 'Character Development',
      description: 'Each team member becomes a unique character with roles, skills, and personality',
      icon: Users,
      color: 'from-green-500 to-teal-500',
      details: [
        'Unique character roles (Hero, Mentor, Guardian)',
        'Skill sets and personality traits',
        'Character backstories and achievements',
        'Health, mana, and experience tracking'
      ]
    },
    {
      id: 'cinematic-experience',
      title: 'Cinematic Experience',
      description: 'Immersive full-screen storytelling with GIFs, animations, and voice narration',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      details: [
        'Full-screen cinematic mode',
        'Contextual GIF animations',
        'Voice synthesis narration',
        'Interactive story navigation'
      ]
    },
    {
      id: 'achievement-system',
      title: 'Achievement System',
      description: 'Unlock badges, track streaks, and compete on leaderboards',
      icon: Trophy,
      color: 'from-amber-500 to-yellow-500',
      details: [
        'Productivity, collaboration, and quality badges',
        'Streak tracking and consistency rewards',
        'Team leaderboards and competitions',
        'Rare and legendary achievement tiers'
      ]
    }
  ];

  const questStats = {
    totalQuests: 15,
    completedQuests: 8,
    activeHeroes: 4,
    experiencePoints: 2450,
    level: 7,
    achievements: 12,
    legendaryMoments: 3,
    alliances: 6
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold text-white mb-6"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 30px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚔️ QUEST MODE ⚔️
            </motion.h1>
            
            <motion.p 
              className="text-2xl md:text-3xl text-purple-200 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              RPG Elements + Collaborative Storytelling
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-xl text-blue-200 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Transform your project management into an epic adventure where team members become heroes, 
              tasks become quests, and achievements unlock legendary rewards. Experience the future of 
              collaborative productivity!
            </motion.p>

            {/* Demo Launch Button */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              <QuestModeButton
                board={sampleBoard}
                lists={sampleLists}
                cards={sampleCards}
                userId="demo-user"
                variant="primary"
                size="lg"
                className="text-xl px-8 py-4"
              />
              
              <motion.div
                className="flex items-center gap-2 text-white/80"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="h-5 w-5" />
                <span>Click to experience the magic!</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Quest Statistics */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">Your Quest Statistics</h2>
          <p className="text-xl text-purple-200">Track your heroic progress across all adventures</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Total Quests', value: questStats.totalQuests, icon: Target, color: 'from-blue-500 to-cyan-500' },
            { label: 'Experience Points', value: questStats.experiencePoints, icon: Star, color: 'from-yellow-500 to-orange-500' },
            { label: 'Hero Level', value: questStats.level, icon: Crown, color: 'from-purple-500 to-pink-500' },
            { label: 'Achievements', value: questStats.achievements, icon: Trophy, color: 'from-green-500 to-emerald-500' },
            { label: 'Active Heroes', value: questStats.activeHeroes, icon: Users, color: 'from-indigo-500 to-blue-500' },
            { label: 'Legendary Moments', value: questStats.legendaryMoments, icon: Gem, color: 'from-amber-500 to-yellow-500' },
            { label: 'Alliances Formed', value: questStats.alliances, icon: Heart, color: 'from-red-500 to-pink-500' },
            { label: 'Completed Quests', value: questStats.completedQuests, icon: Zap, color: 'from-teal-500 to-cyan-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl text-white text-center shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <stat.icon className="h-8 w-8 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">Epic Features</h2>
          <p className="text-xl text-purple-200">Discover the magical elements that transform work into adventure</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {questFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              className={`
                relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300
                ${selectedFeature === feature.id 
                  ? 'bg-white/20 border-2 border-white/30 shadow-2xl' 
                  : 'bg-white/10 border border-white/20 hover:bg-white/15'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              {/* Feature icon with gradient background */}
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-purple-200 mb-4">{feature.description}</p>

              {/* Expandable details */}
              <motion.div
                initial={false}
                animate={{ 
                  height: selectedFeature === feature.id ? 'auto' : 0,
                  opacity: selectedFeature === feature.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/20 pt-4 mt-4">
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <motion.li
                        key={detailIndex}
                        className="flex items-center gap-2 text-sm text-blue-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: detailIndex * 0.1 }}
                      >
                        <ArrowRight className="h-3 w-3 text-purple-400" />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Click indicator */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{ rotate: selectedFeature === feature.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="h-4 w-4 text-white/60" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sample Quest Data */}
      <div className="container mx-auto px-6 py-16">
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Sample Quest Data</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Board Info */}
            <div>
              <h4 className="text-lg font-semibold text-purple-200 mb-4">🏰 Quest Board: {sampleBoard.title}</h4>
              <p className="text-blue-200 mb-4">{sampleBoard.description}</p>
              
              <div className="space-y-2">
                <h5 className="font-medium text-white">👥 Party Members:</h5>
                {sampleBoard.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-2 text-sm text-purple-200">
                    <Crown className="h-3 w-3" />
                    {member.displayName} ({member.role})
                  </div>
                ))}
              </div>
            </div>

            {/* Quest Lists */}
            <div>
              <h4 className="text-lg font-semibold text-purple-200 mb-4">📋 Quest Categories:</h4>
              <div className="space-y-3">
                {sampleLists.map((list) => {
                  const listCards = sampleCards.filter(card => card.listId === list.id);
                  return (
                    <div key={list.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white font-medium">{list.title}</span>
                      <span className="text-purple-300 text-sm">{listCards.length} quests</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-900/30 rounded-lg">
            <h4 className="font-semibold text-blue-200 mb-2">🎬 Story Generation Preview:</h4>
            <p className="text-sm text-blue-100">
              Quest Mode will analyze this data and create:
            </p>
            <ul className="text-sm text-blue-100 mt-2 space-y-1">
              <li>• <strong>3 triumph events</strong> from completed quests</li>
              <li>• <strong>1 boss battle</strong> from the "Completed Quests" milestone</li>
              <li>• <strong>6 characters</strong> including The Project Oracle, Task Master, and team heroes</li>
              <li>• <strong>3 epic chapters</strong> telling your project's legendary story</li>
              <li>• <strong>Voice narration</strong> and contextual GIF animations</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Begin Your Quest?</h2>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Transform your team's productivity into an epic adventure. Every task becomes a heroic quest, 
            every milestone a legendary achievement, and every team member a hero in your project's story.
          </p>
          
          <QuestModeButton
            board={sampleBoard}
            lists={sampleLists}
            cards={sampleCards}
            userId="demo-user"
            variant="primary"
            size="lg"
            className="text-xl px-8 py-4"
          />
          
          <motion.p 
            className="text-purple-300 mt-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ Click above to experience the magic of Quest Mode! ✨
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
} 