'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Plus, Search, Bell, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath?: string;
  onCreateBoard?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPath = '',
  onCreateBoard,
  onSearch,
  onNotifications,
  onProfile,
}) => {
  const router = useRouter();

  const handleBoardsClick = () => {
    console.log('🏠 Boards button clicked');
    router.push('/boards');
  };

  const handleCreateClick = () => {
    console.log('➕ Create button clicked');
    if (onCreateBoard) {
      onCreateBoard();
    } else {
      // Default create action - could open a modal or navigate to create page
      console.log('Create action triggered');
    }
  };

  const handleSearchClick = () => {
    console.log('🔍 Search button clicked');
    console.log('onSearch handler:', onSearch);
    if (onSearch) {
      console.log('Calling onSearch handler');
      onSearch();
    } else {
      console.log('Using default search navigation');
      router.push('/search');
    }
  };

  const handleNotificationsClick = () => {
    console.log('🔔 Notifications button clicked');
    console.log('onNotifications handler:', onNotifications);
    if (onNotifications) {
      console.log('Calling onNotifications handler');
      onNotifications();
    } else {
      console.log('Using default notifications navigation');
      router.push('/notifications');
    }
  };

  const handleProfileClick = () => {
    console.log('👤 Profile button clicked');
    console.log('onProfile handler:', onProfile);
    if (onProfile) {
      console.log('Calling onProfile handler');
      onProfile();
    } else {
      console.log('Using default profile navigation');
      router.push('/profile');
    }
  };

  const isActive = (path: string) => currentPath.includes(path);

  return (
    <nav className="mobile-bottom-nav">
      <div className="flex items-center justify-around py-2">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBoardsClick();
          }}
          className={`flex flex-col items-center py-2 px-3 transition-colors touch-manipulation cursor-pointer ${
            isActive('/boards') 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Home size={20} className="mb-1" />
          <span className="text-xs">Boards</span>
        </button>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCreateClick();
          }}
          className="flex flex-col items-center py-2 px-3 text-gray-600 dark:text-gray-300 
                   hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-manipulation cursor-pointer"
          style={{ touchAction: 'manipulation' }}
        >
          <Plus size={20} className="mb-1" />
          <span className="text-xs">Create</span>
        </button>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSearchClick();
          }}
          className={`flex flex-col items-center py-2 px-3 transition-colors touch-manipulation cursor-pointer ${
            isActive('/search') 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Search size={20} className="mb-1" />
          <span className="text-xs">Search</span>
        </button>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNotificationsClick();
          }}
          className={`flex flex-col items-center py-2 px-3 transition-colors touch-manipulation cursor-pointer ${
            isActive('/notifications') 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <Bell size={20} className="mb-1" />
          <span className="text-xs">Alerts</span>
        </button>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleProfileClick();
          }}
          className={`flex flex-col items-center py-2 px-3 transition-colors touch-manipulation cursor-pointer ${
            isActive('/profile') 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          style={{ touchAction: 'manipulation' }}
        >
          <User size={20} className="mb-1" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
};

 