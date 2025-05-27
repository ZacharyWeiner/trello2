'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Settings, Zap, GitBranch, Archive, Trophy, Thermometer, TrendingDown, Pizza, Palette, Bell, Star, ChevronRight, Sparkles } from 'lucide-react';
import { Board, List, Card } from '@/types';

interface MobileToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  lists: List[];
  cards: Card[];
  currentUserId: string;
  onShowMemberManager?: () => void;
  onShowAutomationManager?: () => void;
  onShowBoardSettings?: () => void;
  onShowDependencyGraph?: () => void;
  onShowTeamRace?: () => void;
  onShowThermometer?: () => void;
  onShowBurndown?: () => void;
  onShowPizza?: () => void;
  onShowStoryMode?: () => void;
  onShowArchive?: () => void;
  onShowThemeSwitcher?: () => void;
  onlineUsers?: any[];
}

export const MobileToolsModal: React.FC<MobileToolsModalProps> = ({
  isOpen,
  onClose,
  board,
  lists,
  cards,
  currentUserId,
  onShowMemberManager,
  onShowAutomationManager,
  onShowBoardSettings,
  onShowDependencyGraph,
  onShowTeamRace,
  onShowThermometer,
  onShowBurndown,
  onShowPizza,
  onShowStoryMode,
  onShowArchive,
  onShowThemeSwitcher,
  onlineUsers = [],
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics' | 'settings'>('overview');
  
  // Get current user role
  const currentUserMember = board.members.find(m => m.userId === currentUserId);
  const currentUserRole = currentUserMember?.role || 'viewer';
  
  // Calculate some quick stats
  const totalCards = cards.length;
  const completedCards = cards.filter(card => {
    const list = lists.find(l => l.id === card.listId);
    return list?.listType === 'done' || list?.title.toLowerCase().includes('done');
  }).length;
  const progressPercentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  const handleToolAction = (action: () => void) => {
    action();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Board Tools
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Board Overview */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{board.title}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{lists.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Lists</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">{totalCards}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Cards</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{progressPercentage}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Complete</div>
            </div>
          </div>
          
          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
              </span>
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Tools', icon: Settings },
            { id: 'analytics', label: 'Analytics', icon: Trophy },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeSection === id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'overview' && (
            <div className="p-4 space-y-3">
              {/* Member Management */}
              {onShowMemberManager && (
                <button
                  onClick={() => handleToolAction(onShowMemberManager)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Members</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {board.members.length} member{board.members.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Automation */}
              {onShowAutomationManager && (currentUserRole === 'admin' || currentUserRole === 'member') && (
                <button
                  onClick={() => handleToolAction(onShowAutomationManager)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Zap size={20} className="text-yellow-600 dark:text-yellow-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Automation</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rules & workflows</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Dependencies */}
              {onShowDependencyGraph && (
                <button
                  onClick={() => handleToolAction(onShowDependencyGraph)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GitBranch size={20} className="text-purple-600 dark:text-purple-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Dependencies</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Card relationships</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Theme Switcher */}
              {onShowThemeSwitcher && (
                <button
                  onClick={() => handleToolAction(onShowThemeSwitcher)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={20} className="text-pink-600 dark:text-pink-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Themes</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Customize appearance</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Archive */}
              {onShowArchive && (
                <button
                  onClick={() => handleToolAction(onShowArchive)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Archive size={20} className="text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Archive</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Archived items</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="p-4 space-y-3">
              {/* Team Race */}
              {onShowTeamRace && board.members.length > 1 && (
                <button
                  onClick={() => handleToolAction(onShowTeamRace)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trophy size={20} className="text-yellow-600 dark:text-yellow-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Team Race</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Competition & leaderboard</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Progress Thermometer */}
              {onShowThermometer && (
                <button
                  onClick={() => handleToolAction(onShowThermometer)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Thermometer size={20} className="text-red-600 dark:text-red-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Progress</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Temperature tracking</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Burndown Chart */}
              {onShowBurndown && (
                <button
                  onClick={() => handleToolAction(onShowBurndown)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TrendingDown size={20} className="text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Burndown</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sprint progress chart</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Pizza Progress */}
              {onShowPizza && (
                <button
                  onClick={() => handleToolAction(onShowPizza)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Pizza size={20} className="text-orange-600 dark:text-orange-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Pizza Progress</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Fun progress visualization</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* Story Mode */}
              {onShowStoryMode && (
                <button
                  onClick={() => handleToolAction(onShowStoryMode)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Story Mode</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Epic narrative adventure</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="p-4 space-y-3">
              {/* Board Settings */}
              {onShowBoardSettings && currentUserRole === 'admin' && (
                <button
                  onClick={() => handleToolAction(onShowBoardSettings)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={20} className="text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Board Settings</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Configure board options</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              )}

              {/* User Role Info */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Your Role</span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 capitalize">
                  {currentUserRole}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Quick Stats</div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>• {completedCards} of {totalCards} cards completed</div>
                  <div>• {board.members.length} team member{board.members.length !== 1 ? 's' : ''}</div>
                  <div>• {onlineUsers.length} currently online</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 