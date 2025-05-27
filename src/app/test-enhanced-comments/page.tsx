'use client';

import React, { useState } from 'react';
import { EnhancedCommentSection } from '@/components/comments/EnhancedCommentSection';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ArrowLeft, MessageSquare, Smile, Image as ImageIcon, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Comment, BoardMember } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

export default function TestEnhancedCommentsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  
  // Mock board members
  const mockBoardMembers: BoardMember[] = [
    {
      userId: 'user1',
      email: 'alice@example.com',
      displayName: 'Alice Johnson',
      photoURL: '',
      role: 'admin',
      joinedAt: new Date(),
      invitedBy: 'user1'
    },
    {
      userId: 'user2',
      email: 'bob@example.com',
      displayName: 'Bob Smith',
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'user1'
    },
    {
      userId: 'user3',
      email: 'carol@example.com',
      displayName: 'Carol Davis',
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'user1'
    }
  ];

  // Mock initial comments with different types
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'comment-1',
      text: 'This looks great! @alice@example.com what do you think?',
      createdBy: 'user2',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date(Date.now() - 3600000),
      type: 'text',
      mentions: ['user1'],
      reactions: [
        {
          id: 'reaction-1',
          emoji: '👍',
          userId: 'user1',
          userName: 'Alice Johnson',
          createdAt: new Date(Date.now() - 3000000)
        },
        {
          id: 'reaction-2',
          emoji: '❤️',
          userId: 'user3',
          userName: 'Carol Davis',
          createdAt: new Date(Date.now() - 2000000)
        }
      ]
    },
    {
      id: 'comment-2',
      text: '',
      createdBy: 'user1',
      createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
      updatedAt: new Date(Date.now() - 1800000),
      type: 'gif',
      gifUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
      reactions: [
        {
          id: 'reaction-3',
          emoji: '😂',
          userId: 'user2',
          userName: 'Bob Smith',
          createdAt: new Date(Date.now() - 1500000)
        }
      ]
    },
    {
      id: 'comment-3',
      text: '',
      createdBy: 'user3',
      createdAt: new Date(Date.now() - 900000), // 15 minutes ago
      updatedAt: new Date(Date.now() - 900000),
      type: 'voice',
      voiceNote: {
        id: 'voice-1',
        url: 'mock-voice-url',
        duration: 12,
        waveform: [0.2, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4, 0.7, 0.1, 0.5, 0.8, 0.2, 0.6, 0.3, 0.9, 0.4],
        uploadedAt: new Date(Date.now() - 900000)
      },
      reactions: [
        {
          id: 'reaction-4',
          emoji: '🎵',
          userId: 'user1',
          userName: 'Alice Johnson',
          createdAt: new Date(Date.now() - 600000)
        }
      ]
    }
  ]);

  const handleCommentsChange = (newComments: Comment[]) => {
    setComments(newComments);
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
              💬 Enhanced Comments & Reactions
            </h1>
            <p className="text-gray-600 text-lg">
              Test emoji reactions, GIF integration, and voice note comments!
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Smile className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Emoji Reactions</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• React to any comment with emojis</li>
                <li>• Searchable emoji picker</li>
                <li>• Recent emojis saved locally</li>
                <li>• Multiple categories (smileys, gestures, hearts)</li>
                <li>• Click existing reactions to toggle</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">GIF Integration</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Search and share GIFs from Giphy</li>
                <li>• Trending GIFs and categories</li>
                <li>• Perfect for reactions and responses</li>
                <li>• Auto-preview in comments</li>
                <li>• Powered by Giphy API</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mic className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Voice Notes</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Record voice messages directly</li>
                <li>• Real-time waveform visualization</li>
                <li>• Play/pause controls</li>
                <li>• Duration display</li>
                <li>• Perfect for quick feedback</li>
              </ul>
            </div>
          </div>

          {/* Demo Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Demo Card Comments</h2>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">🎯 Implement Enhanced Comments System</h3>
              <p className="text-gray-600 text-sm">
                Add emoji reactions, GIF integration, and voice note support to make team communication more engaging and fun!
              </p>
            </div>

            {/* Enhanced Comment Section */}
            <EnhancedCommentSection
              comments={comments}
              currentUserId={user?.uid || 'demo-user'}
              onCommentsChange={handleCommentsChange}
              boardMembers={mockBoardMembers}
              cardId="demo-card"
              cardTitle="Implement Enhanced Comments System"
              boardId="demo-board"
              boardTitle="Demo Board"
            />
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">🎮 How to Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">✨ Adding Content</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Type a regular text comment</li>
                  <li>• Use @alice@example.com to mention users</li>
                  <li>• Click 😊 to add emojis to your text</li>
                  <li>• Click 🖼️ to search and add GIFs</li>
                  <li>• Click 🎤 to record voice notes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🎯 Interacting</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Hover over comments to see actions</li>
                  <li>• Click "React" to add emoji reactions</li>
                  <li>• Click existing reactions to toggle them</li>
                  <li>• Edit your own text comments</li>
                  <li>• Play voice notes with the play button</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Voice notes show real-time waveforms while recording</li>
                <li>• GIF search includes trending and categorized content</li>
                <li>• Emoji picker remembers your recently used emojis</li>
                <li>• All interactions are real-time and saved instantly</li>
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{comments.length}</div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {comments.reduce((acc, comment) => acc + (comment.reactions?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Reactions</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {comments.filter(c => c.type === 'gif').length}
              </div>
              <div className="text-sm text-gray-600">GIFs Shared</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {comments.filter(c => c.type === 'voice').length}
              </div>
              <div className="text-sm text-gray-600">Voice Notes</div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 