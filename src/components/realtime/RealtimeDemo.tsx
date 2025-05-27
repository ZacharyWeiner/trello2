'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { updateUserPresence, subscribeToPresence } from '@/services/presenceService';
import { UserPresence } from '@/types';
import { PresenceIndicator } from './PresenceIndicator';
import { Wifi, WifiOff, Users, Eye, Edit } from 'lucide-react';

interface RealtimeDemoProps {
  boardId: string;
  className?: string;
}

export const RealtimeDemo: React.FC<RealtimeDemoProps> = ({
  boardId,
  className = ''
}) => {
  const { user } = useAuthContext();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [demoAction, setDemoAction] = useState<'viewing' | 'editing'>('viewing');

  useEffect(() => {
    if (!user) return;

    setIsConnected(true);
    
    // Subscribe to presence
    const unsubscribe = subscribeToPresence(boardId, (users) => {
      setOnlineUsers(users);
    });

    // Initial presence update
    updateUserPresence(boardId);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [boardId, user]);

  const simulateAction = (action: 'viewing' | 'editing') => {
    setDemoAction(action);
    if (user) {
      updateUserPresence(boardId, action === 'editing' ? 'demo-card' : undefined);
    }
  };

  if (!user) return null;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <h3 className="text-lg font-semibold">Real-time Collaboration</h3>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live presence indicators</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Real-time data updates</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span>Live cursor tracking</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span>Card activity indicators</span>
        </div>
      </div>

      {/* Current Users */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Online Users</h4>
        <PresenceIndicator 
          users={onlineUsers}
          currentUserId={user.uid}
        />
        {onlineUsers.length === 0 && (
          <p className="text-sm text-gray-500">No other users online</p>
        )}
      </div>

      {/* Demo Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Try Real-time Actions</h4>
        <div className="flex gap-2">
          <button
            onClick={() => simulateAction('viewing')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              demoAction === 'viewing'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            Viewing Board
          </button>
          <button
            onClick={() => simulateAction('editing')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              demoAction === 'editing'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Edit className="h-4 w-4" />
            Editing Card
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to Test</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Open this board in another browser/tab</li>
          <li>• Sign in as a different user</li>
          <li>• Watch real-time updates appear instantly</li>
          <li>• Move your mouse to see live cursors</li>
          <li>• Edit cards to see activity indicators</li>
        </ul>
      </div>
    </div>
  );
}; 