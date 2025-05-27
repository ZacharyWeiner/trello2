'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { BoardBackground, BoardTemplate } from '@/types';
import { createBoard } from '@/services/boardService';
import { createBoardFromTemplate } from '@/services/boardTemplateService';
import { ArrowLeft, Bell, Check, X, User, MessageSquare, UserPlus, Calendar } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MobileLayout, useResponsive } from '@/components/mobile/MobileLayout';
import { CreateBoardModal } from '@/components/boards/CreateBoardModal';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'card_assigned' | 'card_comment' | 'board_invite' | 'due_date' | 'mention';
  title: string;
  message: string;
  boardId?: string;
  boardTitle?: string;
  cardId?: string;
  cardTitle?: string;
  fromUser?: string;
  createdAt: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Responsive hook for mobile detection
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    // Mock notifications for now - in a real app, you'd fetch from your backend
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'card_assigned',
        title: 'Card assigned to you',
        message: 'You were assigned to "Fix login bug" in Development Board',
        boardId: 'board1',
        boardTitle: 'Development Board',
        cardId: 'card1',
        cardTitle: 'Fix login bug',
        fromUser: 'John Doe',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: '2',
        type: 'card_comment',
        title: 'New comment',
        message: 'Sarah commented on "Design new homepage"',
        boardId: 'board2',
        boardTitle: 'Design Project',
        cardId: 'card2',
        cardTitle: 'Design new homepage',
        fromUser: 'Sarah Wilson',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false
      },
      {
        id: '3',
        type: 'board_invite',
        title: 'Board invitation',
        message: 'You were invited to join "Marketing Campaign" board',
        boardId: 'board3',
        boardTitle: 'Marketing Campaign',
        fromUser: 'Mike Johnson',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      },
      {
        id: '4',
        type: 'due_date',
        title: 'Due date reminder',
        message: '"Update documentation" is due tomorrow',
        boardId: 'board1',
        boardTitle: 'Development Board',
        cardId: 'card3',
        cardTitle: 'Update documentation',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreateBoard = async (title: string, background?: BoardBackground, template?: BoardTemplate) => {
    if (!user) return;

    try {
      let boardId: string;
      
      if (template) {
        // Create board from template
        boardId = await createBoardFromTemplate(template, title, background);
      } else {
        // Create regular board
        boardId = await createBoard({
          title,
          backgroundColor: background?.value || '#0079bf',
          background,
          createdBy: user.uid,
        });
      }
      
      // Navigate to the new board
      router.push(`/boards/${boardId}`);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'card_assigned':
        return <User size={20} className="text-blue-500" />;
      case 'card_comment':
        return <MessageSquare size={20} className="text-green-500" />;
      case 'board_invite':
        return <UserPlus size={20} className="text-purple-500" />;
      case 'due_date':
        return <Calendar size={20} className="text-orange-500" />;
      case 'mention':
        return <Bell size={20} className="text-red-500" />;
      default:
        return <Bell size={20} className="text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.boardId) {
      if (notification.cardId) {
        router.push(`/boards/${notification.boardId}?card=${notification.cardId}`);
      } else {
        router.push(`/boards/${notification.boardId}`);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationsContent = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="pb-20">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          !notification.read 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(notification.createdAt)}</span>
                          {notification.boardTitle && (
                            <>
                              <span>•</span>
                              <span>{notification.boardTitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check size={16} className="text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Delete notification"
                    >
                      <X size={16} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
            <p className="text-gray-500 dark:text-gray-400">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      {isMobile || isTablet ? (
        <MobileLayout
          showBottomNav={true}
          currentPath="/notifications"
          onCreateBoard={() => setShowCreateModal(true)}
          onSearch={() => router.push('/search')}
          onNotifications={() => {}} // Already on notifications page
          onProfile={() => router.push('/profile')}
        >
          {notificationsContent}
        </MobileLayout>
      ) : (
        notificationsContent
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </ProtectedRoute>
  );
} 