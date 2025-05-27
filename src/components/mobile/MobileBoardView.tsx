'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Search, Filter, Users, Settings, Zap, GitBranch, Archive, Trophy, Thermometer, TrendingDown, Pizza, Palette, ChevronDown, Bell, Star, X } from 'lucide-react';
import { Board, List, Card } from '@/types';
import { TouchDragDrop, DropZone } from './TouchDragDrop';
import { SwipeActions, createCardActions, createListActions } from './SwipeActions';
import { useResponsive } from './MobileLayout';
import { useNetworkStatus } from './NetworkStatus';
import { CardDependencyBadge } from '@/components/cards/CardDependencyIndicator';
import { UserAvatarStack } from '@/components/users/UserAvatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { PresenceIndicator } from '@/components/realtime/PresenceIndicator';
import { MobileToolsModal } from './MobileToolsModal';

interface MobileBoardViewProps {
  board: Board;
  lists: List[];
  cards: Card[];
  onCardMove: (cardId: string, newListId: string, newPosition: number) => void;
  onListMove: (listId: string, newPosition: number) => void;
  onCardEdit: (card: Card) => void;
  onCardDelete: (cardId: string) => void;
  onCardArchive: (cardId: string) => void;
  onListEdit: (list: List) => void;
  onListArchive: (listId: string) => void;
  onAddCard: (listId: string) => void;
  onAddList: () => void;
  currentUserId: string;
  onBoardUpdate: (board: Board) => void;
  onBoardDelete?: () => void;
  onShowArchive?: () => void;
  onShowTeamRace?: () => void;
  onShowThermometer?: () => void;
  onShowBurndown?: () => void;
  onShowPizza?: () => void;
  onShowStoryMode?: () => void;
  onShowMemberManager?: () => void;
  onShowAutomationManager?: () => void;
  onShowBoardSettings?: () => void;
  onShowDependencyGraph?: () => void;
  onShowThemeSwitcher?: () => void;
  onlineUsers?: any[];
  availableLabels?: any[];
  onCreateLabel?: (name: string, color: string) => void;
}

