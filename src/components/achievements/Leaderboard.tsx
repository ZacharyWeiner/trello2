'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, Leaderboard as LeaderboardType } from '@/types';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { AchievementService } from '@/services/achievementService';

interface LeaderboardProps {
  boardId: string;
  currentUserId: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ boardId, currentUserId }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardType | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('weekly');
  const [metric, setMetric] = useState<'productivity' | 'collaboration' | 'consistency' | 'overall'>('overall');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [boardId, period, metric]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await AchievementService.getLeaderboard(boardId, period, metric);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getMetricIcon = () => {
    switch (metric) {
      case 'productivity':
        return '⚡';
      case 'collaboration':
        return '🤝';
      case 'consistency':
        return '🔥';
      default:
        return '🏆';
    }
  };

  const getMetricDescription = () => {
    switch (metric) {
      case 'productivity':
        return 'Tasks completed';
      case 'collaboration':
        return 'Team interaction points';
      case 'consistency':
        return 'Streak and consistency score';
      default:
        return 'Overall achievement points';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Team Leaderboard</h2>
            <span className="text-2xl">{getMetricIcon()}</span>
          </div>
          
          {/* Period selector */}
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly', 'all_time'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                  period === p
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'all_time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex gap-2">
          {(['overall', 'productivity', 'collaboration', 'consistency'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                metric === m
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 mt-2">{getMetricDescription()}</p>
      </div>

      {/* Leaderboard entries */}
      <div className="divide-y divide-gray-100">
        {leaderboard?.entries.map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId;
          const isTopThree = entry.rank <= 3;

          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                isCurrentUser ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`w-12 flex justify-center ${isTopThree ? 'scale-125' : ''}`}>
                  {getRankIcon(entry.rank)}
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 flex-1">
                  {entry.userPhoto ? (
                    <img
                      src={entry.userPhoto}
                      alt={entry.userName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {entry.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isCurrentUser ? 'text-blue-600' : ''}`}>
                        {entry.userName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Level {entry.level}</span>
                      <span>•</span>
                      <span>{entry.achievements} badges</span>
                      {entry.stats.streakDays > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {entry.stats.streakDays} day streak
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-bold">{entry.score.toLocaleString()}</span>
                    {entry.change !== 0 && (
                      <div className="flex items-center gap-1">
                        {getChangeIcon(entry.change)}
                        <span className={`text-xs ${
                          entry.change > 0 ? 'text-green-500' : 
                          entry.change < 0 ? 'text-red-500' : 
                          'text-gray-400'
                        }`}>
                          {Math.abs(entry.change)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {metric === 'productivity' && `${entry.stats.tasksThisPeriod} tasks`}
                    {metric === 'collaboration' && `${entry.stats.collaborationPoints} points`}
                    {metric === 'consistency' && `${entry.stats.streakDays} days`}
                    {metric === 'overall' && 'points'}
                  </div>
                </div>
              </div>

              {/* Top 3 celebration */}
              {isTopThree && (
                <motion.div
                  className="mt-2 text-xs text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {entry.rank === 1 && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full">
                      👑 Champion of {period === 'all_time' ? 'All Time' : `the ${period.charAt(0).toUpperCase() + period.slice(1)}`}!
                    </span>
                  )}
                  {entry.rank === 2 && (
                    <span className="bg-gradient-to-r from-gray-300 to-gray-400 text-white px-3 py-1 rounded-full">
                      🥈 Silver Medalist
                    </span>
                  )}
                  {entry.rank === 3 && (
                    <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-3 py-1 rounded-full">
                      🥉 Bronze Medalist
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Fun footer messages */}
      <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
        {metric === 'productivity' && '⚡ Keep completing those tasks!'}
        {metric === 'collaboration' && '🤝 Teamwork makes the dream work!'}
        {metric === 'consistency' && '🔥 Consistency is key to success!'}
        {metric === 'overall' && '🏆 Every achievement counts!'}
      </div>
    </div>
  );
}; 