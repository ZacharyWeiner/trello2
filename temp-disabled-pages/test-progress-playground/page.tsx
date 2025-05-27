'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProgressVisualizationPlayground } from '@/components/progress/ProgressVisualizationPlayground';
import { ArrowLeft, BarChart3, Pizza, Thermometer, Trophy, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestProgressPlaygroundPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
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
              📊 Progress Visualization Playground
            </h1>
            <p className="text-gray-600 text-lg">
              Explore fun and engaging ways to visualize project progress with animated charts, themes, and interactive elements!
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Pizza className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pizza Charts</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Visual progress as pizza slices</li>
                <li>• Animated slice filling</li>
                <li>• Milestone markers around the pizza</li>
                <li>• Completion celebrations</li>
                <li>• Different sizes and themes</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Thermometer className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Thermometers</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Temperature-based progress visualization</li>
                <li>• Animated liquid filling with bubbles</li>
                <li>• Multiple themes (hot, cold, electric)</li>
                <li>• Progress status indicators</li>
                <li>• Glow effects for high progress</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Team Races</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Competitive progress tracking</li>
                <li>• Animated racing avatars</li>
                <li>• Real-time leaderboards</li>
                <li>• Position indicators and celebrations</li>
                <li>• Team collaboration gamification</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Burndown Charts</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Sprint progress visualization</li>
                <li>• Fun themes with particle effects</li>
                <li>• Ideal vs actual progress tracking</li>
                <li>• Scope change indicators</li>
                <li>• Interactive chart animations</li>
              </ul>
            </div>
          </div>

          {/* Main Playground */}
          <ProgressVisualizationPlayground />

          {/* Usage Instructions */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">🎮 How to Use the Playground</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🎛️ Interactive Controls</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>Animated/Static:</strong> Toggle chart animations on/off</li>
                  <li>• <strong>Auto Update:</strong> Enable real-time progress simulation</li>
                  <li>• <strong>Reset:</strong> Reset all progress to zero</li>
                  <li>• <strong>Theme Selector:</strong> Choose from 4 visual themes</li>
                  <li>• <strong>Tab Navigation:</strong> Switch between chart types</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🎨 Visual Features</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>Smooth Animations:</strong> Framer Motion powered transitions</li>
                  <li>• <strong>Particle Effects:</strong> Stars, bubbles, and fire particles</li>
                  <li>• <strong>Color Themes:</strong> Classic, Space, Forest, and Fire</li>
                  <li>• <strong>Interactive Elements:</strong> Hover effects and celebrations</li>
                  <li>• <strong>Responsive Design:</strong> Works on all screen sizes</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enable "Auto Update" to see live progress simulation in action</li>
                <li>• Try different themes to see how they change the visual experience</li>
                <li>• Watch for milestone celebrations in the Pizza Chart</li>
                <li>• Notice how the thermometer changes color and adds effects as progress increases</li>
                <li>• The team race shows competitive elements with position tracking</li>
                <li>• Burndown charts include particle effects in themed modes</li>
              </ul>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">⚙️ Technical Implementation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">📊 Chart Libraries</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Chart.js for burndown charts</li>
                  <li>• React Chart.js 2 integration</li>
                  <li>• Custom SVG for pizza charts</li>
                  <li>• CSS animations for thermometers</li>
                  <li>• Framer Motion for interactions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🎨 Visual Effects</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CSS gradients and transforms</li>
                  <li>• SVG path animations</li>
                  <li>• Particle system with physics</li>
                  <li>• Dynamic color theming</li>
                  <li>• Responsive breakpoints</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🔧 Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time data updates</li>
                  <li>• Milestone tracking</li>
                  <li>• Progress celebrations</li>
                  <li>• Theme customization</li>
                  <li>• Animation controls</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Integration Examples */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">🔗 Integration Examples</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Sprint Progress Tracking</h4>
                <p className="text-sm text-gray-600">
                  Use pizza charts to show overall sprint completion, thermometers for individual feature progress, 
                  and team races to gamify daily standups and encourage healthy competition.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Project Milestones</h4>
                <p className="text-sm text-gray-600">
                  Pizza charts with milestone markers are perfect for showing project phases, while burndown charts 
                  with fun themes make sprint reviews more engaging and visually appealing.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Team Motivation</h4>
                <p className="text-sm text-gray-600">
                  Team races create friendly competition, thermometer progress builds anticipation, and celebration 
                  animations provide positive reinforcement for achieving goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 