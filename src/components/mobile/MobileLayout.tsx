'use client';

import React, { useState, useEffect } from 'react';
import { MobileBottomNav } from './MobileNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
  currentPath?: string;
  currentUserId?: string;
  onCreateBoard?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
  onNavigate?: (path: string) => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  header,
  bottomNav,
  showBottomNav = true,
  className = '',
  currentPath = '',
  currentUserId,
  onCreateBoard,
  onSearch,
  onNotifications,
  onProfile,
  onNavigate,
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // Detect screen size and orientation
  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine screen size
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      
      // Determine orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);



  return (
    <div className={`mobile-layout min-h-screen ${className}`}>
        {/* Custom Header Content */}
        {header}

      {/* Main Content */}
      <main 
        className={`mobile-main flex-1 ${showBottomNav ? 'pb-16' : ''}`}
      >
        <div className="h-full w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        bottomNav || (
          <MobileBottomNav
            currentPath={currentPath}
            onCreateBoard={onCreateBoard}
            onSearch={onSearch}
            onNotifications={onNotifications}
            onProfile={onProfile}
          />
        )
      )}


    </div>
  );
};

// Hook for responsive utilities
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated and immediately check screen size
    setIsHydrated(true);
    
    const updateResponsive = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Screen size with more aggressive mobile detection
      if (width <= 768) {
        setScreenSize('mobile');
      } else if (width <= 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      
      // Orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
      
      // Touch device detection
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    // Run immediately on mount
    updateResponsive();
    
    // Add event listeners
    window.addEventListener('resize', updateResponsive);
    window.addEventListener('orientationchange', updateResponsive);

    return () => {
      window.removeEventListener('resize', updateResponsive);
      window.removeEventListener('orientationchange', updateResponsive);
    };
  }, []);

  return {
    screenSize,
    orientation,
    isTouchDevice,
    isHydrated,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
}; 