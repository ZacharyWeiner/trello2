'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StoryModeNarrative } from '@/components/progress/StoryModeNarrative';
import { Board, List, Card } from '@/types';
import { Sparkles, BookOpen, Play, Info } from 'lucide-react';

export default function StoryModeTestPage() {
  const [showStoryMode, setShowStoryMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Simple test data
  const testBoard: Board = {
    id: 'test-board',
    title: 'My Test Project',
    description: 'A simple project to test Story Mode',
    createdBy: 'test-user',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-29T13:00:00Z'),
    members: [
      {
        userId: 'test-user',
        displayName: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        joinedAt: new Date('2024-01-01T00:00:00Z'),
        invitedBy: 'test-user'
      },
      {
        userId: 'teammate-1',
        displayName: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'member',
        joinedAt: new Date('2024-01-02T00:00:00Z'),
        invitedBy: 'test-user'
      }
    ]
  };

  const testLists: List[] = [
    {
      id: 'list-todo',
      title: 'To Do',
      listType: 'todo',
      position: 1,
      boardId: 'test-board',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: 'list-doing',
      title: 'In Progress',
      listType: 'doing',
      position: 2,
      boardId: 'test-board',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: 'list-done',
      title: 'Completed',
      listType: 'done',
      position: 3,
      boardId: 'test-board',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    }
  ];

  const testCards: Card[] = [
    {
      id: 'card-1',
      title: 'Set up project structure',
      description: 'Create the basic folder structure and files',
      listId: 'list-done',
      boardId: 'test-board',
      position: 1,
      createdBy: 'test-user',
      createdAt: new Date('2024-01-10T09:00:00Z'),
      updatedAt: new Date('2024-01-15T17:30:00Z')
    },
    {
      id: 'card-2',
      title: 'Design user interface',
      description: 'Create mockups and wireframes',
      listId: 'list-done',
      boardId: 'test-board',
      position: 2,
      createdBy: 'test-user',
      createdAt: new Date('2024-01-12T10:00:00Z'),
      updatedAt: new Date('2024-01-18T14:20:00Z')
    },
    {
      id: 'card-3',
      title: 'Implement core features',
      description: 'Build the main functionality',
      listId: 'list-doing',
      boardId: 'test-board',
      position: 1,
      createdBy: 'teammate-1',
      createdAt: new Date('2024-01-15T11:00:00Z'),
      updatedAt: new Date('2024-01-22T16:45:00Z')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Story Mode Test</h1>
            <p className="text-gray-600 mb-6">
              Test and understand how Story Mode works with sample project data
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={() => setShowStoryMode(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="h-5 w-5" />
                Launch Story Mode Test
              </motion.button>
              
              <motion.button
                onClick={() => setShowInstructions(!showInstructions)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Info className="h-5 w-5" />
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        {showInstructions && (
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              How Story Mode Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🎭 What You'll See:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Cinematic intro</strong> with glowing title</li>
                  <li>• <strong>GIF animations</strong> for each project event</li>
                  <li>• <strong>Character cast</strong> based on team members</li>
                  <li>• <strong>Epic narration</strong> of your project journey</li>
                  <li>• <strong>Chapter navigation</strong> through story phases</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🎮 Controls:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Play/Pause</strong> - Auto-advance or manual control</li>
                  <li>• <strong>Skip buttons</strong> - Navigate between frames</li>
                  <li>• <strong>Volume toggle</strong> - Enable/disable narration</li>
                  <li>• <strong>Chapter sidebar</strong> - Jump to different parts</li>
                  <li>• <strong>X button</strong> - Close Story Mode</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">📊 Test Data:</h3>
              <p className="text-sm text-purple-700">
                This test uses a sample project with <strong>2 completed tasks</strong>, <strong>1 in-progress task</strong>, 
                and <strong>2 team members</strong>. Story Mode will generate an epic narrative from this data!
              </p>
            </div>
          </motion.div>
        )}

        {/* Sample Data Preview */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sample Project Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testLists.map((list) => (
              <div key={list.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{list.title}</h3>
                <div className="space-y-2">
                  {testCards
                    .filter(card => card.listId === list.id)
                    .map(card => (
                      <div key={card.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium">{card.title}</div>
                        <div className="text-gray-600 text-xs">{card.description}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎬 Story Generation:</h3>
            <p className="text-sm text-blue-700">
              Story Mode will analyze this data and create:
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <strong>2 triumph events</strong> from completed tasks</li>
              <li>• <strong>1 milestone event</strong> from the "Completed" list</li>
              <li>• <strong>4 characters</strong> including The Project Oracle, Task Master, and team members</li>
              <li>• <strong>3 chapters</strong> telling the epic journey</li>
            </ul>
          </div>
        </motion.div>

        {/* Story Mode Component */}
        {showStoryMode && (
          <StoryModeNarrative
            board={testBoard as any}
            lists={testLists as any}
            cards={testCards as any}
            userId="test-user"
            isActive={showStoryMode}
            onClose={() => setShowStoryMode(false)}
          />
        )}
      </div>
    </div>
  );
} 