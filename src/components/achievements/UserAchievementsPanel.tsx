'use client';

import React, { useState, useEffect } from 'react';
import { UserAchievements, Achievement } from '@/types';
import { Trophy, Flame, Star, Target, TrendingUp } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { AchievementService } from '@/services/achievementService';
import { ACHIEVEMENTS, calculateLevel } from '@/data/achievements';
import { motion } from 'framer-motion';

interface UserAchievementsPanelProps {
  userId: string;
}

export const UserAchievementsPanel: React.FC<UserAchievementsPanelProps> = ({ userId }) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'badges' | 'stats' | 'progress'>('badges');

  useEffect(() => {
    loadUserAchievements();
  }, [userId]);

  const loadUserAchievements = async () => {
    setLoading(true);
    try {
      const data = await AchievementService.getUserAchievements(userId);
      setUserAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userAchievements) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-16 w-16 bg-gray-100 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = calculateLevel(userAchievements.totalPoints);
  
  // Get current level threshold for progress calculation
  const currentLevelThreshold = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000][levelInfo.level - 1] || 0;
  const progressToNextLevel = levelInfo.nextLevelPoints
    ? ((userAchievements.totalPoints - currentLevelThreshold) / 
       (levelInfo.nextLevelPoints - currentLevelThreshold)) * 100
    : 100;

  // Group achievements by category
  const achievementsByCategory = ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    
    const userBadge = userAchievements.badges.find(b => b.achievementId === achievement.id);
    
    // Calculate progress for this achievement
    let progress = 0;
    const { criteria } = achievement;
    const { stats, streaks } = userAchievements;
    const streaksArray = Array.isArray(streaks) ? streaks : [];
    
    switch (criteria.type) {
      case 'task_completion':
        switch (criteria.metric) {
          case 'tasks_per_day':
            progress = stats?.tasksCompletedToday || 0;
            break;
          case 'total_tasks':
            progress = stats?.tasksCompleted || 0;
            break;
          case 'early_completions':
            progress = stats?.earlyCompletions || 0;
            break;
          case 'on_time_completions':
            progress = stats?.onTimeCompletions || 0;
            break;
          case 'perfect_cards':
            progress = stats?.perfectCards || 0;
            break;
        }
        break;
      case 'card_interaction':
        switch (criteria.metric) {
          case 'cards_created':
            progress = stats?.cardsCreated || 0;
            break;
          case 'organized_cards':
            progress = stats?.organizedCards || 0;
            break;
          case 'detailed_cards':
            progress = stats?.detailedCards || 0;
            break;
        }
        break;
      case 'streak':
        const streak = streaksArray.find(s => s.type === 'daily_tasks');
        progress = streak?.currentStreak || 0;
        break;
      case 'team_activity':
        switch (criteria.metric) {
          case 'comments_posted':
            progress = stats?.commentsPosted || 0;
            break;
          case 'unique_mentions':
            progress = stats?.uniqueMentions || 0;
            break;
        }
        break;
      case 'custom':
        switch (criteria.metric) {
          case 'achievements_unlocked':
            progress = userAchievements.badges.length;
            break;
        }
        break;
    }
    
    const enrichedAchievement = {
      ...achievement,
      unlockedAt: userBadge?.unlockedAt,
      isNew: userBadge?.isNew,
      progress
    };
    
    acc[achievement.category].push(enrichedAchievement);
    return acc;
  }, {} as Record<string, (Achievement & { progress: number; isNew?: boolean; unlockedAt?: Date })[]>);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header with level and points */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold">Achievements</h2>
              <p className="text-gray-600">Track your progress and unlock rewards</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">
              {userAchievements.totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
        </div>

        {/* Level progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Level {levelInfo.level}: {levelInfo.title}</span>
            </div>
            {levelInfo.nextLevelPoints && (
              <span className="text-sm text-gray-500">
                {userAchievements.totalPoints} / {levelInfo.nextLevelPoints} points
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Streak indicator */}
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-medium">
              {userAchievements.streaks[0]?.currentStreak || 0} Day Streak
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            <span className="font-medium">
              {userAchievements.badges.length} / {ACHIEVEMENTS.length} Badges
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {(['badges', 'stats', 'progress'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {Object.entries(achievementsByCategory).map(([category, achievements]) => (
              <div key={category}>
                <h3 className="text-lg font-medium mb-3 capitalize flex items-center gap-2">
                  {category === 'productivity' && '⚡'}
                  {category === 'collaboration' && '🤝'}
                  {category === 'consistency' && '🔥'}
                  {category === 'quality' && '✨'}
                  {category}
                </h3>
                <div className="grid grid-cols-6 md:grid-cols-8 gap-4">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="text-center">
                      <AchievementBadge
                        achievement={achievement}
                        size="md"
                        showProgress={true}
                        isNew={achievement.isNew}
                        onClick={() => setSelectedAchievement(achievement)}
                      />
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {achievement.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {userAchievements.stats.tasksCompleted}
              </div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {userAchievements.stats.cardsCreated}
              </div>
              <div className="text-sm text-gray-600">Cards Created</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {userAchievements.stats.commentsPosted}
              </div>
              <div className="text-sm text-gray-600">Comments Posted</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {userAchievements.streaks[0]?.longestStreak || 0}
              </div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-600">
                {userAchievements.stats.collaborationScore}
              </div>
              <div className="text-sm text-gray-600">Collaboration Score</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {userAchievements.stats.consistencyScore}
              </div>
              <div className="text-sm text-gray-600">Consistency Score</div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {ACHIEVEMENTS.filter(a => !userAchievements.badges.find(b => b.achievementId === a.id))
              .slice(0, 5)
              .map(achievement => {
                // Calculate progress for this achievement
                let progress = 0;
                const { criteria } = achievement;
                const { stats, streaks } = userAchievements;
                const streaksArray = Array.isArray(streaks) ? streaks : [];
                
                switch (criteria.type) {
                  case 'task_completion':
                    switch (criteria.metric) {
                      case 'tasks_per_day':
                        progress = stats?.tasksCompletedToday || 0;
                        break;
                      case 'total_tasks':
                        progress = stats?.tasksCompleted || 0;
                        break;
                      case 'early_completions':
                        progress = stats?.earlyCompletions || 0;
                        break;
                      case 'on_time_completions':
                        progress = stats?.onTimeCompletions || 0;
                        break;
                      case 'perfect_cards':
                        progress = stats?.perfectCards || 0;
                        break;
                    }
                    break;
                  case 'card_interaction':
                    switch (criteria.metric) {
                      case 'cards_created':
                        progress = stats?.cardsCreated || 0;
                        break;
                      case 'organized_cards':
                        progress = stats?.organizedCards || 0;
                        break;
                      case 'detailed_cards':
                        progress = stats?.detailedCards || 0;
                        break;
                    }
                    break;
                  case 'streak':
                    const streak = streaksArray.find(s => s.type === 'daily_tasks');
                    progress = streak?.currentStreak || 0;
                    break;
                  case 'team_activity':
                    switch (criteria.metric) {
                      case 'comments_posted':
                        progress = stats?.commentsPosted || 0;
                        break;
                      case 'unique_mentions':
                        progress = stats?.uniqueMentions || 0;
                        break;
                    }
                    break;
                  case 'custom':
                    switch (criteria.metric) {
                      case 'achievements_unlocked':
                        progress = userAchievements.badges.length;
                        break;
                    }
                    break;
                }
                
                const percentage = (progress / achievement.criteria.target) * 100;
                
                return (
                  <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AchievementBadge
                        achievement={{ ...achievement, progress }}
                        size="sm"
                        showProgress={false}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {progress} / {achievement.criteria.target}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Achievement detail modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <AchievementBadge achievement={selectedAchievement} size="lg" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{selectedAchievement.name}</h3>
                <p className="text-gray-600 mb-3">{selectedAchievement.description}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {selectedAchievement.points} points
                  </span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${selectedAchievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                      selectedAchievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                      selectedAchievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {selectedAchievement.rarity}
                  </span>
                </div>
                {selectedAchievement.unlockedAt && (
                  <p className="text-xs text-gray-500 mt-3">
                    Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}; 