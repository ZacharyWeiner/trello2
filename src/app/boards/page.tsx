'use client';

export const dynamic = 'force-dynamic';

// 🔧 Pipeline Test - Auto-deploy verification at 2024-12-27 14:30

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Board, BoardBackground, BoardTemplate } from '@/types';
import { getUserBoards, createBoard, migrateAllUserBoards, deleteBoard } from '@/services/boardService';
import { createBoardFromTemplate } from '@/services/boardTemplateService';
import { NotificationService } from '@/services/notificationService';
import { Plus, Loader2, Users, Crown, Eye, User, MoreVertical, Trash2, Trophy, BookOpen, Sparkles, Target, TrendingUp, Bell } from 'lucide-react';
import Link from 'next/link';
import { CreateBoardModal } from '@/components/boards/CreateBoardModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MobileLayout, useResponsive } from '@/components/mobile/MobileLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function BoardsPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState<string | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<string | null>(null);

  // Responsive hook for mobile detection
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  const loadBoards = async () => {
    if (!user) return;
    
    try {
      // First, migrate any old boards to new member structure
      await migrateAllUserBoards(user.uid);
      
      // Then load the boards
      const userBoards = await getUserBoards(user.uid);
      setBoards(userBoards);
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualMigration = async () => {
    if (!user) return;
    
    setMigrating(true);
    try {
      await migrateAllUserBoards(user.uid);
      await loadBoards();
      alert('Migration completed! Please refresh the page.');
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed. Check console for details.');
    } finally {
      setMigrating(false);
    }
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
      
      // Reload boards
      await loadBoards();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleDeleteBoard = async (boardId: string, boardTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${boardTitle}"?\n\nThis will permanently delete:\n• All lists and cards\n• All comments and attachments\n• All board member access\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeletingBoard(boardId);
    try {
      await deleteBoard(boardId);
      await loadBoards(); // Reload the boards list
      setBoardMenuOpen(null);
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setDeletingBoard(null);
    }
  };

  const handleTestNotification = async () => {
    if (!user) return;

    try {
      await NotificationService.createMentionNotification(
        user.uid, // Send to yourself
        'test-user-123',
        'Test System',
        'test-card-123',
        'Sample Task Card',
        'test-board-123',
        'Demo Board',
        'This is a test notification to verify the notification system is working! 🎉'
      );
      alert('✅ Test notification sent! Check the bell icon to see it.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('❌ Failed to send test notification. Check console for details.');
    }
  };

  const getUserRole = (board: Board): string => {
    if (!user) return 'viewer';
    const member = board.members.find(m => m.userId === user.uid);
    return member?.role || 'viewer';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'member':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BookOpen className="h-8 w-8 text-white" />
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 inline-flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <span className="text-gray-700 font-medium">Loading your boards...</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const boardsContent = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
          <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Boards</h1>
                <p className="text-gray-600">Boards you've created or been invited to collaborate on</p>
              </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationBell />
            
            {/* Test Notification Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleTestNotification}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-sm"
                title="Send a test notification to yourself"
              >
                <Bell className="h-4 w-4" />
                <span>Test</span>
              </button>
            </motion.div>
            
            {/* Create Board Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>New Board</span>
              </button>
            </motion.div>
            
            {/* Leaderboard Link */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/leaderboard"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              <Trophy className="h-4 w-4" />
                  <span>Leaderboard</span>
            </Link>
              </motion.div>
              
              {/* Demo Board Link */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/board-story-demo"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
              >
                  <Sparkles className="h-4 w-4" />
                  <span>Story Demo</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Board Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Admin</h3>
        </div>
            <p className="text-3xl font-bold text-yellow-600">{boards.filter(b => getUserRole(b) === 'admin').length}</p>
            <p className="text-sm text-gray-500">Boards you manage</p>
      </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Member</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{boards.filter(b => getUserRole(b) === 'member').length}</p>
            <p className="text-sm text-gray-500">Active collaboration</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Viewer</h3>
            </div>
            <p className="text-3xl font-bold text-gray-600">{boards.filter(b => getUserRole(b) === 'viewer').length}</p>
            <p className="text-sm text-gray-500">Read-only access</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Total</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{boards.length}</p>
            <p className="text-sm text-gray-500">All boards</p>
          </div>
        </motion.div>

        {/* Boards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {boards.map((board, index) => {
          const userRole = getUserRole(board);
          const isDeleting = deletingBoard === board.id;
          
          return (
              <motion.div
                key={board.id}
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
              <Link
                href={`/boards/${board.id}`}
                  className="block relative rounded-xl p-6 h-40 flex flex-col justify-between font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: board.backgroundColor || '#0079bf' }}
              >
                {/* Board Title */}
                  <span className="text-lg font-semibold pr-8 line-clamp-2">{board.title}</span>
                
                {/* Board Info */}
                  <div className="flex items-center justify-between text-sm opacity-90">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{board.members.length} members</span>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)} bg-opacity-90`}>
                    {getRoleIcon(userRole)}
                    <span className="capitalize">{userRole}</span>
                  </div>
                </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-center text-white">
                      <BookOpen className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Open Board</div>
                  </div>
                </div>

                {/* Loading overlay for deletion */}
                {isDeleting && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <div className="text-sm">Deleting...</div>
                    </div>
                  </div>
                )}
              </Link>

              {/* Board Menu Button - Only for admins */}
              {userRole === 'admin' && (
                  <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setBoardMenuOpen(boardMenuOpen === board.id ? null : board.id);
                    }}
                      className="p-2 rounded-lg bg-black bg-opacity-20 hover:bg-opacity-40 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4 text-white" />
                  </button>

                  {/* Board Menu Dropdown */}
                  {boardMenuOpen === board.id && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setBoardMenuOpen(null)}
                      />
                      
                      {/* Menu */}
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteBoard(board.id, board.title);
                          }}
                          disabled={isDeleting}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Board
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              </motion.div>
          );
        })}

          {/* Create New Board Button */}
          <motion.button
          onClick={() => setShowCreateModal(true)}
            className="rounded-xl p-6 h-40 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 group"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
          <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Create new board</span>
            <div className="text-xs text-gray-500 mt-1">You'll be the admin</div>
          </div>
          </motion.button>
        </motion.div>

        {/* Empty State */}
      {boards.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-gray-400" />
          </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No boards yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Create your first board or wait to be invited to collaborate on others
          </p>
            <motion.button
            onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
          >
            Create your first board
            </motion.button>
          </motion.div>
      )}

        {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
          {boardsContent}
    </ProtectedRoute>
  );
} 