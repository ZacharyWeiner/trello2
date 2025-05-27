'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Search, 
  Filter, 
  Calendar,
  User,
  X,
  CheckSquare,
  Square,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { Card, List } from '@/types';
import { CardArchiveService } from '@/services/cardArchiveService';
import { useAuthContext } from '@/contexts/AuthContext';

interface ArchiveManagerProps {
  boardId: string;
  lists: List[];
  isOpen: boolean;
  onClose: () => void;
  onCardUpdate: () => void; // Callback to refresh board data
}

export const ArchiveManager: React.FC<ArchiveManagerProps> = ({
  boardId,
  lists,
  isOpen,
  onClose,
  onCardUpdate,
}) => {
  const { user } = useAuthContext();
  const [archivedCards, setArchivedCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [archiveStats, setArchiveStats] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'archived' | 'created' | 'title'>('archived');
  const [filterBy, setFilterBy] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    if (isOpen) {
      loadArchivedCards();
      loadArchiveStats();
    }
  }, [isOpen, boardId]);

  const loadArchivedCards = async () => {
    setLoading(true);
    try {
      const cards = await CardArchiveService.getArchivedCards(boardId);
      setArchivedCards(cards);
    } catch (error) {
      console.error('Error loading archived cards:', error);
      alert('Failed to load archived cards');
    } finally {
      setLoading(false);
    }
  };

  const loadArchiveStats = async () => {
    try {
      const stats = await CardArchiveService.getArchiveStats(boardId);
      setArchiveStats(stats);
    } catch (error) {
      console.error('Error loading archive stats:', error);
    }
  };

  const handleRestoreCard = async (cardId: string, targetListId?: string) => {
    try {
      await CardArchiveService.restoreCard(cardId, targetListId);
      await loadArchivedCards();
      onCardUpdate();
    } catch (error) {
      console.error('Error restoring card:', error);
      alert('Failed to restore card');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await CardArchiveService.permanentlyDeleteCard(cardId);
      await loadArchivedCards();
      setShowConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card');
    }
  };

  const handleBulkRestore = async () => {
    if (selectedCards.size === 0) return;
    
    try {
      await CardArchiveService.restoreMultipleCards(Array.from(selectedCards));
      await loadArchivedCards();
      onCardUpdate();
      setSelectedCards(new Set());
    } catch (error) {
      console.error('Error restoring cards:', error);
      alert('Failed to restore selected cards');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return;
    
    if (!confirm(`Are you sure you want to permanently delete ${selectedCards.size} cards? This action cannot be undone.`)) {
      return;
    }

    try {
      const promises = Array.from(selectedCards).map(cardId => 
        CardArchiveService.permanentlyDeleteCard(cardId)
      );
      await Promise.all(promises);
      await loadArchivedCards();
      setSelectedCards(new Set());
    } catch (error) {
      console.error('Error deleting cards:', error);
      alert('Failed to delete selected cards');
    }
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };

  const selectAllCards = () => {
    const filteredCardIds = getFilteredCards().map(card => card.id);
    setSelectedCards(new Set(filteredCardIds));
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  const getFilteredCards = () => {
    let filtered = archivedCards;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply time filter
    if (filterBy !== 'all') {
      const now = new Date();
      const cutoff = filterBy === 'week' 
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(card => 
        card.archivedAt && card.archivedAt >= cutoff
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'archived':
        default:
          if (!a.archivedAt || !b.archivedAt) return 0;
          return b.archivedAt.getTime() - a.archivedAt.getTime();
      }
    });

    return filtered;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getListName = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    return list?.title || 'Unknown List';
  };

  if (!isOpen) return null;

  const filteredCards = getFilteredCards();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Archive size={24} className="text-gray-600 dark:text-gray-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Archived Cards
              </h2>
              {archiveStats && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {archiveStats.totalArchived} cards archived • {archiveStats.archivedThisWeek} this week
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search archived cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="archived">Archived Date</option>
              <option value="created">Created Date</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {filteredCards.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={selectedCards.size === filteredCards.length ? deselectAllCards : selectAllCards}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedCards.size === filteredCards.length ? (
                    <>
                      <CheckSquare size={16} />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square size={16} />
                      Select All
                    </>
                  )}
                </button>
                {selectedCards.size > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCards.size} selected
                  </span>
                )}
              </div>

              {selectedCards.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkRestore}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Restore ({selectedCards.size})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete ({selectedCards.size})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <Archive size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery || filterBy !== 'all' ? 'No matching archived cards' : 'No archived cards'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Cards you archive will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCards.map((card) => (
                <ArchivedCardItem
                  key={card.id}
                  card={card}
                  lists={lists}
                  isSelected={selectedCards.has(card.id)}
                  onToggleSelect={() => toggleCardSelection(card.id)}
                  onRestore={handleRestoreCard}
                  onDelete={() => setShowConfirmDelete(card.id)}
                  getListName={getListName}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Confirm Delete Modal */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Permanently Delete Card
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This action cannot be undone. The card will be permanently deleted from the system.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDelete(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                             transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteCard(showConfirmDelete)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                             transition-colors"
                  >
                    Delete Permanently
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Archived Card Item Component
interface ArchivedCardItemProps {
  card: Card;
  lists: List[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onRestore: (cardId: string, targetListId?: string) => void;
  onDelete: () => void;
  getListName: (listId: string) => string;
  formatDate: (date: Date) => string;
}

const ArchivedCardItem: React.FC<ArchivedCardItemProps> = ({
  card,
  lists,
  isSelected,
  onToggleSelect,
  onRestore,
  onDelete,
  getListName,
  formatDate,
}) => {
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);

  const handleRestore = (targetListId?: string) => {
    onRestore(card.id, targetListId);
    setShowRestoreOptions(false);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleSelect}
          className="mt-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isSelected ? (
            <CheckSquare size={16} className="text-blue-500" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {card.title}
          </h4>
          
          {card.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {card.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Archived {card.archivedAt ? formatDate(card.archivedAt) : 'Unknown'}
            </span>
            <span>From: {getListName(card.originalListId || card.listId)}</span>
            {card.labels && card.labels.length > 0 && (
              <div className="flex gap-1">
                {card.labels.slice(0, 3).map((label) => (
                  <span
                    key={label.id}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                    title={label.name}
                  />
                ))}
                {card.labels.length > 3 && (
                  <span className="text-xs">+{card.labels.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowRestoreOptions(!showRestoreOptions)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              <RotateCcw size={14} />
              Restore
            </button>

            {showRestoreOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                <button
                  onClick={() => handleRestore()}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Restore to original list
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Restore to different list:
                  </div>
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleRestore(list.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {list.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete permanently"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}; 