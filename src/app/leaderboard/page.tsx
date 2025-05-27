'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Leaderboard } from '@/components/achievements/Leaderboard';
import { Trophy, Users, ArrowLeft, Star, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserBoards } from '@/services/boardService';
import { Board, UserAchievements, Achievement } from '@/types';
import { ACHIEVEMENTS, calculateLevel } from '@/data/achievements';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { AchievementService } from '@/services/achievementService';

export default function LeaderboardPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserBoards();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && showAchievements) {
      loadUserAchievements();
    }
  }, [user, showAchievements]);

  const loadUserBoards = async () => {
    if (!user) return;
    
    try {
      const userBoards = await getUserBoards(user.uid);
      setBoards(userBoards);
      
      // Auto-select the first board if available
      if (userBoards.length > 0 && !selectedBoardId) {
        setSelectedBoardId(userBoards[0].id);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAchievements = async () => {
    if (!user) return;
    
    setAchievementsLoading(true);
    try {
      const achievements = await AchievementService.getUserAchievements(user.uid);
      setUserAchievements(achievements);
    } catch (error) {
      console.error('Error loading user achievements:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  // Group achievements by category with user progress
  const achievementsByCategory = ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    
    const userBadge = userAchievements?.badges.find(b => b.achievementId === achievement.id);
    const isUnlocked = !!userBadge;
    
    // Calculate progress for locked achievements
    let progress = 0;
    if (!isUnlocked && userAchievements) {
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
              progress = userAchievements?.badges.length || 0;
              break;
          }
          break;
      }
    }
    
    const enrichedAchievement = {
      ...achievement,
      unlockedAt: userBadge?.unlockedAt,
      isNew: userBadge?.isNew,
      progress: isUnlocked ? achievement.criteria.target : progress,
      isUnlocked
    };
    
    acc[achievement.category].push(enrichedAchievement);
    return acc;
  }, {} as Record<string, (Achievement & { progress: number; isUnlocked: boolean; isNew?: boolean; unlockedAt?: Date })[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'productivity': return '⚡';
      case 'collaboration': return '🤝';
      case 'consistency': return '🔥';
      case 'quality': return '✨';
      default: return '🏆';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'productivity': return 'Complete tasks efficiently and reach productivity milestones';
      case 'collaboration': return 'Work with your team and help others succeed';
      case 'consistency': return 'Build habits and maintain activity streaks';
      case 'quality': return 'Create well-organized cards with attention to detail';
      default: return 'Special achievements';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700';
      case 'rare': return 'bg-blue-100 text-blue-700';
      case 'epic': return 'bg-purple-100 text-purple-700';
      case 'legendary': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate user stats
  const unlockedCount = userAchievements?.badges.length || 0;
  const totalPoints = userAchievements?.totalPoints || 0;
  const levelInfo = calculateLevel(totalPoints);
  
  // Get current level threshold for progress calculation
  const currentLevelThreshold = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000][levelInfo.level - 1] || 0;
  const progressToNextLevel = levelInfo.nextLevelPoints
    ? ((totalPoints - currentLevelThreshold) / 
       (levelInfo.nextLevelPoints - currentLevelThreshold)) * 100
    : 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view the team leaderboard.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/boards')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Boards
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold">Team Leaderboard</h1>
          </div>
          
          <p className="text-gray-600 text-lg">
            See how your team is performing and compete for the top spot!
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowAchievements(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showAchievements 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showAchievements 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Achievements
          </button>
        </div>

        {!showAchievements ? (
          <>
            {/* Board Selector */}
            {boards.length > 0 ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Board
                  </label>
                  <select
                    value={selectedBoardId}
                    onChange={(e) => setSelectedBoardId(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>
                        {board.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leaderboard Component */}
                {selectedBoardId && (
                  <Leaderboard boardId={selectedBoardId} currentUserId={user.uid} />
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Boards Found</h3>
                <p className="text-gray-600 mb-6">
                  You need to be a member of at least one board to view leaderboards.
                </p>
                <button
                  onClick={() => router.push('/boards')}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Boards
                </button>
              </div>
            )}
          </>
        ) : (
          /* My Achievements View */
          <div className="space-y-8">
            {achievementsLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Your Progress Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4">Your Achievement Progress</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {unlockedCount} / {ACHIEVEMENTS.length}
                      </div>
                      <div className="text-sm text-gray-600">Achievements Unlocked</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-500">
                        {totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Points Earned</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        Level {levelInfo.level}
                      </div>
                      <div className="text-sm text-gray-600">{levelInfo.title}</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {Math.round(progressToNextLevel)}%
                      </div>
                      <div className="text-sm text-gray-600">Progress to Next Level</div>
                    </div>
                  </div>
                  
                  {/* Level Progress Bar */}
                  {levelInfo.nextLevelPoints && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Level Progress</span>
                        <span className="text-sm text-gray-500">
                          {totalPoints} / {levelInfo.nextLevelPoints} points
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progressToNextLevel}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Achievements by Category */}
                {Object.entries(achievementsByCategory).map(([category, achievements]) => {
                  const unlockedInCategory = achievements.filter(a => a.isUnlocked).length;
                  
                  return (
                    <div key={category} className="bg-white rounded-lg shadow-md p-6">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getCategoryIcon(category)}</span>
                          {category.charAt(0).toUpperCase() + category.slice(1)} Achievements
                          <span className="text-sm font-normal text-gray-500">
                            ({unlockedInCategory} / {achievements.length})
                          </span>
                        </h3>
                        <p className="text-gray-600">{getCategoryDescription(category)}</p>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        {achievements.map(achievement => {
                          const progressPercentage = (achievement.progress / achievement.criteria.target) * 100;
                          
                          return (
                            <div 
                              key={achievement.id} 
                              className={`border rounded-lg p-4 transition-shadow ${
                                achievement.isUnlocked 
                                  ? 'border-green-200 bg-green-50 shadow-md' 
                                  : 'border-gray-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <AchievementBadge
                                    achievement={achievement}
                                    size="md"
                                    showProgress={!achievement.isUnlocked}
                                    isNew={achievement.isNew}
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg mb-1 flex items-center gap-2">
                                    {achievement.name}
                                    {achievement.isUnlocked && (
                                      <span className="text-green-600">✓</span>
                                    )}
                                  </h4>
                                  <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                                  
                                  <div className="flex items-center gap-3 text-sm mb-3">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span className="font-medium">{achievement.points} pts</span>
                                    </div>
                                    
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                                    </span>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  {!achievement.isUnlocked && (
                                    <div className="mb-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Progress</span>
                                        <span className="text-xs text-gray-600">
                                          {achievement.progress} / {achievement.criteria.target}
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {achievement.isUnlocked && achievement.unlockedAt && (
                                    <div className="text-xs text-green-600">
                                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Info Section - Only show when viewing leaderboard */}
        {!showAchievements && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Productivity
              </h3>
              <p className="text-gray-600">
                Track tasks completed and maintain high productivity levels to climb the rankings.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                Collaboration
              </h3>
              <p className="text-gray-600">
                Help teammates, post comments, and work together to earn collaboration points.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                Consistency
              </h3>
              <p className="text-gray-600">
                Build daily streaks and maintain consistent activity to show your dedication.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 