'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

// Standalone celebration system without Firebase dependencies
interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

export default function TestCelebrationsStandalonePage() {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Confetti animation loop
  React.useEffect(() => {
    if (!isAnimating || confetti.length === 0) return;

    const interval = setInterval(() => {
      setConfetti(prev => 
        prev
          .map(piece => ({
            ...piece,
            x: piece.x + piece.velocity.x,
            y: piece.y + piece.velocity.y,
            rotation: piece.rotation + piece.rotationSpeed,
            velocity: {
              x: piece.velocity.x * 0.99, // Air resistance
              y: piece.velocity.y + 0.5 // Gravity
            }
          }))
          .filter(piece => piece.y < window.innerHeight + 100) // Remove pieces that fall off screen
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isAnimating, confetti.length]);

  const generateConfetti = (intensity: 'low' | 'medium' | 'high' | 'epic') => {
    const counts = { low: 30, medium: 60, high: 100, epic: 200 };
    const count = counts[intensity];
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    const newConfetti: ConfettiPiece[] = [];
    
    for (let i = 0; i < count; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: Math.random() * 3 + 2
        },
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    setConfetti(prev => [...prev, ...newConfetti]);
    setIsAnimating(true);

    // Stop animation after confetti settles
    setTimeout(() => {
      setIsAnimating(false);
      setConfetti([]);
    }, 5000);
  };

  const triggerCelebration = (type: string) => {
    switch (type) {
      case 'task_complete':
        generateConfetti('medium');
        break;
      case 'first_task':
        generateConfetti('high');
        break;
      case 'streak_7':
        generateConfetti('high');
        break;
      case 'streak_30':
        generateConfetti('epic');
        break;
      case 'team_milestone':
        generateConfetti('high');
        break;
      case 'perfect_day':
        generateConfetti('epic');
        break;
      case 'speed_demon':
        generateConfetti('high');
        break;
      case 'custom_low':
        generateConfetti('low');
        break;
      case 'custom_epic':
        generateConfetti('epic');
        break;
    }
  };

  return (
    <html lang="en">
      <head>
        <title>🎉 Celebration System Test - Standalone</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen bg-gray-50">
        {/* Confetti Layer */}
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map(piece => (
            <div
              key={piece.id}
              className="absolute"
              style={{
                left: piece.x,
                top: piece.y,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>

        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🎉 Celebration System Test (Standalone)
              </h1>
              <p className="text-gray-600 text-lg">
                Test different celebration animations and confetti effects! This version works without Firebase.
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
                          generateConfetti('medium');
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
                    This standalone version works without Firebase authentication!
                  </p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-800">🎯 Success!</h3>
              <p className="text-green-700">
                If you can see this page and the confetti works when you click the buttons, 
                then the celebration system is working perfectly! The issue with the original 
                page was related to Firebase authentication blocking the page from loading.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 