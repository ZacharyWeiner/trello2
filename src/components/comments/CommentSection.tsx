'use client';

import React, { useState } from 'react';
import { Comment, BoardMember } from '@/types';
import { MessageSquare, Send, Edit2, Trash2, User } from 'lucide-react';
import { MentionInput } from '@/components/mentions/MentionInput';
import { MentionDisplay } from '@/components/mentions/MentionDisplay';
import { NotificationService } from '@/services/notificationService';
import { useAuthContext } from '@/contexts/AuthContext';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId: string;
  onCommentsChange: (comments: Comment[]) => void;
  boardMembers: BoardMember[];
  cardId: string;
  cardTitle: string;
  boardId: string;
  boardTitle: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  currentUserId,
  onCommentsChange,
  boardMembers,
  cardId,
  cardTitle,
  boardId,
  boardTitle,
}) => {
  const { user } = useAuthContext();
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentMentions, setNewCommentMentions] = useState<string[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingMentions, setEditingMentions] = useState<string[]>([]);

  const addComment = async () => {
    if (newCommentText.trim()) {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        text: newCommentText.trim(),
        createdBy: currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        mentions: newCommentMentions.length > 0 ? newCommentMentions : undefined,
      };
      
      onCommentsChange([...comments, newComment]);
      
      // Send mention notifications
      if (newCommentMentions.length > 0 && user) {
        try {
          await NotificationService.createMentionNotifications(
            newCommentMentions,
            currentUserId,
            user.displayName || user.email || 'Someone',
            cardId,
            cardTitle,
            boardId,
            boardTitle,
            newCommentText.trim(),
            boardMembers
          );
        } catch (error) {
          console.error('Error sending mention notifications:', error);
        }
      }
      
      setNewCommentText('');
      setNewCommentMentions([]);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setEditingMentions(comment.mentions || []);
  };

  const saveEdit = async () => {
    if (editingText.trim() && editingCommentId) {
      const originalComment = comments.find(c => c.id === editingCommentId);
      const updatedComments = comments.map(comment => {
        if (comment.id === editingCommentId) {
          return {
            ...comment,
            text: editingText.trim(),
            updatedAt: new Date(),
            mentions: editingMentions.length > 0 ? editingMentions : undefined,
          };
        }
        return comment;
      });
      
      onCommentsChange(updatedComments);
      
      // Send notifications for new mentions (mentions that weren't in the original comment)
      if (originalComment && user) {
        const originalMentions = originalComment.mentions || [];
        const newMentions = editingMentions.filter(mention => !originalMentions.includes(mention));
        
        if (newMentions.length > 0) {
          try {
            await NotificationService.createMentionNotifications(
              newMentions,
              currentUserId,
              user.displayName || user.email || 'Someone',
              cardId,
              cardTitle,
              boardId,
              boardTitle,
              editingText.trim(),
              boardMembers
            );
          } catch (error) {
            console.error('Error sending mention notifications:', error);
          }
        }
      }
      
      setEditingCommentId(null);
      setEditingText('');
      setEditingMentions([]);
    }
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
    setEditingMentions([]);
  };

  const deleteComment = (commentId: string) => {
    onCommentsChange(comments.filter(comment => comment.id !== commentId));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffTime = now.getTime() - commentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      }).format(commentDate);
    }
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 flex items-center gap-2" style={{ color: '#000000' }}>
        <MessageSquare className="h-4 w-4" />
        Activity ({comments.length})
      </h4>

      {/* Add New Comment */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <MentionInput
              value={newCommentText}
              onChange={(text, mentions) => {
                setNewCommentText(text);
                setNewCommentMentions(mentions);
              }}
              placeholder="Write a comment... Use @ to mention someone"
              boardMembers={boardMembers}
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={addComment}
                disabled={!newCommentText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                <Send className="h-4 w-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Comments */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900" style={{ color: '#000000' }}>
                  User {comment.createdBy.slice(-4)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt && comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
                    <span className="ml-1">(edited)</span>
                  )}
                </span>
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <MentionInput
                    value={editingText}
                    onChange={(text, mentions) => {
                      setEditingText(text);
                      setEditingMentions(mentions);
                    }}
                    placeholder="Edit your comment..."
                    boardMembers={boardMembers}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={!editingText.trim()}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <MentionDisplay
                    text={comment.text}
                    boardMembers={boardMembers}
                    className="text-sm text-gray-900"
                  />
                </div>
              )}

              {/* Comment Actions */}
              {comment.createdBy === currentUserId && editingCommentId !== comment.id && (
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(comment)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No comments yet. Be the first to add one!</p>
        </div>
      )}
    </div>
  );
}; 