'use client';

import React from 'react';
import { UserPresence } from '@/types';
import { UserAvatar } from '@/components/users/UserAvatar';
import { Eye, Edit, MessageCircle } from 'lucide-react';

interface PresenceIndicatorProps {
  users: UserPresence[];
  currentUserId: string;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  users,
  currentUserId,
  className = ''
}) => {
  // Filter out current user and sort by last seen
  const otherUsers = users
    .filter(user => user.userId !== currentUserId)
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">
          {otherUsers.length} online
        </span>
      </div>
      
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="relative group"
            title={`${user.displayName} - ${getActivityText(user)}`}
          >
            <UserAvatar 
              user={user} 
              size="sm" 
              className="ring-2 ring-white hover:ring-blue-200 transition-all"
            />
            
            {/* Activity indicator */}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              {user.currentCard ? (
                <Edit className="w-2 h-2 text-blue-500" />
              ) : (
                <Eye className="w-2 h-2 text-green-500" />
              )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {user.displayName}
              <br />
              <span className="text-gray-300">{getActivityText(user)}</span>
            </div>
          </div>
        ))}
        
        {otherUsers.length > 5 && (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
            +{otherUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

const getActivityText = (user: UserPresence): string => {
  if (user.currentCard) {
    return 'Editing card';
  }
  return 'Viewing board';
};

// Real-time cursor component
interface RealtimeCursorProps {
  user: UserPresence;
  className?: string;
}

export const RealtimeCursor: React.FC<RealtimeCursorProps> = ({
  user,
  className = ''
}) => {
  if (!user.cursor) return null;

  return (
    <div
      className={`absolute pointer-events-none z-50 ${className}`}
      style={{
        left: user.cursor.x,
        top: user.cursor.y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      {/* Cursor */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="drop-shadow-lg"
      >
        <path
          d="M2 2L18 8L8 12L2 18L2 2Z"
          fill="#3B82F6"
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* User label */}
      <div className="absolute top-5 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {user.displayName}
      </div>
    </div>
  );
};

// Card activity indicator
interface CardActivityIndicatorProps {
  activities: any[];
  currentUserId: string;
  className?: string;
}

export const CardActivityIndicator: React.FC<CardActivityIndicatorProps> = ({
  activities,
  currentUserId,
  className = ''
}) => {
  const otherActivities = activities.filter(activity => activity.userId !== currentUserId);
  
  if (otherActivities.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {otherActivities.slice(0, 3).map((activity, index) => (
        <div
          key={`${activity.userId}-${index}`}
          className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
          title={`${activity.displayName} is ${activity.action}`}
        >
          {activity.action === 'editing' && <Edit className="w-3 h-3" />}
          {activity.action === 'viewing' && <Eye className="w-3 h-3" />}
          {activity.action === 'commenting' && <MessageCircle className="w-3 h-3" />}
          <span className="max-w-20 truncate">{activity.displayName}</span>
        </div>
      ))}
      
      {otherActivities.length > 3 && (
        <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          +{otherActivities.length - 3}
        </div>
      )}
    </div>
  );
}; 