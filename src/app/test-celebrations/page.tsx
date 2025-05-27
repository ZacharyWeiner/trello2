'use client';

import React from 'react';
import { CelebrationSystem, celebrate, CelebrationTemplates } from '@/components/celebrations/CelebrationSystem';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestCelebrationsPage() {
  const router = useRouter();

  const triggerCelebration = (type: string) => {
    switch (type) {
      case 'task_complete':
        celebrate(CelebrationTemplates.taskComplete('Fix login bug'));
        break;
      case 'first_task':
        celebrate(CelebrationTemplates.firstTaskOfDay());
        break;
      case 'streak_7':
        celebrate(CelebrationTemplates.streakMilestone(7));
        break;
      case 'streak_30':
        celebrate(CelebrationTemplates.streakMilestone(30));
        break;
      case 'team_milestone':
        celebrate(CelebrationTemplates.teamMilestone('100 tasks completed this month!'));
        break;
      case 'perfect_day':
        celebrate(CelebrationTemplates.perfectDay());
        break;
      case 'speed_demon':
        celebrate(CelebrationTemplates.speedDemon());
        break;
      case 'custom_low':
        celebrate({
          type: 'task_complete',
          title: 'Small Win!',
          message: 'Every step counts! 🎯',
          intensity: 'low'
        });
        break;
      case 'custom_epic':
        celebrate({
          type: 'achievement',
          title: 'LEGENDARY ACHIEVEMENT!',
          message: 'You are absolutely crushing it! 🚀✨',
          intensity: 'epic',
          duration: 8000
        });
        break;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/boards')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Boards
            </button>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎉 Celebration System Test
            </h1>
            <p className="text-gray-600 text-lg">
              Test different celebration animations and confetti effects!
            </p>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Basic Celebrations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-700">✅ Task Completions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => triggerCelebration('task_complete')}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Complete Task
                </button>
                <button
                  onClick={() => triggerCelebration('first_task')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  First Task of Day
                </button>
                <button
                  onClick={() => triggerCelebration('custom_low')}
                  className="w-full bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
                >
                  Small Win (Low Intensity)
                </button>
              </div>
            </div>

            {/* Streak Celebrations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-orange-700">🔥 Streaks</h3>
              <div className="space-y-3">
                <button
                  onClick={() => triggerCelebration('streak_7')}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  7 Day Streak
                </button>
                <button
                  onClick={() => triggerCelebration('streak_30')}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  30 Day Streak (Epic!)
                </button>
              </div>
            </div>

            {/* Achievement Celebrations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-700">🏆 Achievements</h3>
              <div className="space-y-3">
                <button
                  onClick={() => triggerCelebration('perfect_day')}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Perfect Day
                </button>
                <button
                  onClick={() => triggerCelebration('speed_demon')}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Speed Demon
                </button>
                <button
                  onClick={() => triggerCelebration('custom_epic')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  EPIC Achievement!
                </button>
              </div>
            </div>

            {/* Team Celebrations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">🎊 Team Events</h3>
              <div className="space-y-3">
                <button
                  onClick={() => triggerCelebration('team_milestone')}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Team Milestone
                </button>
              </div>
            </div>

            {/* Multiple Celebrations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-700">🎆 Celebration Combo</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    triggerCelebration('task_complete');
                    setTimeout(() => triggerCelebration('streak_7'), 1000);
                    setTimeout(() => triggerCelebration('speed_demon'), 2000);
                  }}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Triple Celebration!
                </button>
                <button
                  onClick={() => {
                    // Rapid fire celebrations
                    for (let i = 0; i < 5; i++) {
                      setTimeout(() => {
                        celebrate({
                          type: 'task_complete',
                          title: `Task ${i + 1} Done!`,
                          message: `Productivity mode activated! 🚀`,
                          intensity: 'medium'
                        });
                      }, i * 500);
                    }
                  }}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rapid Fire Mode
                </button>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">ℹ️ How It Works</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• <strong>Low:</strong> 30 confetti pieces</p>
                <p>• <strong>Medium:</strong> 60 confetti pieces</p>
                <p>• <strong>High:</strong> 100 confetti pieces</p>
                <p>• <strong>Epic:</strong> 200 confetti pieces + pulse effect</p>
                <p className="mt-3 text-xs">
                  Celebrations automatically trigger when you complete tasks in the real app!
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">🎯 Celebration Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">✨ Visual Effects</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Realistic confetti physics with gravity</li>
                  <li>• Different animations per celebration type</li>
                  <li>• Intensity-based confetti count</li>
                  <li>• Colorful, randomized confetti pieces</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎮 Smart Triggers</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Auto-detects task completion quality</li>
                  <li>• First task of day gets special celebration</li>
                  <li>• Late tasks get lower intensity</li>
                  <li>• Perfect completion gets high intensity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎨 Customization</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• 4 intensity levels (low, medium, high, epic)</li>
                  <li>• Different icons per celebration type</li>
                  <li>• Custom duration support</li>
                  <li>• Team-wide celebration flags</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">⚡ Performance</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• 60fps smooth animations</li>
                  <li>• Auto-cleanup after 5 seconds</li>
                  <li>• Non-blocking UI interactions</li>
                  <li>• Memory efficient particle system</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Celebration System Component */}
        <CelebrationSystem />
      </div>
    </ProtectedRoute>
  );
} 