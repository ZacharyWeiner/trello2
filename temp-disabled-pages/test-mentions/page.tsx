'use client';

import React, { useState, useEffect } from 'react';
import { MentionInput } from '@/components/mentions/MentionInput';
import { MentionDisplay } from '@/components/mentions/MentionDisplay';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationService } from '@/services/notificationService';
import { BoardMember } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

export default function TestMentionsPage() {
  const { user } = useAuthContext();
  const [commentText, setCommentText] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [submittedComments, setSubmittedComments] = useState<string[]>([]);
  const [notificationSent, setNotificationSent] = useState(false);

  // Test board members
  const testBoardMembers: BoardMember[] = [
    {
      userId: 'user-1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      photoURL: '',
      role: 'admin',
      joinedAt: new Date(),
      invitedBy: 'system'
    },
    {
      userId: 'user-2',
      email: 'jane.smith@example.com',
      displayName: 'Jane Smith',
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'user-1'
    },
    {
      userId: 'user-3',
      email: 'bob.wilson@example.com',
      displayName: 'Bob Wilson',
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'user-1'
    },
    {
      userId: 'user-4',
      email: 'alice.johnson@example.com',
      displayName: 'Alice Johnson',
      photoURL: '',
      role: 'viewer',
      joinedAt: new Date(),
      invitedBy: 'user-2'
    }
  ];

  const handleCommentChange = (text: string, mentionedUsers: string[]) => {
    setCommentText(text);
    setMentions(mentionedUsers);
    console.log('Comment text:', text);
    console.log('Mentions:', mentionedUsers);
  };

  const handleSubmit = async () => {
    if (commentText.trim()) {
      setSubmittedComments([...submittedComments, commentText]);
      
      // Send test notifications for mentions
      if (mentions.length > 0 && user) {
        try {
          await NotificationService.createMentionNotifications(
            mentions,
            user.uid,
            user.displayName || user.email || 'Test User',
            'test-card-123',
            'Test Card',
            'test-board-123',
            'Test Board',
            commentText,
            testBoardMembers
          );
          setNotificationSent(true);
          setTimeout(() => setNotificationSent(false), 3000);
          console.log('✅ Notifications sent for mentions:', mentions);
        } catch (error) {
          console.error('❌ Error sending notifications:', error);
        }
      }
      
      setCommentText('');
      setMentions([]);
    }
  };

  const handleSendTestNotification = async () => {
    if (!user) {
      alert('Please login to test notifications');
      return;
    }

    try {
      await NotificationService.createMentionNotification(
        user.uid, // Send to yourself
        'test-user-123',
        'Test User',
        'test-card-123',
        'Test Card',
        'test-board-123',
        'Test Board',
        'This is a test mention notification @you!'
      );
      alert('Test notification sent! Check the bell icon.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Test Mentions Functionality</h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={handleSendTestNotification}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Send Test Notification
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Type @ in the comment box below to trigger autocomplete</li>
            <li>Use arrow keys to navigate suggestions</li>
            <li>Press Enter or Tab to select a user</li>
            <li>Press Escape to close suggestions</li>
            <li>Click on a user to select them</li>
            <li>Submit the comment to send notifications to mentioned users</li>
            <li>Click the bell icon to see notifications</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Board Members</h2>
          <div className="grid grid-cols-2 gap-4">
            {testBoardMembers.map(member => (
              <div key={member.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.displayName.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{member.displayName}</div>
                  <div className="text-sm text-gray-600">{member.email}</div>
                  <div className="text-xs text-gray-500 capitalize">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Comment Input</h2>
          <div className="space-y-4">
            <MentionInput
              value={commentText}
              onChange={handleCommentChange}
              placeholder="Type @ to mention someone..."
              boardMembers={testBoardMembers}
              rows={4}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {mentions.length > 0 && (
                  <span>Mentioning: {mentions.join(', ')}</span>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit Comment
              </button>
            </div>
            
            {notificationSent && (
              <div className="p-3 bg-green-100 text-green-700 rounded">
                ✅ Notifications sent to mentioned users!
              </div>
            )}
          </div>
        </div>

        {submittedComments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Submitted Comments</h2>
            <div className="space-y-3">
              {submittedComments.map((comment, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Comment #{index + 1}</div>
                  <MentionDisplay
                    text={comment}
                    boardMembers={testBoardMembers}
                    className="text-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Debug Info</h3>
          <div className="text-sm text-yellow-800 space-y-1">
            <div>Current text: {commentText}</div>
            <div>Mentions detected: {mentions.length}</div>
            <div>Raw mention IDs: {JSON.stringify(mentions)}</div>
            <div>Current user: {user?.email || 'Not logged in'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 