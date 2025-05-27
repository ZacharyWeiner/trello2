'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { getAvatarUrl, getUserInitials } from '@/services/userService';

interface UserAvatarProps {
  user: UserProfile | { displayName: string; email: string; photoURL?: string };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showTooltip = true,
  className = '',
  onClick
}) => {
  const avatarUrl = 'photoURL' in user && user.photoURL ? user.photoURL : getGravatarUrl(user.email || '');
  const initials = getUserInitials(user);
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    flex 
    items-center 
    justify-center 
    font-medium 
    text-white 
    bg-gradient-to-br 
    from-blue-500 
    to-purple-600
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
    ${className}
  `.trim();

  const content = (
    <div 
      className={baseClasses}
      onClick={onClick}
      title={showTooltip ? (user.displayName || user.email || 'User') : undefined}
    >
      {!imageError && avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user.displayName || user.email || 'User'}
          className="w-full h-full rounded-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  );

  return content;
};

// Helper function for Gravatar
const getGravatarUrl = (email: string): string => {
  if (!email) {
    // Return a default avatar if email is undefined/null/empty
    return `https://www.gravatar.com/avatar/default?d=identicon&s=80`;
  }
  
  const trimmedEmail = email.toLowerCase().trim();
  // Simple hash for demo - in production, use proper crypto
  const hash = btoa(trimmedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`;
};

// Multi-user avatar stack component
interface UserAvatarStackProps {
  users: (UserProfile | { displayName: string; email: string; photoURL?: string })[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatarStack: React.FC<UserAvatarStackProps> = ({
  users,
  maxVisible = 3,
  size = 'sm',
  className = ''
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  const getUserKey = (user: any, index: number): string => {
    // Try to get a unique identifier in order of preference
    if ('userId' in user && user.userId) return user.userId;
    if ('id' in user && user.id) return user.id;
    if (user.email) return user.email;
    return `user-${index}`;
  };

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleUsers.map((user, index) => (
        <div key={getUserKey(user, index)} className="relative" style={{ zIndex: visibleUsers.length - index }}>
          <UserAvatar 
            user={user} 
            size={size}
            className="border-2 border-white"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div 
          key="remaining-count"
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            flex 
            items-center 
            justify-center 
            font-medium 
            text-gray-600 
            bg-gray-200 
            border-2 
            border-white
          `}
          title={`+${remainingCount} more`}
        >
          <span className="text-xs">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}; 