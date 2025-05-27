'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Board, BoardMember, List, Card } from '@/types';
import { UserAvatarStack } from '@/components/users/UserAvatar';
import { BoardMemberManager } from './BoardMemberManager';
import { AutomationManager } from '@/components/automation/AutomationManager';
import { BoardSettingsModal } from './BoardSettingsModal';
import { DependencyGraph } from './DependencyGraph';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Users, Settings, Star, X, Zap, GitBranch, Archive, Trophy, Thermometer, TrendingDown, Pizza, ChevronDown, MoreHorizontal, Palette, Sparkles, Sword, Calendar, Brain, BarChart3 } from 'lucide-react';
import { ThemeSwitcher, useTheme } from '@/components/theme/ThemeSwitcher';
import { QuestModeButton } from '@/components/quest/QuestModeButton';
import { GanttViewManager } from '@/components/gantt/GanttViewManager';
import { MeetingNotesToTasks } from '@/components/meeting/MeetingNotesToTasks';
import { BusinessIntelligenceDashboard } from '@/components/analytics/BusinessIntelligenceDashboard';

interface BoardHeaderProps {
  board: Board;
  currentUserId: string;
  onBoardUpdate: (board: Board) => void;
  onBoardDelete?: () => void;
  lists?: List[];
  cards?: Record<string, Card[]>;
  onShowArchive?: () => void;
  onShowTeamRace?: () => void;
  onShowThermometer?: () => void;
  onShowBurndown?: () => void;
  onShowPizza?: () => void;
  onShowStoryMode?: () => void;
  onShowGantt?: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  currentUserId,
  onBoardUpdate,
  onBoardDelete,
  lists = [],
  cards = {},
  onShowArchive,
  onShowTeamRace,
  onShowThermometer,
  onShowBurndown,
  onShowPizza,
  onShowStoryMode,
  onShowGantt,
}) => {
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showAutomationManager, setShowAutomationManager] = useState(false);
  const [showBoardSettings, setShowBoardSettings] = useState(false);
  const [showDependencyGraph, setShowDependencyGraph] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [showGanttView, setShowGanttView] = useState(false);
  const [showMeetingNotes, setShowMeetingNotes] = useState(false);
  const [showBusinessIntelligence, setShowBusinessIntelligence] = useState(false);
  
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const { currentTheme, changeTheme } = useTheme();
  
  const currentUserMember = board.members.find(m => m.userId === currentUserId);
  const currentUserRole = currentUserMember?.role || 'viewer';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    };

    if (showToolsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsMenu]);

  const handleMembersChange = (members: BoardMember[]) => {
    const updatedBoard = { ...board, members };
    onBoardUpdate(updatedBoard);
  };

  return (
    <>
      <div 
        className="border-b px-6 py-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Board Title and Info */}
          <div className="flex items-center gap-4">
            <h1 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {board.title}
            </h1>
            <div className="flex items-center gap-2">
              <Star 
                className="h-4 w-4"
                style={{ color: 'var(--text-secondary)' }}
              />
              <span 
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                {currentUserRole === 'admin' ? 'Admin' : 
                 currentUserRole === 'member' ? 'Member' : 'Viewer'}
              </span>
            </div>
          </div>

          {/* Board Members and Actions */}
          <div className="flex items-center gap-4">
            {/* Member Avatars */}
            <div className="flex items-center gap-2">
              <UserAvatarStack 
                users={board.members} 
                maxVisible={5}
                size="sm"
              />
              <button
                onClick={() => setShowMemberManager(true)}
                className="ds-button-secondary flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
              >
                <Users className="h-4 w-4" />
                <span>{board.members.length} member{board.members.length !== 1 ? 's' : ''}</span>
              </button>
            </div>

            {/* Quest Mode Button */}
            <QuestModeButton
              board={board}
              lists={lists}
              cards={Object.values(cards).flat()}
              userId={currentUserId}
              variant="secondary"
              size="sm"
            />

            {/* Automation Button */}
            {(currentUserRole === 'admin' || currentUserRole === 'member') && (
              <button
                onClick={() => setShowAutomationManager(true)}
                className="ds-button-accent flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
              >
                <Zap className="h-4 w-4" />
                <span>Automation</span>
              </button>
            )}

            {/* Tools Menu Dropdown */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="ds-button-secondary flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span>Tools</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showToolsMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showToolsMenu && (
                <div 
                  className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg py-1 z-50"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  {/* Gantt Timeline */}
                  <button
                    onClick={() => {
                      setShowGanttView(true);
                      setShowToolsMenu(false);
                    }}
                    className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Gantt Timeline</span>
                  </button>

                  {/* Meeting Notes to Tasks */}
                  <button
                    onClick={() => {
                      setShowMeetingNotes(true);
                      setShowToolsMenu(false);
                    }}
                    className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                  >
                    <Brain className="h-4 w-4" />
                    <span>Meeting Notes to Tasks</span>
                  </button>

                  {/* Business Intelligence */}
                  <button
                    onClick={() => {
                      setShowBusinessIntelligence(true);
                      setShowToolsMenu(false);
                    }}
                    className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Business Intelligence</span>
                  </button>

                  {/* Dependencies */}
            <button
                    onClick={() => {
                      setShowDependencyGraph(true);
                      setShowToolsMenu(false);
                    }}
                    className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
            >
              <GitBranch className="h-4 w-4" />
              <span>Dependencies</span>
            </button>

                  {/* Team Race */}
                  {onShowTeamRace && board.members.length > 1 && (
                    <button
                      onClick={() => {
                        onShowTeamRace();
                        setShowToolsMenu(false);
                      }}
                      className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>Team Race</span>
                    </button>
                  )}

                  {/* Progress Thermometer */}
                  {onShowThermometer && (
                    <button
                      onClick={() => {
                        onShowThermometer();
                        setShowToolsMenu(false);
                      }}
                      className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                    >
                      <Thermometer className="h-4 w-4" />
                      <span>Progress</span>
                    </button>
                  )}

                  {/* Burndown Chart */}
                  {onShowBurndown && (
                    <button
                      onClick={() => {
                        onShowBurndown();
                        setShowToolsMenu(false);
                      }}
                      className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                    >
                      <TrendingDown className="h-4 w-4" />
                      <span>Burndown</span>
                    </button>
                  )}

                  {/* Pizza Progress */}
                  {onShowPizza && (
                    <button
                      onClick={() => {
                        onShowPizza();
                        setShowToolsMenu(false);
                      }}
                      className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                    >
                      <Pizza className="h-4 w-4" />
                      <span>Pizza</span>
                    </button>
                  )}

                  {/* Story Mode */}
                  {onShowStoryMode && (
                    <button
                      onClick={() => {
                        onShowStoryMode();
                        setShowToolsMenu(false);
                      }}
                      className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Story Mode</span>
                    </button>
                  )}

                  {/* Quest Mode (Alternative Access) */}
                  <button
                    onClick={() => {
                      // Quest Mode is handled by the QuestModeButton component
                      setShowToolsMenu(false);
                    }}
                    className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Sword className="h-4 w-4" />
                    <span>Quest Mode (Use button above)</span>
                  </button>

                  {/* Divider */}
                  <div 
                    className="border-t my-1"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  />

                  {/* Theme Switcher */}
                  <button
                    onClick={() => {
                      setShowThemeSwitcher(true);
                      setShowToolsMenu(false);
                    }}
                    className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
                  >
                    <Palette className="h-4 w-4" />
                    <span>Themes</span>
                  </button>

                  {/* Divider */}
            {onShowArchive && (
                    <>
                      <div 
                        className="border-t my-1"
                        style={{ borderColor: 'var(--border-secondary)' }}
                      ></div>
                      
                      {/* Archive */}
              <button
                        onClick={() => {
                          onShowArchive();
                          setShowToolsMenu(false);
                        }}
                        className="ds-menu-item w-full flex items-center gap-3 px-4 py-2 text-sm"
              >
                <Archive className="h-4 w-4" />
                <span>Archive</span>
              </button>
                    </>
                  )}
                </div>
            )}
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Board Settings */}
            {currentUserRole === 'admin' && (
              <button 
                onClick={() => setShowBoardSettings(true)}
                className="ds-button-ghost p-2 rounded-lg"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Board Description */}
        {board.description && (
          <div className="mt-2">
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {board.description}
            </p>
          </div>
        )}

        {/* Member Info Summary */}
        <div 
          className="mt-3 flex items-center gap-4 text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <span>Created by {board.members.find(m => m.role === 'admin')?.displayName || 'Unknown'}</span>
          <span>•</span>
          <span>{board.members.filter(m => m.role === 'admin').length} admin{board.members.filter(m => m.role === 'admin').length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{board.members.filter(m => m.role === 'member').length} member{board.members.filter(m => m.role === 'member').length !== 1 ? 's' : ''}</span>
          {board.members.filter(m => m.role === 'viewer').length > 0 && (
            <>
              <span>•</span>
              <span>{board.members.filter(m => m.role === 'viewer').length} viewer{board.members.filter(m => m.role === 'viewer').length !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {/* Member Management Modal */}
      {showMemberManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Board Members</h2>
                <button
                  onClick={() => setShowMemberManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <BoardMemberManager
                boardId={board.id}
                boardTitle={board.title}
                members={board.members}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onMembersChange={handleMembersChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Automation Manager Modal */}
      <AutomationManager
        isOpen={showAutomationManager}
        onClose={() => setShowAutomationManager(false)}
        board={board}
        lists={lists}
      />

      {/* Board Settings Modal */}
      <BoardSettingsModal
        isOpen={showBoardSettings}
        onClose={() => setShowBoardSettings(false)}
        board={board}
        onBoardUpdate={onBoardUpdate}
        onBoardDelete={onBoardDelete}
      />

      {/* Dependency Graph Modal */}
      <DependencyGraph
        boardId={board.id}
        isOpen={showDependencyGraph}
        onClose={() => setShowDependencyGraph(false)}
      />

              {/* Theme Switcher Modal */}
        <ThemeSwitcher
          isOpen={showThemeSwitcher}
          onClose={() => setShowThemeSwitcher(false)}
          currentTheme={currentTheme}
          onThemeChange={(themeId) => {
            changeTheme(themeId);
            // Force a re-render to apply the new theme
            window.dispatchEvent(new Event('theme-changed'));
          }}
      />

      {/* Gantt View Manager Modal */}
      <GanttViewManager
        isOpen={showGanttView}
        onClose={() => setShowGanttView(false)}
        board={board}
        lists={lists}
        cards={Object.values(cards).flat()}
        onCardUpdate={(updatedCard) => {
          // Handle card updates from Gantt view
          // This would typically update the card in your state management
          console.log('Card updated from Gantt view:', updatedCard);
        }}
      />

      {/* Meeting Notes to Tasks Modal */}
      <MeetingNotesToTasks
        isOpen={showMeetingNotes}
        onClose={() => setShowMeetingNotes(false)}
        board={board}
        lists={lists}
        onTasksCreated={(tasks) => {
          console.log('Created tasks from meeting notes:', tasks);
          // In a real app, you would add these tasks to your board state
          // For now, we'll just log them
        }}
      />

      {/* Business Intelligence Dashboard */}
      <BusinessIntelligenceDashboard
        isOpen={showBusinessIntelligence}
        onClose={() => setShowBusinessIntelligence(false)}
        board={board}
        lists={lists}
        cards={Object.values(cards).flat()}
      />
    </>
  );
}; 