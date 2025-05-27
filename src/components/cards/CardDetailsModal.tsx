'use client';

import React, { useState, useEffect } from 'react';
import { Card, Label, Checklist, Comment, Attachment, BoardMember } from '@/types';
import { X, Calendar, Tag, MessageSquare, Clock, Archive } from 'lucide-react';
import { LabelSelector } from '@/components/labels/LabelSelector';
import { ChecklistManager } from '@/components/checklists/ChecklistManager';
import { EnhancedCommentSection } from '@/components/comments/EnhancedCommentSection';
import { AttachmentManager } from '@/components/attachments/AttachmentManager';
import { CoverManager } from '@/components/covers/CoverManager';
import { CardActivityIndicator } from '@/components/realtime/PresenceIndicator';
import { CardDependencies } from '@/components/cards/CardDependencies';
import { CardVoting } from '@/components/cards/CardVoting';
import { CardArchiveService } from '@/services/cardArchiveService';
import { updateCardActivity, subscribeToCardActivity } from '@/services/presenceService';
import { VideoCallButton } from '@/components/video/VideoCallButton';
import { VideoCallManager } from '@/components/video/VideoCallManager';

interface CardDetailsModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  currentUserId: string;
  availableLabels: Label[];
  onCreateLabel: (name: string, color: string) => void;
  boardMembers: BoardMember[];
  boardTitle: string;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  currentUserId,
  availableLabels,
  onCreateLabel,
  boardMembers,
  boardTitle,
}) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [cardActivities, setCardActivities] = useState<any[]>([]);
  const [isArchiving, setIsArchiving] = useState(false);

  // Track card viewing activity
  useEffect(() => {
    if (isOpen) {
      updateCardActivity(card.id, 'viewing');
      
      // Subscribe to card activity
      const unsubscribe = subscribeToCardActivity(card.id, (activities) => {
        setCardActivities(activities);
      });
      
      return unsubscribe;
    }
  }, [isOpen, card.id]);

  // Track editing activity
  useEffect(() => {
    if (isEditingTitle) {
      updateCardActivity(card.id, 'editing');
    }
  }, [isEditingTitle, card.id]);

  // Sync state with card prop when card changes
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
    setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
    setIsEditingTitle(false);
  }, [card.id, card.title, card.description, card.dueDate]);

  if (!isOpen) return null;

  const handleSaveTitle = () => {
    if (title.trim() && title !== card.title) {
      onUpdateCard(card.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (description !== card.description) {
      onUpdateCard(card.id, { description: description.trim() });
    }
  };

  const handleSaveDueDate = () => {
    const newDueDate = dueDate ? new Date(dueDate + 'T23:59:59') : undefined;
    onUpdateCard(card.id, { dueDate: newDueDate });
  };

  const handleArchiveCard = async () => {
    if (isArchiving) return;
    
    const confirmed = confirm('Are you sure you want to archive this card? You can restore it later from the archive.');
    if (!confirmed) return;

    setIsArchiving(true);
    try {
      await CardArchiveService.archiveCard(card.id, currentUserId);
      onClose(); // Close modal after archiving
    } catch (error) {
      console.error('Error archiving card:', error);
      alert('Failed to archive card');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleClearDueDate = () => {
    setDueDate('');
    onUpdateCard(card.id, { dueDate: undefined });
  };

  const handleLabelsChange = (labels: Label[]) => {
    console.log('🏷️ Labels changed:', labels);
    onUpdateCard(card.id, { labels });
  };

  const handleChecklistsChange = (checklists: Checklist[]) => {
    console.log('✅ Checklists changed:', checklists.length, 'checklists');
    console.log('📋 Checklist details:', checklists.map(c => ({ 
      id: c.id, 
      title: c.title, 
      items: c.items.length,
      itemsCompleted: c.items.filter(i => i.completed).length 
    })));
    onUpdateCard(card.id, { checklists });
  };

  const handleCommentsChange = (comments: Comment[]) => {
    onUpdateCard(card.id, { comments });
  };

  const handleAttachmentsChange = (attachments: Attachment[]) => {
    onUpdateCard(card.id, { attachments });
  };

  const handleCoverChange = (cover: string | undefined) => {
    onUpdateCard(card.id, { cover });
  };

  const handleSetCoverFromAttachment = (attachment: Attachment) => {
    onUpdateCard(card.id, { cover: attachment.url });
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Unknown date';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', date);
      return 'Invalid date';
    }
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" style={{ color: '#000000' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="text-xl font-semibold w-full border-none outline-none bg-transparent"
                style={{ color: '#000000' }}
                autoFocus
              />
            ) : (
              <h2 
                className="text-xl font-semibold cursor-pointer hover:bg-gray-100 p-1 rounded"
                style={{ color: '#000000' }}
                onClick={() => setIsEditingTitle(true)}
              >
                {card.title}
              </h2>
            )}
            
            {/* Activity Indicator */}
            <CardActivityIndicator 
              activities={cardActivities}
              currentUserId={currentUserId}
              className="mt-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <VideoCallButton 
              card={card}
              boardTitle={boardTitle}
              className="text-sm"
            />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Card Info */}
          <div className="flex items-center gap-4 text-sm" style={{ color: '#000000' }}>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(card.createdAt)}</span>
            </div>
            {card.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`} style={!isOverdue ? { color: '#000000' } : {}}>
                <Clock className="h-4 w-4" />
                <span>Due {formatDate(card.dueDate)}</span>
                {isOverdue && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">OVERDUE</span>}
              </div>
            )}
          </div>

          {/* Due Date Section */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2" style={{ color: '#000000' }}>
              <Clock className="h-5 w-5" />
              Due Date
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={handleSaveDueDate}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  style={{ color: '#000000' }}
                />
                {dueDate && (
                  <button
                    onClick={handleClearDueDate}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              {card.dueDate && (
                <div className={`text-sm p-3 rounded-lg ${
                  isOverdue 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {isOverdue ? 'This card is overdue' : 'Due date is set'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs">
                    {isOverdue 
                      ? `Was due on ${formatDate(card.dueDate)}`
                      : `Due on ${formatDate(card.dueDate)}`
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
              <MessageSquare className="h-5 w-5" />
              Description
            </h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              placeholder="Add a more detailed description..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
              style={{ color: '#000000' }}
              rows={4}
            />
          </div>

          {/* Labels */}
          <LabelSelector
            selectedLabels={card.labels || []}
            availableLabels={availableLabels}
            onLabelsChange={handleLabelsChange}
            onCreateLabel={onCreateLabel}
          />

          {/* Checklists */}
          <ChecklistManager
            checklists={card.checklists || []}
            onChecklistsChange={handleChecklistsChange}
          />

          {/* Comments */}
          <EnhancedCommentSection
            comments={card.comments || []}
            currentUserId={currentUserId}
            onCommentsChange={handleCommentsChange}
            boardMembers={boardMembers}
            cardId={card.id}
            cardTitle={card.title}
            boardId={card.boardId}
            boardTitle={boardTitle}
          />

          {/* Cover */}
          <CoverManager
            currentCover={card.cover}
            attachments={card.attachments || []}
            onCoverChange={handleCoverChange}
          />

          {/* Attachments */}
          <AttachmentManager
            attachments={card.attachments || []}
            cardId={card.id}
            currentUserId={currentUserId}
            onAttachmentsChange={handleAttachmentsChange}
            onSetCover={handleSetCoverFromAttachment}
          />

          {/* Card Dependencies */}
          <CardDependencies
            card={card}
            boardId={card.boardId}
            onCardUpdate={onUpdateCard}
            currentUserId={currentUserId}
          />

          {/* Card Voting */}
          <CardVoting
            card={card}
            currentUserId={currentUserId}
            onCardUpdate={onUpdateCard}
          />

          {/* Video Calls */}
          <VideoCallManager
            card={card}
            onUpdateCard={onUpdateCard}
            currentUserId={currentUserId}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={handleArchiveCard}
              disabled={isArchiving}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Archive size={16} />
              {isArchiving ? 'Archiving...' : 'Archive Card'}
            </button>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 