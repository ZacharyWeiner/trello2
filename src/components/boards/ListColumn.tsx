'use client';

import React, { useState } from 'react';
import { List, Card } from '@/types';
import { MoreHorizontal, Plus, X, Sparkles } from 'lucide-react';
import { CardItem } from './CardItem';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { createCard } from '@/services/boardService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface ListColumnProps {
  list: List;
  cards: Card[];
  onAddCard: (listId: string, title: string) => void;
  onUpdateList: (listId: string, updates: Partial<List>) => void;
  onDeleteList: (listId: string) => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onDeleteCard: (cardId: string, listId: string) => void;
  onCardClick: (card: Card) => void;
  boardId: string;
}

export const ListColumn: React.FC<ListColumnProps> = ({
  list,
  cards,
  onAddCard,
  onUpdateList,
  onDeleteList,
  onUpdateCard,
  onDeleteCard,
  onCardClick,
  boardId,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: list.id,
    data: {
      type: 'container',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleApplyTemplate = async (templateData: any) => {
    try {
      const cardId = await createCard({
        ...templateData,
        listId: list.id,
        boardId,
        position: cards.length,
      });
      
      // Trigger a refresh by calling onAddCard with empty title
      // This will cause the parent to reload the cards
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error creating card from template:', error);
    }
  };

  const handleUpdateTitle = () => {
    if (listTitle.trim() && listTitle !== list.title) {
      onUpdateList(list.id, { title: listTitle.trim() });
    } else {
      setListTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="ds-card rounded-lg p-3 w-72 flex-shrink-0"
      >
        <div className="flex items-center justify-between mb-3" {...attributes} {...listeners}>
          {isEditingTitle ? (
            <input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
              className="ds-input font-semibold px-2 py-1 rounded outline-none flex-1"
              autoFocus
            />
          ) : (
            <h3
              className="font-semibold cursor-pointer flex-1"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h3>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="ds-button-ghost p-1 rounded"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <button
                  onClick={() => {
                    onDeleteList(list.id);
                    setShowMenu(false);
                  }}
                  className="ds-menu-item block w-full text-left px-4 py-2 text-sm text-red-600"
                >
                  Delete list
                </button>
              </div>
            )}
          </div>
        </div>

        <SortableContext 
          items={cards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mb-2 min-h-[100px]">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onUpdateCard={onUpdateCard}
                onDeleteCard={() => onDeleteCard(card.id, list.id)}
                onCardClick={onCardClick}
              />
            ))}
          </div>
        </SortableContext>

        {isAddingCard ? (
          <form onSubmit={handleAddCard} className="mb-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="w-full p-2 rounded border border-gray-300 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex items-center mt-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              >
                Add card
              </button>
              <button
                type="button"
                onClick={() => setShowTemplateSelector(true)}
                className="ml-2 bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 text-sm flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Template
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="ml-2 p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setIsAddingCard(true)}
              className="w-full text-left p-2 hover:bg-gray-200 rounded flex items-center text-gray-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add a card
            </button>
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="w-full text-left p-2 hover:bg-purple-100 rounded flex items-center text-purple-600"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Create from template
            </button>
          </div>
        )}
      </div>

      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onApplyTemplate={handleApplyTemplate}
        listId={list.id}
        boardId={boardId}
        position={cards.length}
      />
    </>
  );
}; 