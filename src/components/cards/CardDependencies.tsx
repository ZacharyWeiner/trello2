'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, 
  Unlink, 
  Plus, 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Search,
  ExternalLink
} from 'lucide-react';
import { Card, CardDependency } from '@/types';
import { CardDependencyService } from '@/services/cardDependencyService';
import { getListCards } from '@/services/boardService';
import { convertFirestoreDate } from '@/utils/firestore';

interface CardDependenciesProps {
  card: Card;
  boardId: string;
  onCardUpdate: (cardId: string, updates: Partial<Card>) => void;
  currentUserId: string;
}

export const CardDependencies: React.FC<CardDependenciesProps> = ({
  card,
  boardId,
  onCardUpdate,
  currentUserId,
}) => {
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'blocks' | 'blocked_by' | 'related'>('blocks');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showAddDependency) {
      loadAvailableCards();
    }
  }, [showAddDependency, boardId]);

  const loadAvailableCards = async () => {
    try {
      // Get all lists for the board
      const { getBoardLists } = await import('@/services/boardService');
      const lists = await getBoardLists(boardId);
      
      // Get all cards from all lists
      const allCards: Card[] = [];
      for (const list of lists) {
        const listCards = await getListCards(list.id);
        allCards.push(...listCards);
      }
      
      // Filter out the current card
      setAvailableCards(allCards.filter(c => c.id !== card.id));
    } catch (error) {
      console.error('Error loading available cards:', error);
    }
  };

  const handleAddDependency = async (targetCardId: string) => {
    if (!targetCardId || loading) return;

    setLoading(true);
    try {
      console.log('Adding dependency:', {
        sourceCardId: card.id,
        targetCardId,
        selectedType,
        reason,
        currentUserId
      });

      // Verify both cards exist
      const targetCard = availableCards.find(c => c.id === targetCardId);
      if (!targetCard) {
        throw new Error('Target card not found');
      }

      await CardDependencyService.addDependency(
        card.id,
        targetCardId,
        selectedType,
        reason || undefined,
        currentUserId
      );

      console.log('Dependency added successfully');

      // Refresh the card data by fetching the updated card from Firebase
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const cardDoc = await getDoc(doc(db, 'cards', card.id));
      if (cardDoc.exists()) {
        const updatedCardData = cardDoc.data();
        
        // Properly convert Firebase data to Card object
        const updatedCard = {
          ...card,
          ...updatedCardData,
          dependencies: (updatedCardData.dependencies || []).map((dep: any) => ({
            ...dep,
            createdAt: convertFirestoreDate(dep.createdAt) || new Date()
          })),
          blockedBy: (updatedCardData.blockedBy || []).map((dep: any) => ({
            ...dep,
            createdAt: convertFirestoreDate(dep.createdAt) || new Date()
          })),
          createdAt: convertFirestoreDate(updatedCardData.createdAt) || card.createdAt,
          updatedAt: convertFirestoreDate(updatedCardData.updatedAt) || new Date(),
          dueDate: convertFirestoreDate(updatedCardData.dueDate)
        };
        
        // Update the card with the fresh data
        onCardUpdate(card.id, updatedCard);
      }
      
      setShowAddDependency(false);
      setReason('');
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding dependency:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        sourceCardId: card.id,
        targetCardId,
        selectedType
      });
      alert(error instanceof Error ? error.message : 'Failed to add dependency');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDependency = async (dependency: CardDependency) => {
    if (loading) return;

    setLoading(true);
    try {
      await CardDependencyService.removeDependency(card.id, dependency.cardId, dependency.type);
      
      // Refresh the card data by fetching the updated card from Firebase
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const cardDoc = await getDoc(doc(db, 'cards', card.id));
      if (cardDoc.exists()) {
        const updatedCardData = cardDoc.data();
        
        // Properly convert Firebase data to Card object
        const updatedCard = {
          ...card,
          ...updatedCardData,
          dependencies: (updatedCardData.dependencies || []).map((dep: any) => ({
            ...dep,
            createdAt: convertFirestoreDate(dep.createdAt) || new Date()
          })),
          blockedBy: (updatedCardData.blockedBy || []).map((dep: any) => ({
            ...dep,
            createdAt: convertFirestoreDate(dep.createdAt) || new Date()
          })),
          createdAt: convertFirestoreDate(updatedCardData.createdAt) || card.createdAt,
          updatedAt: convertFirestoreDate(updatedCardData.updatedAt) || new Date(),
          dueDate: convertFirestoreDate(updatedCardData.dueDate)
        };
        
        // Update the card with the fresh data
        onCardUpdate(card.id, updatedCard);
      }
    } catch (error) {
      console.error('Error removing dependency:', error);
      alert('Failed to remove dependency');
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = availableCards.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDependencyIcon = (type: 'blocks' | 'blocked_by' | 'related') => {
    switch (type) {
      case 'blocks':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'blocked_by':
        return <Clock size={16} className="text-yellow-500" />;
      case 'related':
        return <Link2 size={16} className="text-blue-500" />;
    }
  };

  const getDependencyColor = (type: 'blocks' | 'blocked_by' | 'related') => {
    switch (type) {
      case 'blocks':
        return 'border-red-300 bg-red-100 text-red-900';
      case 'blocked_by':
        return 'border-yellow-300 bg-yellow-100 text-yellow-900';
      case 'related':
        return 'border-blue-300 bg-blue-100 text-blue-900';
    }
  };

  const getDependencyDescription = (type: 'blocks' | 'blocked_by' | 'related', cardTitle: string) => {
    switch (type) {
      case 'blocks':
        return `This card blocks "${cardTitle}"`;
      case 'blocked_by':
        return `This card is blocked by "${cardTitle}"`;
      case 'related':
        return `This card is related to "${cardTitle}"`;
    }
  };

  const getDependencyTypeLabel = (type: 'blocks' | 'blocked_by' | 'related') => {
    switch (type) {
      case 'blocks':
        return 'Blocking';
      case 'blocked_by':
        return 'Blocked By';
      case 'related':
        return 'Related To';
    }
  };

  const allDependencies = [
    ...(card.dependencies || []),
    ...(card.blockedBy || [])
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Link2 size={20} />
          Dependencies
        </h3>
        <button
          onClick={() => setShowAddDependency(true)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Add Dependency
        </button>
      </div>

      {/* Dependencies List */}
      <div className="space-y-2">
        {allDependencies.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Link2 size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No dependencies yet</p>
            <p className="text-sm mb-4">Track relationships between cards to manage project flow</p>
            <div className="text-xs space-y-1 max-w-md mx-auto">
              <p><span className="text-red-500">🔴 Blocking:</span> This card prevents another from starting</p>
              <p><span className="text-yellow-500">🟡 Blocked by:</span> This card can't start until another is done</p>
              <p><span className="text-blue-500">🔵 Related:</span> This card is connected to another</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {allDependencies.map((dependency, index) => (
              <motion.div
                key={`${dependency.cardId}-${dependency.type}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border-2 shadow-sm ${getDependencyColor(dependency.type)} relative group hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getDependencyIcon(dependency.type)}
                      <span className="font-bold text-lg text-black dark:text-white">
                        {getDependencyTypeLabel(dependency.type)}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm text-black dark:text-white mb-1 font-semibold">
                        {getDependencyDescription(dependency.type, dependency.cardTitle)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-black dark:text-white">
                        <span className="bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded font-semibold text-black dark:text-white">
                          {dependency.boardTitle !== card.boardId && `${dependency.boardTitle} • `}
                          {dependency.listTitle}
                        </span>
                      </div>
                    </div>
                    
                    {dependency.reason && (
                      <div className="mb-2 p-2 bg-white dark:bg-gray-600 rounded border text-sm">
                        <span className="font-bold text-black dark:text-white">Reason: </span>
                        <span className="text-black dark:text-white font-medium">{dependency.reason}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-black dark:text-white">
                      <span className="font-semibold">
                        Added {(() => {
                          try {
                            if (!dependency.createdAt) return 'Unknown date';
                            const date = dependency.createdAt instanceof Date 
                              ? dependency.createdAt 
                              : new Date(dependency.createdAt);
                            
                            if (isNaN(date.getTime())) return 'Invalid date';
                            return date.toLocaleDateString();
                          } catch (error) {
                            console.error('Error formatting dependency date:', error);
                            return 'Invalid date';
                          }
                        })()}
                      </span>
                      <button className="flex items-center gap-1 hover:text-blue-700 transition-colors font-semibold underline">
                        <ExternalLink size={12} />
                        View Card
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveDependency(dependency)}
                    disabled={loading}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/50 transition-all disabled:opacity-50"
                    title="Remove dependency"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Dependency Modal */}
      <AnimatePresence>
        {showAddDependency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddDependency(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Add Dependency
                  </h3>
                  <button
                    onClick={() => setShowAddDependency(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Dependency Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relationship Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="blocks">🔴 This card blocks (prevents another card from starting)</option>
                    <option value="blocked_by">🟡 This card is blocked by (can't start until another is done)</option>
                    <option value="related">🔵 This card is related to (general connection)</option>
                  </select>
                </div>

                {/* Search Cards */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Card
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Cards List */}
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                    {filteredCards.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No cards found
                      </div>
                    ) : (
                      filteredCards.map((availableCard) => (
                        <button
                          key={availableCard.id}
                          onClick={() => handleAddDependency(availableCard.id)}
                          disabled={loading}
                          className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 
                                   border-b border-gray-200 dark:border-gray-600 last:border-b-0
                                   disabled:opacity-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {availableCard.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {availableCard.description?.substring(0, 100)}
                            {availableCard.description && availableCard.description.length > 100 && '...'}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why does this dependency exist?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddDependency(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                             transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading || !searchQuery}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Adding...' : 'Add Dependency'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 