'use client';

import React, { useState } from 'react';
import { Card } from '@/types';
import { MessageSquare, Paperclip, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardDependencyIndicator } from '@/components/cards/CardDependencyIndicator';
import { CardVotingIndicator } from '@/components/cards/CardVotingIndicator';
import { CardVideoIndicator } from '@/components/cards/CardVideoIndicator';

interface CardItemProps {
  card: Card;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onDeleteCard: () => void;
  onCardClick: (card: Card) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onUpdateCard, onDeleteCard, onCardClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [showActions, setShowActions] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdateTitle = () => {
    if (title.trim() && title !== card.title) {
      onUpdateCard(card.id, { title: title.trim() });
    } else {
      setTitle(card.title);
    }
    setIsEditing(false);
  };

  // Due date logic
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const isDueSoon = card.dueDate && !isOverdue && 
    new Date(card.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000); // Due within 24 hours

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays <= 7) {
      return `${diffDays} days`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(dueDate);
    }
  };

  const getDueDateStyle = () => {
    if (isOverdue) {
      return 'bg-red-100 text-red-700 border border-red-200';
    } else if (isDueSoon) {
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow relative group ${
        isOverdue ? 'border-l-4 border-red-500' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={(e) => {
        e.stopPropagation();
        console.log('Card container clicked:', card.title);
        onCardClick(card);
      }}
    >
      {/* Card Cover */}
      {card.cover && (
        <div className="mb-3 -mx-3 -mt-3">
          {card.cover.startsWith('#') ? (
            // Color cover
            <div
              className="h-8 rounded-t-lg"
              style={{ backgroundColor: card.cover }}
            />
          ) : (
            // Image cover
            <img
              src={card.cover}
              alt="Card cover"
              className="w-full h-20 object-cover rounded-t-lg"
            />
          )}
        </div>
      )}

      {/* Drag handle - small area in top-right */}
      <div
        {...listeners}
        className="absolute top-2 right-6 w-6 h-6 cursor-move opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity z-10"
        style={{
          background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Drag handle clicked - preventing card click');
        }}
      />

      {isEditing ? (
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleUpdateTitle}
          onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
          className="w-full resize-none border-none outline-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="cursor-pointer">
          <h4 className="text-sm text-gray-800">{card.title}</h4>
        </div>
      )}

      {/* Card badges */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {card.dueDate && (
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getDueDateStyle()}`}>
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
            <Clock className="h-3 w-3" />
            {formatDueDate(card.dueDate)}
          </span>
        )}

        {/* Checklist Progress */}
        {card.checklists && card.checklists.length > 0 && (
          (() => {
            const totalItems = card.checklists.reduce((sum, checklist) => sum + (checklist.items || []).length, 0);
            const completedItems = card.checklists.reduce(
              (sum, checklist) => sum + (checklist.items || []).filter(item => item.completed).length, 
              0
            );
            
            if (totalItems > 0) {
              return (
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  completedItems === totalItems 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  ☑️ {completedItems}/{totalItems}
                </span>
              );
            }
            return null;
          })()
        )}
        
        {card.description && (
          <span className="text-gray-500">
            <MessageSquare className="h-3 w-3" />
          </span>
        )}

        {/* Comments Count */}
        {card.comments && card.comments.length > 0 && (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {card.comments.length}
          </span>
        )}
        
        {card.attachments && card.attachments.length > 0 && (
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            {card.attachments.length} file{card.attachments.length !== 1 ? 's' : ''}
          </span>
        )}

        {/* Dependencies */}
        <CardDependencyIndicator card={card} size="sm" />

        {/* Voting Indicators */}
        <CardVotingIndicator card={card} className="flex-wrap" />

        {/* Video Call Indicator */}
        <CardVideoIndicator videoLinks={card.videoLinks} />
      </div>

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
              title={label.name}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Delete button */}
      {showActions && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCard();
          }}
          className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3 w-3 text-gray-600" />
        </button>
      )}
    </div>
  );
}; 