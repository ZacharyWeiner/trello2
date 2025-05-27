'use client';

import React, { useState } from 'react';
import { UserAchievementsPanel } from '@/components/achievements/UserAchievementsPanel';
import { Leaderboard } from '@/components/achievements/Leaderboard';
import { AchievementToast } from '@/components/achievements/AchievementToast';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { Trophy, Zap, Users, Target } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { AchievementService } from '@/services/achievementService';
import { ACHIEVEMENTS } from '@/data/achievements';

export default function TestAchievementsPage() {
  const { user } = useAuthContext();
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'leaderboard'>('overview');
  const [showToast, setShowToast] = useState(false);
  const [toastAchievement, setToastAchievement] = useState(ACHIEVEMENTS[0]);

  const simulateAchievement = async (type: 'task' | 'collaboration' | 'card') => {
    if (!user) return;

    try {
      let unlockedAchievements = [];
      
      switch (type) {
        case 'task':
          unlockedAchievements = await AchievementService.trackTaskCompletion(
            user.uid,
            `test-card-${Date.now()}`,
            new Date()
          );
          break;
        case 'collaboration':
          unlockedAchievements = await AchievementService.trackCollaboration(
            user.uid,
            'comment',
            `test-card-${Date.now()}`
          );
          break;
        case 'card':
          unlockedAchievements = await AchievementService.trackCardCreation(
            user.uid,
            {
              hasLabels: true,
              hasDueDate: true,
              descriptionLength: 150
            }
          );
          break;
      }

      if (unlockedAchievements.length > 0) {
        setToastAchievement(unlockedAchievements[0]);
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error simulating achievement:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            Achievement System Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Gamify your productivity with badges, streaks, and leaderboards!
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'overview'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'profile'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Achievements
          </button>
          <button
            onClick={() => setActiveSection('leaderboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'leaderboard'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Content */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Earn Badges</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Complete tasks, help teammates, and maintain streaks to unlock achievements.
                </p>
                <div className="flex gap-2">
                  <AchievementBadge achievement={{ ...ACHIEVEMENTS[0], unlockedAt: new Date() }} size="sm" />
                  <AchievementBadge achievement={{ ...ACHIEVEMENTS[5], unlockedAt: new Date() }} size="sm" />
                  <AchievementBadge achievement={{ ...ACHIEVEMENTS[8], unlockedAt: new Date() }} size="sm" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Track Streaks</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Build momentum with daily activity streaks and consistency rewards.
                </p>
                <div className="flex items-center gap-2 text-2xl font-bold text-orange-600">
                  🔥 7 Day Streak!
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Compete & Collaborate</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  See how you rank against your team with fun leaderboards.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium">#1 This Week!</span>
                </div>
              </div>
            </div>

            {/* Sample Badges */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Sample Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {ACHIEVEMENTS.slice(0, 8).map(achievement => (
                  <div key={achievement.id} className="text-center">
                    <AchievementBadge
                      achievement={{ ...achievement, unlockedAt: Math.random() > 0.5 ? new Date() : undefined }}
                      size="md"
                      showProgress={true}
                    />
                    <h4 className="font-medium mt-2">{achievement.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                        achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {achievement.rarity} • {achievement.points} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Actions */}
            {user && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Test Achievement Tracking</h3>
                <p className="text-gray-600 mb-4">
                  Simulate actions to see how achievements are tracked and unlocked.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => simulateAchievement('task')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Complete Task
                  </button>
                  <button
                    onClick={() => simulateAchievement('collaboration')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Post Comment
                  </button>
                  <button
                    onClick={() => simulateAchievement('card')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    Create Card
                  </button>
                  <button
                    onClick={() => {
                      setToastAchievement(ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)]);
                      setShowToast(true);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    Show Random Achievement Toast
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'profile' && user && (
          <UserAchievementsPanel userId={user.uid} />
        )}

        {activeSection === 'leaderboard' && user && (
          <Leaderboard boardId="test-board" currentUserId={user.uid} />
        )}

        {!user && activeSection !== 'overview' && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600">Please sign in to view your achievements and leaderboard.</p>
          </div>
        )}
      </div>

      {/* Achievement Toast */}
      <AchievementToast
        achievement={toastAchievement}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        onCelebrate={() => {
          // Could trigger confetti or other celebration effects
          console.log('Celebrating achievement!');
        }}
      />
    </div>
  );
} 