'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Board, List, Card, Label, UserPresence, CardActivity } from '@/types';
import { 
  getBoard, 
  getBoardLists, 
  getListCards,
  createList,
  createCard,
  updateList,
  updateCard,
  deleteList,
  deleteCard,
  moveCard,
  updateBoard,
  subscribeToBoardUpdates,
  subscribeToListsUpdates,
  subscribeToCardsUpdates
} from '@/services/boardService';
import { 
  updateUserPresence, 
  removeUserPresence, 
  subscribeToPresence,
  startPresenceHeartbeat
} from '@/services/presenceService';
import { executeAutomationRules } from '@/services/automationService';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';
import { BoardHeader } from '@/components/boards/BoardHeader';
import { ListColumn } from '@/components/boards/ListColumn';
import { AddListButton } from '@/components/boards/AddListButton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CardDetailsModal } from '@/components/cards/CardDetailsModal';
import { ArchiveManager } from '@/components/cards/ArchiveManager';
import { TeamRaceWidget } from '@/components/boards/TeamRaceWidget';
import { ThermometerWidget } from '@/components/boards/ThermometerWidget';
import { BurndownWidget } from '@/components/boards/BurndownWidget';
import { PizzaWidget } from '@/components/boards/PizzaWidget';
import { PresenceIndicator, RealtimeCursor } from '@/components/realtime/PresenceIndicator';
import { MobileBoardView } from '@/components/mobile/MobileBoardView';
import { MobileLayout, useResponsive } from '@/components/mobile/MobileLayout';
import { CelebrationSystem } from '@/components/celebrations/CelebrationSystem';
import { StoryModeNarrative } from '@/components/progress/StoryModeNarrative';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function BoardPage() {
  const { user } = useAuthContext();
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Record<string, Card[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [showTeamRace, setShowTeamRace] = useState(false);
  const [showThermometer, setShowThermometer] = useState(false);
  const [showBurndown, setShowBurndown] = useState(false);
  const [showPizza, setShowPizza] = useState(false);
  const [showStoryMode, setShowStoryMode] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showAutomationManager, setShowAutomationManager] = useState(false);
  const [showBoardSettings, setShowBoardSettings] = useState(false);
  const [showDependencyGraph, setShowDependencyGraph] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Real-time collaboration state
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [cursors, setCursors] = useState<UserPresence[]>([]);
  const [cardActivities, setCardActivities] = useState<CardActivity[]>([]);
  
  // Store card listener cleanup functions
  const cardListenerCleanups = useRef<Record<string, () => void>>({});

  // Responsive hook for mobile detection
  const { isMobile, isTablet, isHydrated, screenSize } = useResponsive();
  
  // Additional mobile detection for hydration issues
  const [forceMobile, setForceMobile] = useState(false);
  
  useEffect(() => {
    // Force mobile detection on client side
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileDevice = width <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      setForceMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Use either responsive hook or forced mobile detection
  const shouldUseMobileLayout = isMobile || isTablet || forceMobile;
  


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useKeyboardShortcuts();

  useEffect(() => {
    if (!user || !boardId) return;

    loadBoardData();
    const cleanup = setupRealtimeListeners();

    return cleanup;
  }, [user, boardId]);

  const setupRealtimeListeners = () => {
    if (!user) return;

    console.log('🔄 Setting up real-time listeners for board:', boardId);

    // Start presence tracking
    updateUserPresence(boardId);
    const stopHeartbeat = startPresenceHeartbeat(boardId);

    // Subscribe to presence updates
    const unsubscribePresence = subscribeToPresence(boardId, (users) => {
      console.log('👥 Presence update:', users.length, 'users online');
      setOnlineUsers(users);
      setCursors(users.filter(u => u.cursor));
    });

    // Subscribe to board updates
    const unsubscribeBoard = subscribeToBoardUpdates(boardId, (boardData) => {
      console.log('📋 Board data received:', boardData);
      setBoard(boardData);
      setLoading(false);
    });

    // Subscribe to lists updates
    const unsubscribeLists = subscribeToListsUpdates(boardId, (listsData) => {
      console.log('📝 Lists data received:', listsData.length, 'lists');
      setLists(listsData);
      
      // Set up card listeners for each list
      setupCardListeners(listsData);
    });

    // Return cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time listeners');
      stopHeartbeat();
      unsubscribePresence();
      unsubscribeBoard();
      unsubscribeLists();
      cleanupAllCardListeners();
    };
  };

  // Clean up all card listeners
  const cleanupAllCardListeners = () => {
    console.log('🧹 Cleaning up all card listeners');
    Object.values(cardListenerCleanups.current).forEach(cleanup => cleanup());
    cardListenerCleanups.current = {};
  };

  // Set up card listeners for all lists
  const setupCardListeners = (listsToWatch: List[]) => {
    console.log('🃏 Setting up card listeners for', listsToWatch.length, 'lists');
    
    // Clean up existing listeners first
    cleanupAllCardListeners();
    
    listsToWatch.forEach(list => {
      const unsubscribeCards = subscribeToCardsUpdates(list.id, (updatedCards) => {
        console.log(`🃏 Cards received for list "${list.title}" (${list.id}):`, updatedCards.length, 'cards');
        updatedCards.forEach(card => {
          console.log(`  - Card: "${card.title}" (archived: ${card.archived || 'undefined'})`);
        });
        setCards(prev => ({
          ...prev,
          [list.id]: updatedCards
        }));
        
        // Update selectedCard if it's one of the updated cards
        setSelectedCard(prevSelected => {
          if (!prevSelected) return null;
          const updatedCard = updatedCards.find(card => card.id === prevSelected.id);
          if (updatedCard) {
            console.log('🔄 Updating selected card with real-time data:', updatedCard.title);
            return updatedCard;
          }
          return prevSelected;
        });
      });
      
      // Store the cleanup function
      cardListenerCleanups.current[list.id] = unsubscribeCards;
    });
  };

  // Track mouse movement for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (user) {
        updateUserPresence(boardId, undefined, { x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [boardId, user]);

  const loadBoardData = async () => {
    try {
      const [boardData, listsData] = await Promise.all([
        getBoard(boardId),
        getBoardLists(boardId),
      ]);

      if (boardData) {
        setBoard(boardData);
        setLists(listsData);
        
        // Load board-level labels
        setAvailableLabels(boardData.labels || []);

        // Load cards for each list
        const cardsData: Record<string, Card[]> = {};
        for (const list of listsData) {
          const listCards = await getListCards(list.id);
          cardsData[list.id] = listCards;
        }
        setCards(cardsData);
      }
    } catch (error) {
      console.error('Error loading board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async (title: string) => {
    if (!user) return;

    try {
      const position = lists.length;
      const listId = await createList({
        boardId,
        title,
        position,
      });

      // Reload lists
      const updatedLists = await getBoardLists(boardId);
      setLists(updatedLists);
      setCards({ ...cards, [listId]: [] });
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    if (!user) return;

    try {
      const listCards = cards[listId] || [];
      const position = listCards.length;
      
      const cardId = await createCard({
        boardId,
        listId,
        title,
        position,
        createdBy: user.uid,
      });

      // Reload cards for this list
      const updatedCards = await getListCards(listId);
      setCards({ ...cards, [listId]: updatedCards });

      // Execute automation rules for card creation
      if (board) {
        const newCard = updatedCards.find(card => card.id === cardId);
        if (newCard) {
          await executeAutomationRules(newCard, 'card_created', {
            board,
            lists,
          });
        }
      }
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleUpdateList = async (listId: string, updates: Partial<List>) => {
    try {
      await updateList(listId, updates);
      setLists(lists.map(list => 
        list.id === listId ? { ...list, ...updates } : list
      ));
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteList(listId);
      setLists(lists.filter(list => list.id !== listId));
      const newCards = { ...cards };
      delete newCards[listId];
      setCards(newCards);
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleUpdateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      console.log('🔄 Updating card:', cardId, 'with updates:', updates);
      
      // Special logging for checklist updates
      if (updates.checklists) {
        console.log('📋 Checklist update detected:', updates.checklists.length, 'checklists');
        updates.checklists.forEach((checklist, index) => {
          console.log(`  Checklist ${index + 1}: "${checklist.title}" - ${(checklist.items || []).length} items, ${(checklist.items || []).filter(i => i.completed).length} completed`);
        });
      }
      
      await updateCard(cardId, updates);
      console.log('✅ Card update saved to Firebase');
      
      // Find and update the card in the appropriate list
      const newCards = { ...cards };
      for (const listId in newCards) {
        const cardIndex = newCards[listId].findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          newCards[listId][cardIndex] = { ...newCards[listId][cardIndex], ...updates };
          console.log('✅ Updated card in local state:', newCards[listId][cardIndex].title);
          break;
        }
      }
      setCards(newCards);
      
      // Also update the selectedCard if it's the one being edited
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard({ ...selectedCard, ...updates });
        console.log('✅ Updated selected card in modal');
      }
    } catch (error) {
      console.error('❌ Error updating card:', error);
    }
  };

  const handleDeleteCard = async (cardId: string, listId: string) => {
    try {
      await deleteCard(cardId);
      setCards({
        ...cards,
        [listId]: cards[listId].filter(card => card.id !== cardId),
      });
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleCardClick = (card: Card) => {
    console.log('Card clicked:', card.title, card);
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleCreateLabel = async (name: string, color: string) => {
    const newLabel: Label = {
      id: Date.now().toString(),
      name,
      color,
    };
    
    const updatedLabels = [...availableLabels, newLabel];
    setAvailableLabels(updatedLabels);
    
    // Save the new label to the board in Firebase
    try {
      await updateBoard(boardId, { labels: updatedLabels });
      console.log('✅ Label saved to board:', newLabel);
    } catch (error) {
      console.error('❌ Error saving label to board:', error);
      // Revert the local state if saving failed
      setAvailableLabels(availableLabels);
    }
  };

  const handleBoardUpdate = (updatedBoard: Board) => {
    setBoard(updatedBoard);
  };

  const handleBoardDelete = () => {
    // Navigate back to boards page after deletion
    router.push('/boards');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're moving a card
    let sourceListId: string | null = null;
    let draggedCard: Card | null = null;
    
    for (const listId in cards) {
      const card = cards[listId].find(c => c.id === activeId);
      if (card) {
        sourceListId = listId;
        draggedCard = card;
        break;
      }
    }

    if (draggedCard && sourceListId) {
      // This is a card being moved
      let targetListId: string | null = null;
      
      // Check if dropping on a list
      if (lists.some(list => list.id === overId)) {
        targetListId = overId;
      } else {
        // Check if dropping on another card - find which list it belongs to
        for (const listId in cards) {
          if (cards[listId].some(card => card.id === overId)) {
            targetListId = listId;
            break;
          }
        }
      }

      if (targetListId && targetListId !== sourceListId) {
        // Move card between lists
        const newCards = { ...cards };
        newCards[sourceListId] = newCards[sourceListId].filter(c => c.id !== activeId);
        newCards[targetListId] = [...(newCards[targetListId] || []), draggedCard];
        setCards(newCards);

        try {
          await moveCard(activeId, targetListId, newCards[targetListId].length - 1);
        } catch (error) {
          console.error('Error moving card:', error);
          loadBoardData();
        }
      }
    } else {
      // This might be a list being reordered
      const activeIndex = lists.findIndex(list => list.id === activeId);
      const overIndex = lists.findIndex(list => list.id === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newLists = [...lists];
        const [movedList] = newLists.splice(activeIndex, 1);
        newLists.splice(overIndex, 0, movedList);
        setLists(newLists);

        // Update list positions in Firebase
        try {
          for (let i = 0; i < newLists.length; i++) {
            await updateList(newLists[i].id, { position: i });
          }
        } catch (error) {
          console.error('Error reordering lists:', error);
          loadBoardData();
        }
      }
    }

    setActiveId(null);
  };

  // Helper function to convert cards object to flat array for mobile view
  const getAllCards = (): Card[] => {
    return Object.values(cards).flat();
  };

  // Mobile-specific handlers
  const handleMobileCardMove = (cardId: string, newListId: string, newPosition: number) => {
    moveCard(cardId, newListId, newPosition);
  };

  const handleMobileListMove = (listId: string, newPosition: number) => {
    // Implement list reordering for mobile
    const newLists = [...lists];
    const listIndex = newLists.findIndex(l => l.id === listId);
    if (listIndex !== -1) {
      const [movedList] = newLists.splice(listIndex, 1);
      newLists.splice(newPosition, 0, movedList);
      setLists(newLists);
      
      // Update positions in Firebase
      newLists.forEach((list, index) => {
        updateList(list.id, { position: index });
      });
    }
  };

  const handleMobileCardEdit = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleMobileCardDelete = (cardId: string) => {
    const card = getAllCards().find(c => c.id === cardId);
    if (card) {
      handleDeleteCard(cardId, card.listId);
    }
  };

  const handleMobileCardArchive = async (cardId: string) => {
    if (!user) return;
    
    try {
      const { CardArchiveService } = await import('@/services/cardArchiveService');
      await CardArchiveService.archiveCard(cardId, user.uid);
    } catch (error) {
      console.error('Error archiving card:', error);
      alert('Failed to archive card');
    }
  };

  const handleMobileListEdit = (list: List) => {
    // Implement list editing for mobile
    console.log('Edit list:', list);
  };

  const handleMobileListArchive = (listId: string) => {
    handleDeleteList(listId);
  };

  const handleMobileAddCard = (listId: string) => {
    // For mobile, we'll need to show a modal or inline form
    const title = prompt('Enter card title:');
    if (title) {
      handleAddCard(listId, title);
    }
  };

  const handleMobileAddList = () => {
    const title = prompt('Enter list title:');
    if (title) {
      handleAddList(title);
    }
  };

  const refreshBoardData = () => {
    // The real-time listeners will automatically update the data
    // This function is mainly for triggering re-renders after archive operations
    console.log('🔄 Refreshing board data after archive operation');
  };

  const handleShowArchive = () => {
    setShowArchiveManager(true);
  };

  const handleCloseArchive = () => {
    setShowArchiveManager(false);
  };

  const handleShowTeamRace = () => {
    setShowTeamRace(true);
  };

  const handleCloseTeamRace = () => {
    setShowTeamRace(false);
  };

  const handleShowThermometer = () => {
    setShowThermometer(true);
  };

  const handleCloseThermometer = () => {
    setShowThermometer(false);
  };

  const handleShowBurndown = () => {
    setShowBurndown(true);
  };

  const handleCloseBurndown = () => {
    setShowBurndown(false);
  };

  const handleShowPizza = () => {
    setShowPizza(true);
  };

  const handleClosePizza = () => {
    setShowPizza(false);
  };

  const handleShowStoryMode = () => {
    setShowStoryMode(true);
  };

  const handleCloseStoryMode = () => {
    setShowStoryMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Board Not Found</h1>
          <p className="text-gray-600 mb-4">
            The board you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/boards'}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Boards
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }



  // Render mobile view for mobile devices
  if (shouldUseMobileLayout) {
    return (
      <ProtectedRoute>

        
        <MobileLayout 
          showBottomNav={true}
          currentPath={`/boards/${boardId}`}
          onCreateBoard={() => router.push('/boards')}
          onSearch={() => router.push('/search')}
          onNotifications={() => router.push('/notifications')}
          onProfile={() => router.push('/profile')}
        >
          <MobileBoardView
            board={board}
            lists={lists}
            cards={getAllCards()}
            onCardMove={handleMobileCardMove}
            onListMove={handleMobileListMove}
            onCardEdit={handleMobileCardEdit}
            onCardDelete={handleMobileCardDelete}
            onCardArchive={handleMobileCardArchive}
            onListEdit={handleMobileListEdit}
            onListArchive={handleMobileListArchive}
            onAddCard={handleMobileAddCard}
            onAddList={handleMobileAddList}
            currentUserId={user?.uid || ''}
            onBoardUpdate={handleBoardUpdate}
            onBoardDelete={handleBoardDelete}
            onShowArchive={handleShowArchive}
            onShowTeamRace={handleShowTeamRace}
            onShowThermometer={handleShowThermometer}
            onShowBurndown={handleShowBurndown}
            onShowPizza={handleShowPizza}
            onShowStoryMode={handleShowStoryMode}
            onShowMemberManager={() => setShowMemberManager(true)}
            onShowAutomationManager={() => setShowAutomationManager(true)}
            onShowBoardSettings={() => setShowBoardSettings(true)}
            onShowDependencyGraph={() => setShowDependencyGraph(true)}
            onShowThemeSwitcher={() => setShowThemeSwitcher(true)}
            onlineUsers={onlineUsers}
            availableLabels={availableLabels}
            onCreateLabel={handleCreateLabel}
          />
        </MobileLayout>
        
        {/* Card Details Modal */}
        {selectedCard && (
          <CardDetailsModal
            card={selectedCard}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onUpdateCard={handleUpdateCard}
            onCreateLabel={handleCreateLabel}
            availableLabels={availableLabels}
            currentUserId={user?.uid || ''}
            boardMembers={board.members}
            boardTitle={board.title}
          />
        )}

        {/* Archive Manager */}
        <ArchiveManager
          boardId={boardId}
          lists={lists}
          isOpen={showArchiveManager}
          onClose={handleCloseArchive}
          onCardUpdate={refreshBoardData}
        />

        {/* Team Race Widget */}
        <TeamRaceWidget
          board={board}
          lists={lists}
          cards={getAllCards().reduce((acc, card) => {
            if (!acc[card.listId]) acc[card.listId] = [];
            acc[card.listId].push(card);
            return acc;
          }, {} as Record<string, Card[]>)}
          isOpen={showTeamRace}
          onClose={handleCloseTeamRace}
        />

        {/* Thermometer Widget */}
        <ThermometerWidget
          board={board}
          lists={lists}
          cards={getAllCards().reduce((acc, card) => {
            if (!acc[card.listId]) acc[card.listId] = [];
            acc[card.listId].push(card);
            return acc;
          }, {} as Record<string, Card[]>)}
          isOpen={showThermometer}
          onClose={handleCloseThermometer}
        />

        {/* Burndown Widget */}
        <BurndownWidget
          board={board}
          lists={lists}
          cards={getAllCards().reduce((acc, card) => {
            if (!acc[card.listId]) acc[card.listId] = [];
            acc[card.listId].push(card);
            return acc;
          }, {} as Record<string, Card[]>)}
          isOpen={showBurndown}
          onClose={handleCloseBurndown}
        />

        {/* Pizza Widget */}
        <PizzaWidget
          board={board}
          lists={lists}
          cards={getAllCards().reduce((acc, card) => {
            if (!acc[card.listId]) acc[card.listId] = [];
            acc[card.listId].push(card);
            return acc;
          }, {} as Record<string, Card[]>)}
          isOpen={showPizza}
          onClose={handleClosePizza}
        />

        {/* Story Mode Modal */}
        {showStoryMode && board && lists.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
              {/* Story Mode Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8" />
                    <div>
                      <h2 className="text-2xl font-bold">🎭 Story Mode: {board.title}</h2>
                      <p className="text-purple-100">Experience your project as an epic narrative adventure</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseStoryMode}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Story Mode Content */}
              <div className="p-0 overflow-hidden">
                <StoryModeNarrative
                  board={board}
                  lists={lists}
                  cards={getAllCards()}
                  userId={user?.uid || ''}
                  isActive={showStoryMode}
                  onClose={handleCloseStoryMode}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile-specific modals will be handled by the desktop components when they open */}

        {/* Celebration System */}
        <CelebrationSystem />


      </ProtectedRoute>
    );
  }

  // Render desktop view for larger screens
  return (
    <ProtectedRoute>

      
      <div 
        className="h-screen flex flex-col relative"
        style={{ 
          background: 'var(--gradient-primary)'
        }}
      >
        <BoardHeader 
          board={board} 
          currentUserId={user?.uid || ''} 
          onBoardUpdate={handleBoardUpdate}
          onBoardDelete={handleBoardDelete}
          lists={lists}
          cards={cards}
          onShowArchive={handleShowArchive}
          onShowTeamRace={handleShowTeamRace}
          onShowThermometer={handleShowThermometer}
          onShowBurndown={handleShowBurndown}
          onShowPizza={handleShowPizza}
          onShowStoryMode={handleShowStoryMode}
        />
        
        {/* Presence Indicator */}
        <div 
          className="px-4 py-2"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        >
          <PresenceIndicator 
            users={onlineUsers}
            currentUserId={user?.uid || ''}
            className="justify-end"
          />
        </div>
        
        <div className="flex-1 overflow-x-auto relative">
          {/* Real-time Cursors */}
          {cursors.map((user) => (
            <RealtimeCursor 
              key={user.userId} 
              user={user}
            />
          ))}
          
          <div className="p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex space-x-4">
                <SortableContext
                  items={lists.map(list => list.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {lists.map((list) => (
                    <ListColumn
                      key={list.id}
                      list={list}
                      cards={cards[list.id] || []}
                      onAddCard={handleAddCard}
                      onUpdateList={handleUpdateList}
                      onDeleteList={handleDeleteList}
                      onUpdateCard={handleUpdateCard}
                      onDeleteCard={handleDeleteCard}
                      onCardClick={handleCardClick}
                      boardId={boardId}
                    />
                  ))}
                </SortableContext>
                
                <AddListButton onAddList={handleAddList} />
              </div>
              
              <DragOverlay>
                {activeId ? (
                  <div className="bg-white p-2 rounded shadow-lg opacity-80">
                    Dragging card...
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
        
        {/* Real-time Update Indicator */}
        <div className="absolute top-20 right-4 z-40">
          {onlineUsers.length > 0 && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
              🔴 Live
            </div>
          )}
        </div>
        
        {/* Debug Panel */}
        <div className="absolute bottom-4 right-4 z-40 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h4 className="text-sm font-bold mb-2">Real-time Debug</h4>
          <div className="text-xs space-y-1">
            <div>Online Users: {onlineUsers.length}</div>
            <div>Lists: {lists.length}</div>
            <div>Total Cards: {Object.values(cards).flat().length}</div>
            <button
              onClick={() => {
                console.log('🧪 Manual presence update');
                updateUserPresence(boardId);
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-2"
            >
              Test Presence
            </button>
            <button
              onClick={() => {
                console.log('🧪 Current state:', { board, lists, cards, onlineUsers });
              }}
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs mt-1 ml-1"
            >
              Log State
            </button>
          </div>
        </div>
      </div>
      
      {/* Card Details Modal */}
      {selectedCard && (
        <CardDetailsModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateCard={handleUpdateCard}
          onCreateLabel={handleCreateLabel}
          availableLabels={availableLabels}
          currentUserId={user?.uid || ''}
          boardMembers={board.members}
          boardTitle={board.title}
        />
      )}

      {/* Archive Manager */}
      <ArchiveManager
        boardId={boardId}
        lists={lists}
        isOpen={showArchiveManager}
        onClose={handleCloseArchive}
        onCardUpdate={refreshBoardData}
      />

      {/* Team Race Widget */}
      <TeamRaceWidget
        board={board}
        lists={lists}
        cards={cards}
        isOpen={showTeamRace}
        onClose={handleCloseTeamRace}
      />

      {/* Thermometer Widget */}
      <ThermometerWidget
        board={board}
        lists={lists}
        cards={cards}
        isOpen={showThermometer}
        onClose={handleCloseThermometer}
      />

      {/* Burndown Widget */}
      <BurndownWidget
        board={board}
        lists={lists}
        cards={cards}
        isOpen={showBurndown}
        onClose={handleCloseBurndown}
      />

      {/* Pizza Widget */}
      <PizzaWidget
        board={board}
        lists={lists}
        cards={cards}
        isOpen={showPizza}
        onClose={handleClosePizza}
      />

      {/* Story Mode Modal */}
      {showStoryMode && board && lists.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Story Mode Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">🎭 Story Mode: {board.title}</h2>
                    <p className="text-purple-100">Experience your project as an epic narrative adventure</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseStoryMode}
                  className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Story Mode Content */}
            <div className="p-0 overflow-hidden">
              <StoryModeNarrative
                board={board}
                lists={lists}
                cards={getAllCards()}
                userId={user?.uid || ''}
                isActive={showStoryMode}
                onClose={handleCloseStoryMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Celebration System */}
      <CelebrationSystem />


    </ProtectedRoute>
  );
} 