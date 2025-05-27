'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { offlineService } from '@/services/offlineService';

interface NetworkStatusProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top' | 'bottom';
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  className = '',
  showDetails = false,
  position = 'top',
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    unsynced: 0,
    isOnline: true,
  });
  const [showBanner, setShowBanner] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize offline service
    offlineService.init();

    // Listen for network status changes
    const unsubscribe = offlineService.onNetworkStatusChange((online) => {
      setIsOnline(online);
      
      if (!online) {
        setLastOfflineTime(new Date());
        setShowBanner(true);
      } else if (lastOfflineTime) {
        // Show "back online" message briefly
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      }
    });

    // Update sync status periodically
    const updateSyncStatus = async () => {
      const status = await offlineService.getSyncStatus();
      setSyncStatus({
        pending: status.pending,
        unsynced: status.unsynced,
        isOnline: status.isOnline,
      });
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [lastOfflineTime]);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff size={16} className="text-red-500" />;
    }
    
    if (syncStatus.pending > 0) {
      return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
    }
    
    if (syncStatus.unsynced > 0) {
      return <CloudOff size={16} className="text-yellow-500" />;
    }
    
    return <Cloud size={16} className="text-green-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }
    
    if (syncStatus.pending > 0) {
      return `Syncing ${syncStatus.pending} items...`;
    }
    
    if (syncStatus.unsynced > 0) {
      return `${syncStatus.unsynced} items pending sync`;
    }
    
    return 'All synced';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (syncStatus.pending > 0) return 'bg-blue-500';
    if (syncStatus.unsynced > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBannerMessage = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff size={20} className="text-red-500" />,
        title: 'You\'re offline',
        message: 'Changes will be saved locally and synced when you\'re back online.',
        color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      };
    }
    
    if (lastOfflineTime && isOnline) {
      return {
        icon: <CheckCircle size={20} className="text-green-500" />,
        title: 'Back online',
        message: 'Syncing your changes now...',
        color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      };
    }
    
    return null;
  };

  const bannerContent = getBannerMessage();

  return (
    <>
      {/* Status Indicator */}
      <div className={`network-status ${className}`}>
        {showDetails ? (
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            {getStatusIcon()}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {getStatusText()}
            </span>
          </div>
        ) : (
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            {syncStatus.pending > 0 && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-500 animate-ping" />
            )}
          </div>
        )}
      </div>

      {/* Network Status Banner */}
      <AnimatePresence>
        {showBanner && bannerContent && (
          <motion.div
            initial={{ 
              y: position === 'top' ? -100 : 100,
              opacity: 0 
            }}
            animate={{ 
              y: 0,
              opacity: 1 
            }}
            exit={{ 
              y: position === 'top' ? -100 : 100,
              opacity: 0 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 mx-4 mt-4 mb-4`}
          >
            <div className={`rounded-lg border p-4 shadow-lg ${bannerContent.color}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {bannerContent.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {bannerContent.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {bannerContent.message}
                  </p>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    unsynced: 0,
    isOnline: true,
  });

  useEffect(() => {
    const unsubscribe = offlineService.onNetworkStatusChange(setIsOnline);
    
    const updateSyncStatus = async () => {
      const status = await offlineService.getSyncStatus();
      setSyncStatus({
        pending: status.pending,
        unsynced: status.unsynced,
        isOnline: status.isOnline,
      });
    };

    updateSyncStatus();
    const interval = setInterval(updateSyncStatus, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    syncStatus,
    hasPendingSync: syncStatus.pending > 0 || syncStatus.unsynced > 0,
  };
}; 