export const MobileBoardView: React.FC<MobileBoardViewProps> = ({
  board,
  lists,
  cards,
  onCardMove,
  onListMove,
  onCardEdit,
  onCardDelete,
  onCardArchive,
  onListEdit,
  onListArchive,
  onAddCard,
  onAddList,
  currentUserId,
  onBoardUpdate,
  onBoardDelete,
  onShowArchive,
  onShowTeamRace,
  onShowThermometer,
  onShowBurndown,
  onShowPizza,
  onShowStoryMode,
  onShowMemberManager,
  onShowAutomationManager,
  onShowBoardSettings,
  onShowDependencyGraph,
  onShowThemeSwitcher,
  onlineUsers,
  availableLabels,
  onCreateLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'position' | 'created' | 'updated'>('position');
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const { isMobile, isTablet, orientation } = useResponsive();
  const { isOnline, hasPendingSync } = useNetworkStatus();
  
  // Get current user role
  const currentUserMember = board.members.find(m => m.userId === currentUserId);
  const currentUserRole = currentUserMember?.role || 'viewer';



  // Filter and sort cards
  const getFilteredCards = (listId: string) => {
    let filteredCards = cards.filter(card => card.listId === listId);
    
    // Apply search filter
    if (searchQuery) {
      filteredCards = filteredCards.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply label filter
    if (selectedFilter !== 'all') {
      filteredCards = filteredCards.filter(card =>
        card.labels?.some(label => label.id === selectedFilter)
      );
    }
    
    // Sort cards
    filteredCards.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return a.position - b.position;
      }
    });
    
    return filteredCards;
  };

  const handleCardDrop = (cardId: string, dropZone: string) => {
    const [, listId] = dropZone.split('-');
    const card = cards.find(c => c.id === cardId);
    if (card && listId && card.listId !== listId) {
      const targetCards = getFilteredCards(listId);
      onCardMove(cardId, listId, targetCards.length);
    }
  };

  const handleListScroll = (listId: string) => {
    // Implement infinite scroll for large lists
    console.log('Scrolling list:', listId);
  };

  // Mobile-specific layout calculations
  const getListWidth = () => {
    if (isMobile) {
      return orientation === 'landscape' ? '280px' : '75vw';
    }
    return '300px';
  };

  const getListSpacing = () => {
    return isMobile ? '4px' : '16px';
  };

  const getContainerPadding = () => {
    return isMobile ? '0px' : '16px';
  };

  return (
    <div className="mobile-board-view h-full w-full flex flex-col overflow-hidden" 
         style={{ 
           background: 'var(--bg-primary)',
           color: 'var(--text-primary)'
         }}>
      {/* Board Header with Tools */}
      <div className="mobile-board-header flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {board.title}
          </h1>
          
          <div className="flex items-center space-x-2">
            {/* Sync Status */}
            {hasPendingSync && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            )}
            
            {/* Online Users Indicator */}
            {onlineUsers && onlineUsers.length > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-700 dark:text-green-300">{onlineUsers.length}</span>
              </div>
            )}
            
            {/* Tools Menu Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <MoreVertical size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">All Labels</option>
              {(board.labels || []).map(label => (
                <option key={label.id} value={label.id}>{label.name}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="position">Position</option>
              <option value="created">Created Date</option>
              <option value="updated">Updated Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div 
          className="h-full mobile-board-content"
          style={{ 
            scrollSnapType: isMobile ? 'x mandatory' : 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div 
            className="flex h-full"
            style={{ 
              gap: getListSpacing(),
              padding: `${getContainerPadding()} ${getContainerPadding()}`,
              minWidth: 'min-content',
            }}
          >
            {/* Lists */}
            {lists.map((list, index) => (
              <div
                key={list.id}
                style={{ 
                  width: getListWidth(),
                  scrollSnapAlign: isMobile ? 'start' : 'none',
                }}
                className="mobile-list-container"
              >
                <DropZone
                  id={`list-${list.id}`}
                  className="h-full"
                  onDrop={(data) => handleCardDrop(data.id, `list-${list.id}`)}
                >
                  <SwipeActions
                    {...createListActions(
                      () => onListEdit(list),
                      () => onListArchive(list.id),
                      () => console.log('More actions for list:', list.id)
                    )}
                    disabled={!isMobile}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                      {/* List Header */}
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {list.title}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {list.wipLimit && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                {getFilteredCards(list.id).length}/{list.wipLimit}
                              </span>
                            )}
                            <button
                              onClick={() => onAddCard(list.id)}
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                              style={{ 
                                minHeight: '36px',
                                minWidth: '36px',
                                touchAction: 'manipulation'
                              }}
                            >
                              <Plus size={14} className="text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Cards */}
                      <div 
                        className="flex-1 overflow-y-auto scrollbar-mobile p-1.5 space-y-1.5"
                        onScroll={() => handleListScroll(list.id)}
                      >
                        <AnimatePresence>
                          {getFilteredCards(list.id).map((card) => (
                            <motion.div
                              key={card.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <SwipeActions
                                {...createCardActions(
                                  () => onCardEdit(card),
                                  () => onCardArchive(card.id),
                                  () => onCardDelete(card.id)
                                )}
                                disabled={!isMobile}
                              >
                                <TouchDragDrop
                                  dragData={{ id: card.id, type: 'card' }}
                                  onDrop={(dropZone) => handleCardDrop(card.id, dropZone)}
                                  className="w-full"
                                  disabled={!isOnline}
                                >
                                  <div 
                                    className="bg-white dark:bg-gray-700 rounded-lg p-2.5 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow cursor-pointer touch-manipulation card-touch"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Mobile card clicked:', card.title);
                                      onCardEdit(card);
                                    }}
                                    onTouchEnd={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    style={{ 
                                      minHeight: '44px',
                                      touchAction: 'manipulation'
                                    }}
                                  >
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5 selectable pointer-events-none">
                                      {card.title}
                                    </h4>
                                    
                                    {card.description && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 line-clamp-2 selectable pointer-events-none">
                                        {card.description}
                                      </p>
                                    )}
                                    
                                    {/* Card Labels */}
                                    {card.labels && card.labels.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-1.5 pointer-events-none">
                                        {card.labels.slice(0, 3).map((label) => (
                                          <span
                                            key={label.id}
                                            className="text-xs px-2 py-1 rounded text-white"
                                            style={{ backgroundColor: label.color }}
                                          >
                                            {label.name}
                                          </span>
                                        ))}
                                        {card.labels.length > 3 && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            +{card.labels.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Card Meta */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {new Date(card.updatedAt).toLocaleDateString()}
                                        </span>
                                        <CardDependencyBadge card={card} />
                                      </div>
                                      {!isOnline && (
                                        <span className="text-yellow-500">Offline</span>
                                      )}
                                    </div>
                                  </div>
                                </TouchDragDrop>
                              </SwipeActions>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {/* Add Card Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddCard(list.id);
                          }}
                          className="w-full p-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 
                                   rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 
                                   dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                                   transition-colors text-sm btn-touch touch-manipulation"
                          style={{ 
                            minHeight: '44px',
                            touchAction: 'manipulation'
                          }}
                        >
                          <Plus size={14} className="inline mr-1.5" />
                          Add a card
                        </button>
                      </div>
                    </div>
                  </SwipeActions>
                </DropZone>
              </div>
            ))}

            {/* Add List Button */}
            <div
              style={{ width: getListWidth() }}
              className="flex-shrink-0"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddList();
                }}
                className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 
                         rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 
                         dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 
                         transition-colors flex flex-col items-center justify-center btn-touch touch-manipulation"
                style={{ 
                  minHeight: '96px',
                  touchAction: 'manipulation'
                }}
              >
                <Plus size={20} className="mb-1.5" />
                <span className="text-sm">Add a list</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tools Modal */}
      <MobileToolsModal
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        board={board}
        lists={lists}
        cards={cards}
        currentUserId={currentUserId}
        onShowMemberManager={onShowMemberManager}
        onShowAutomationManager={onShowAutomationManager}
        onShowBoardSettings={onShowBoardSettings}
        onShowDependencyGraph={onShowDependencyGraph}
        onShowTeamRace={onShowTeamRace}
        onShowThermometer={onShowThermometer}
        onShowBurndown={onShowBurndown}
        onShowPizza={onShowPizza}
        onShowStoryMode={onShowStoryMode}
        onShowArchive={onShowArchive}
        onShowThemeSwitcher={onShowThemeSwitcher}
        onlineUsers={onlineUsers}
      />
    </div>
  );
}; 