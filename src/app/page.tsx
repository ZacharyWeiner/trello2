'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, BookOpen, Zap, Bell } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationService } from '@/services/notificationService';
import { Notification } from '@/types';

export default function Home() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Load notifications before redirecting
        loadNotifications();
        // Show notifications briefly before redirecting
        setShowNotifications(true);
        setTimeout(() => {
          router.push('/boards');
        }, 2000);
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const userNotifications = await NotificationService.getUserNotifications(user.uid, 3);
      setNotifications(userNotifications);
      
      const count = await NotificationService.getUnreadCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <motion.div
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header with Notification Bell */}
        {user && (
          <motion.div
            className="flex justify-end mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <NotificationBell />
          </motion.div>
        )}

        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BookOpen className="h-10 w-10 text-white" />
        </motion.div>
        
        <motion.h1
          className="text-4xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Trello Clone
        </motion.h1>
        
        <motion.p
          className="text-gray-600 mb-8 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Experience project management like never before with Story Mode and GIF celebrations
        </motion.p>

        {/* Notifications Preview */}
        {user && showNotifications && notifications.length > 0 && (
          <motion.div
            className="bg-white rounded-xl shadow-lg p-4 mb-6 text-left"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">Recent Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 2).map((notification) => (
                <div key={notification.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {notifications.length > 2 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                +{notifications.length - 2} more notifications
              </p>
            )}
          </motion.div>
        )}
        
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 inline-flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="text-gray-700 font-medium">
            {user ? 'Loading your workspace...' : 'Redirecting to login...'}
          </span>
        </motion.div>
        
        <motion.div
          className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Story Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <span>GIF Celebrations</span>
          </div>
          {user && unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-red-400" />
              <span>{unreadCount} New</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
