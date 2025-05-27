'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { BoardBackground, BoardTemplate } from '@/types';
import { createBoard } from '@/services/boardService';
import { createBoardFromTemplate } from '@/services/boardTemplateService';
import { ArrowLeft, User, Mail, Calendar, Settings, LogOut, Edit, Camera, Shield, Bell, Moon, Sun } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MobileLayout, useResponsive } from '@/components/mobile/MobileLayout';
import { CreateBoardModal } from '@/components/boards/CreateBoardModal';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Responsive hook for mobile detection
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

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

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    // In a real app, you'd save this preference to the backend
  };

  const formatJoinDate = (user: any) => {
    if (!user?.metadata?.creationTime) return 'Unknown';
    
    const date = new Date(user.metadata.creationTime);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const profileContent = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
              <Camera size={16} />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.displayName || 'Anonymous User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar size={14} />
              <span>Joined {formatJoinDate(user)}</span>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Edit size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="pb-20">
        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 mt-4 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Account
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <User size={20} className="text-gray-600 dark:text-gray-300" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Personal Information</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Update your name and email</div>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Shield size={20} className="text-gray-600 dark:text-gray-300" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Security</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Password and two-factor authentication</div>
              </div>
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 mt-4 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Preferences
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon size={20} className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun size={20} className="text-gray-600 dark:text-gray-300" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Use dark theme</div>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Notifications</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Receive push notifications</div>
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white dark:bg-gray-800 mt-4 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              App
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Settings size={20} className="text-gray-600 dark:text-gray-300" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">General Settings</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Language, timezone, and more</div>
              </div>
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white dark:bg-gray-800 mt-4">
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            <LogOut size={20} className="text-red-600" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-red-600">
                {loading ? 'Signing out...' : 'Sign Out'}
              </div>
              <div className="text-xs text-red-500">Sign out of your account</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      {isMobile || isTablet ? (
        <MobileLayout
          showBottomNav={true}
          currentPath="/profile"
          onCreateBoard={() => setShowCreateModal(true)}
          onSearch={() => router.push('/search')}
          onNotifications={() => router.push('/notifications')}
          onProfile={() => {}} // Already on profile page
        >
          {profileContent}
        </MobileLayout>
      ) : (
        profileContent
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