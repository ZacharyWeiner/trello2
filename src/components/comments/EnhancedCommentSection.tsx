'use client';

import React, { useState, useRef } from 'react';
import { Comment, BoardMember, CommentReaction, VoiceNote } from '@/types';
import { 
  MessageSquare, 
  Send, 
  Edit2, 
  Trash2, 
  User, 
  Smile, 
  Image as ImageIcon, 
  Mic, 
  MoreHorizontal,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MentionInput } from '@/components/mentions/MentionInput';
import { MentionDisplay } from '@/components/mentions/MentionDisplay';
import { EmojiPicker } from '@/components/reactions/EmojiPicker';
import { GifPicker } from '@/components/reactions/GifPicker';
import { VoiceRecorder } from '@/components/reactions/VoiceRecorder';
import { NotificationService } from '@/services/notificationService';
import { useAuthContext } from '@/contexts/AuthContext';

interface EnhancedCommentSectionProps {
  comments: Comment[];
  currentUserId: string;
  onCommentsChange: (comments: Comment[]) => void;
  boardMembers: BoardMember[];
  cardId: string;
  cardTitle: string;
  boardId: string;
  boardTitle: string;
}

export const EnhancedCommentSection: React.FC<EnhancedCommentSectionProps> = ({
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
  
  // Picker states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{ x: number; y: number } | undefined>();
  
  // Voice note playback
  const [playingVoiceNote, setPlayingVoiceNote] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const addComment = async (type: 'text' | 'gif' | 'voice' = 'text', content?: any) => {
    let commentData: Partial<Comment> = {
      id: `comment-${Date.now()}`,
      createdBy: currentUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
      type,
      reactions: []
    };

    if (type === 'text') {
      if (!newCommentText.trim()) return;
      commentData.text = newCommentText.trim();
      commentData.mentions = newCommentMentions.length > 0 ? newCommentMentions : undefined;
    } else if (type === 'gif') {
      commentData.text = ''; // Empty text for GIF comments
      commentData.gifUrl = content;
    } else if (type === 'voice') {
      commentData.text = ''; // Empty text for voice comments
      commentData.voiceNote = content;
    }

    const newComment = commentData as Comment;
    onCommentsChange([...comments, newComment]);
    
    // Send mention notifications for text comments
    if (type === 'text' && newCommentMentions.length > 0 && user) {
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
    
    // Reset form
    setNewCommentText('');
    setNewCommentMentions([]);
  };

  const addReaction = (commentId: string, emoji: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const reactions = comment.reactions || [];
        
        // Check if user already reacted with this emoji
        const existingReaction = reactions.find(r => r.userId === currentUserId && r.emoji === emoji);
        
        if (existingReaction) {
          // Remove reaction
          return {
            ...comment,
            reactions: reactions.filter(r => r.id !== existingReaction.id)
          };
        } else {
          // Add reaction
          const newReaction: CommentReaction = {
            id: `reaction-${Date.now()}`,
            emoji,
            userId: currentUserId,
            userName: user?.displayName || user?.email || 'User',
            userPhoto: user?.photoURL || undefined,
            createdAt: new Date()
          };
          
          return {
            ...comment,
            reactions: [...reactions, newReaction]
          };
        }
      }
      return comment;
    });
    
    onCommentsChange(updatedComments);
  };

  const startEditing = (comment: Comment) => {
    if (comment.type !== 'text') return; // Only allow editing text comments
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setEditingMentions(comment.mentions || []);
  };

  const saveEdit = async () => {
    if (editingText.trim() && editingCommentId) {
      const updatedComments = comments.map(comment => {
        if (comment.id === editingCommentId) {
          return {
            ...comment,
            text: editingText.trim(),
            updatedAt: new Date(),
            mentions: editingMentions.length > 0 ? editingMentions : undefined,
            edited: true
          };
        }
        return comment;
      });
      
      onCommentsChange(updatedComments);
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

  const handleEmojiSelect = (emoji: string) => {
    setNewCommentText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    addComment('gif', gifUrl);
    setShowGifPicker(false);
  };

  const handleVoiceNoteComplete = (voiceNote: VoiceNote) => {
    addComment('voice', voiceNote);
    setShowVoiceRecorder(false);
  };

  const handlePickerOpen = (type: 'emoji' | 'gif' | 'voice', event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPickerPosition({
      x: rect.left,
      y: rect.top - 10
    });

    if (type === 'emoji') {
      setShowEmojiPicker(true);
      setShowGifPicker(false);
      setShowVoiceRecorder(false);
    } else if (type === 'gif') {
      setShowGifPicker(true);
      setShowEmojiPicker(false);
      setShowVoiceRecorder(false);
    } else if (type === 'voice') {
      setShowVoiceRecorder(true);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  const playVoiceNote = (commentId: string, voiceNote: VoiceNote) => {
    // Stop any currently playing voice note
    if (playingVoiceNote && audioRefs.current[playingVoiceNote]) {
      audioRefs.current[playingVoiceNote].pause();
    }

    if (playingVoiceNote === commentId) {
      setPlayingVoiceNote(null);
      return;
    }

    // Create audio element if it doesn't exist
    if (!audioRefs.current[commentId]) {
      const audio = new Audio(voiceNote.url);
      audio.onended = () => setPlayingVoiceNote(null);
      audioRefs.current[commentId] = audio;
    }

    audioRefs.current[commentId].play();
    setPlayingVoiceNote(commentId);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const groupReactionsByEmoji = (reactions: CommentReaction[]) => {
    const grouped: Record<string, CommentReaction[]> = {};
    reactions.forEach(reaction => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = [];
      }
      grouped[reaction.emoji].push(reaction);
    });
    return grouped;
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
            
            {/* Comment Actions */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handlePickerOpen('emoji', e)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => handlePickerOpen('gif', e)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Add GIF"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => handlePickerOpen('voice', e)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Record voice note"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={() => addComment('text')}
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
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 group"
          >
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900" style={{ color: '#000000' }}>
                  {(() => {
                    // If it's the current user, use their display name
                    if (comment.createdBy === currentUserId) {
                      return user?.displayName || user?.email || 'You';
                    }
                    
                    // Look up the user in board members
                    const member = boardMembers.find(m => m.userId === comment.createdBy);
                    if (member) {
                      return member.displayName || member.email;
                    }
                    
                    // Fallback to generic user name
                    return `User ${comment.createdBy.slice(-4)}`;
                  })()}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.edited && <span className="ml-1">(edited)</span>}
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
                <div className="space-y-2">
                  {/* Comment Content */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    {comment.type === 'text' && (
                      <MentionDisplay
                        text={comment.text}
                        boardMembers={boardMembers}
                        className="text-sm text-gray-900"
                      />
                    )}
                    
                    {comment.type === 'gif' && comment.gifUrl && (
                      <div className="max-w-xs">
                        <img
                          src={comment.gifUrl}
                          alt="GIF"
                          className="rounded-lg max-w-full h-auto"
                        />
                      </div>
                    )}
                    
                    {comment.type === 'voice' && comment.voiceNote && (
                      <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                        <button
                          onClick={() => playVoiceNote(comment.id, comment.voiceNote!)}
                          className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                        >
                          {playingVoiceNote === comment.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 ml-0.5" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Volume2 className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">
                              Voice Note
                            </span>
                          </div>
                          
                          {/* Waveform visualization */}
                          <div className="flex items-center gap-1 h-4">
                            {comment.voiceNote.waveform ? (
                              comment.voiceNote.waveform.map((value, index) => (
                                <div
                                  key={index}
                                  className="bg-blue-400 rounded-full"
                                  style={{
                                    width: '2px',
                                    height: `${Math.max(2, value * 16)}px`
                                  }}
                                />
                              ))
                            ) : (
                              Array.from({ length: 20 }, (_, i) => (
                                <div
                                  key={i}
                                  className="bg-blue-400 rounded-full"
                                  style={{
                                    width: '2px',
                                    height: `${Math.random() * 12 + 4}px`
                                  }}
                                />
                              ))
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDuration(comment.voiceNote.duration)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reactions */}
                  {comment.reactions && comment.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(groupReactionsByEmoji(comment.reactions)).map(([emoji, reactions]) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(comment.id, emoji)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                            reactions.some(r => r.userId === currentUserId)
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={reactions.map(r => r.userName).join(', ')}
                        >
                          <span>{emoji}</span>
                          <span>{reactions.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Comment Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPickerPosition({ x: rect.left, y: rect.top - 10 });
                        setShowEmojiPicker(true);
                        // Store which comment to react to
                        (window as any).reactToCommentId = comment.id;
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Smile className="h-3 w-3" />
                      React
                    </button>
                    
                    {comment.createdBy === currentUserId && comment.type === 'text' && (
                      <>
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
                      </>
                    )}
                    
                    {comment.createdBy === currentUserId && comment.type !== 'text' && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No comments yet. Be the first to add one!</p>
        </div>
      )}

      {/* Pickers */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={(emoji) => {
          // Check if we're reacting to a comment or adding to input
          const reactToCommentId = (window as any).reactToCommentId;
          if (reactToCommentId) {
            addReaction(reactToCommentId, emoji);
            (window as any).reactToCommentId = null;
          } else {
            handleEmojiSelect(emoji);
          }
        }}
        position={pickerPosition}
      />

      <GifPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onGifSelect={handleGifSelect}
        position={pickerPosition}
      />

      <VoiceRecorder
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onVoiceNoteComplete={handleVoiceNoteComplete}
        position={pickerPosition}
      />
    </div>
  );
}; 