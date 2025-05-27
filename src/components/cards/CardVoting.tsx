'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  Clock, 
  BarChart3, 
  Plus, 
  X, 
  Users, 
  TrendingUp,
  MessageSquare,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardVote, CardPoll, PollOption } from '@/types';
import { CardVotingService } from '@/services/cardVotingService';
import { useAuthContext } from '@/contexts/AuthContext';
import { convertFirestoreDate } from '@/utils/firestore';

interface CardVotingProps {
  card: Card;
  currentUserId: string;
  onCardUpdate: (cardId: string, updates: Partial<Card>) => void;
}

export const CardVoting: React.FC<CardVotingProps> = ({
  card,
  currentUserId,
  onCardUpdate,
}) => {
  const { user } = useAuthContext();
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'polls'>('quick');

  // Get user info from auth context
  const currentUserEmail = user?.email || '';
  const currentUserName = user?.displayName || user?.email || 'Anonymous';
  const currentUserPhoto = user?.photoURL || undefined;

  // Quick voting states
  const [priorityVote, setPriorityVote] = useState<number | null>(null);
  const [approvalVote, setApprovalVote] = useState<boolean | null>(null);
  const [effortVote, setEffortVote] = useState<number | null>(null);

  // Poll creation states
  const [pollTitle, setPollTitle] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollType, setPollType] = useState<'priority' | 'approval' | 'effort' | 'custom'>('priority');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([]);
  const [allowComments, setAllowComments] = useState(true);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Load current user's votes
    const votes = card.votes || [];
    const userPriorityVote = votes.find(v => v.userId === currentUserId && v.voteType === 'priority');
    const userApprovalVote = votes.find(v => v.userId === currentUserId && v.voteType === 'approval');
    const userEffortVote = votes.find(v => v.userId === currentUserId && v.voteType === 'effort');

    setPriorityVote(userPriorityVote?.value || null);
    setApprovalVote(userApprovalVote ? userApprovalVote.value > 0 : null);
    setEffortVote(userEffortVote?.value || null);
  }, [card.votes, currentUserId]);

  // Add test function for debugging
  const testVote = async () => {
    console.log('🧪 Testing vote functionality...');
    console.log('User info:', {
      currentUserId,
      currentUserEmail,
      currentUserName,
      isAuthenticated: !!user
    });
    console.log('Card info:', {
      cardId: card.id,
      cardTitle: card.title,
      existingVotes: card.votes?.length || 0
    });
    
    try {
      // Test Firebase connection
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const cardRef = doc(db, 'cards', card.id);
      const cardDoc = await getDoc(cardRef);
      
      if (cardDoc.exists()) {
        console.log('✅ Firebase connection working - card found');
        console.log('Card data:', cardDoc.data());
      } else {
        console.error('❌ Card not found in Firebase');
      }
    } catch (error) {
      console.error('❌ Firebase connection error:', error);
    }
  };

  const handleQuickVote = async (
    voteType: 'priority' | 'approval' | 'effort',
    value: number
  ) => {
    if (loading) return;

    // Add validation checks
    if (!currentUserId) {
      alert('You must be logged in to vote');
      return;
    }

    if (!card.id) {
      alert('Invalid card - cannot submit vote');
      return;
    }

    setLoading(true);
    try {
      console.log('🗳️ Submitting vote:', {
        cardId: card.id,
        userId: currentUserId,
        voteType,
        value,
        userEmail: currentUserEmail,
        userName: currentUserName
      });

      await CardVotingService.addVote(
        card.id,
        currentUserId,
        currentUserEmail,
        currentUserName,
        voteType,
        value,
        undefined,
        currentUserPhoto
      );

      console.log('✅ Vote submitted successfully');

      // Refresh card data
      await refreshCardData();
    } catch (error) {
      console.error('❌ Error voting:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit vote';
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to vote on this card';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error - please check your connection';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Card not found - it may have been deleted';
        } else {
          errorMessage = `Failed to submit vote: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVote = async (voteType: 'priority' | 'approval' | 'effort') => {
    if (loading) return;

    setLoading(true);
    try {
      await CardVotingService.removeVote(card.id, currentUserId, voteType);
      await refreshCardData();
    } catch (error) {
      console.error('Error removing vote:', error);
      alert('Failed to remove vote');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!pollTitle.trim() || loading) return;

    setLoading(true);
    try {
      await CardVotingService.createPoll(
        card.id,
        pollTitle.trim(),
        pollDescription.trim(),
        pollType,
        pollOptions.length > 0 ? pollOptions : undefined,
        allowComments,
        allowMultipleVotes,
        isAnonymous,
        endDate ? new Date(endDate) : undefined,
        currentUserId
      );

      await refreshCardData();
      setShowCreatePoll(false);
      resetPollForm();
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteOnPoll = async (pollId: string, value: number, comment?: string) => {
    if (loading) return;

    // Add validation checks
    if (!currentUserId) {
      alert('You must be logged in to vote');
      return;
    }

    setLoading(true);
    try {
      console.log('🗳️ Submitting poll vote:', {
        cardId: card.id,
        pollId,
        userId: currentUserId,
        value,
        comment
      });

      await CardVotingService.voteOnPoll(
        card.id,
        pollId,
        currentUserId,
        currentUserEmail,
        currentUserName,
        value,
        comment,
        currentUserPhoto
      );

      console.log('✅ Poll vote submitted successfully');
      await refreshCardData();
    } catch (error) {
      console.error('❌ Error voting on poll:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit vote';
      if (error instanceof Error) {
        if (error.message.includes('not active')) {
          errorMessage = 'This poll is no longer active';
        } else if (error.message.includes('ended')) {
          errorMessage = 'This poll has ended';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Poll not found';
        } else {
          errorMessage = `Failed to submit vote: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshCardData = async () => {
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const cardDoc = await getDoc(doc(db, 'cards', card.id));
      if (cardDoc.exists()) {
        const updatedCardData = cardDoc.data();
        
        const updatedCard = {
          ...card,
          ...updatedCardData,
          votes: (updatedCardData.votes || []).map((vote: any) => ({
            ...vote,
            createdAt: convertFirestoreDate(vote.createdAt) || new Date(),
            updatedAt: convertFirestoreDate(vote.updatedAt) || new Date()
          })),
          polls: (updatedCardData.polls || []).map((poll: any) => ({
            ...poll,
            createdAt: convertFirestoreDate(poll.createdAt) || new Date(),
            updatedAt: convertFirestoreDate(poll.updatedAt) || new Date(),
            endDate: convertFirestoreDate(poll.endDate),
            votes: (poll.votes || []).map((vote: any) => ({
              ...vote,
              createdAt: convertFirestoreDate(vote.createdAt) || new Date(),
              updatedAt: convertFirestoreDate(vote.updatedAt) || new Date()
            }))
          })),
          createdAt: convertFirestoreDate(updatedCardData.createdAt) || card.createdAt,
          updatedAt: convertFirestoreDate(updatedCardData.updatedAt) || new Date(),
          dueDate: convertFirestoreDate(updatedCardData.dueDate)
        };
        
        onCardUpdate(card.id, updatedCard);
      }
    } catch (error) {
      console.error('Error refreshing card data:', error);
    }
  };

  const resetPollForm = () => {
    setPollTitle('');
    setPollDescription('');
    setPollType('priority');
    setPollOptions([]);
    setAllowComments(true);
    setAllowMultipleVotes(false);
    setIsAnonymous(false);
    setEndDate('');
  };

  const addPollOption = () => {
    const newOption: PollOption = {
      id: `option_${Date.now()}`,
      text: '',
      color: '#3B82F6'
    };
    setPollOptions([...pollOptions, newOption]);
  };

  const updatePollOption = (index: number, field: keyof PollOption, value: string) => {
    const updated = [...pollOptions];
    updated[index] = { ...updated[index], [field]: value };
    setPollOptions(updated);
  };

  const removePollOption = (index: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const votingStats = CardVotingService.getVotingStats(card);
  const polls = card.polls || [];
  const activePolls = polls.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BarChart3 size={20} />
          Voting & Polls
        </h3>
        <div className="flex items-center gap-2">
          {/* Debug button - remove in production */}
          <button
            onClick={testVote}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            title="Debug voting functionality"
          >
            🧪 Test
          </button>
          
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'quick'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Quick Vote
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'polls'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Polls ({activePolls.length})
            </button>
          </div>
          {activeTab === 'polls' && (
            <button
              onClick={() => setShowCreatePoll(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              New Poll
            </button>
          )}
        </div>
      </div>

      {/* Voting Stats */}
      {votingStats.totalVotes > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{votingStats.totalVotes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{votingStats.priorityScore}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Priority Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{votingStats.approvalRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{votingStats.effortEstimate}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Effort Estimate</div>
          </div>
        </div>
      )}

      {/* Quick Voting Tab */}
      {activeTab === 'quick' && (
        <div className="space-y-6">
          {/* Priority Voting */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                Priority (1-5)
              </h4>
              {priorityVote && (
                <button
                  onClick={() => handleRemoveVote('priority')}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove Vote
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickVote('priority', value)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-lg border-2 transition-all disabled:opacity-50 ${
                    priorityVote === value
                      ? 'border-yellow-500 bg-yellow-100 text-yellow-700'
                      : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Approval Voting */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ThumbsUp size={18} className="text-green-500" />
                Approval
              </h4>
              {approvalVote !== null && (
                <button
                  onClick={() => handleRemoveVote('approval')}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove Vote
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickVote('approval', 1)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  approvalVote === true
                    ? 'border-green-500 bg-green-100 text-green-700'
                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                <ThumbsUp size={16} />
                Approve
              </button>
              <button
                onClick={() => handleQuickVote('approval', 0)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  approvalVote === false
                    ? 'border-red-500 bg-red-100 text-red-700'
                    : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                }`}
              >
                <ThumbsDown size={16} />
                Reject
              </button>
            </div>
          </div>

          {/* Effort Voting */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock size={18} className="text-blue-500" />
                Effort (1-5)
              </h4>
              {effortVote && (
                <button
                  onClick={() => handleRemoveVote('effort')}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove Vote
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickVote('effort', value)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-lg border-2 transition-all disabled:opacity-50 ${
                    effortVote === value
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              1 = Very Easy, 5 = Very Hard
            </div>
          </div>
        </div>
      )}

      {/* Polls Tab */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          {polls.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No polls yet</p>
              <p className="text-sm mb-4">Create polls to gather detailed feedback from your team</p>
              <button
                onClick={() => setShowCreatePoll(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Create First Poll
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  currentUserId={currentUserId}
                  onVote={(value, comment) => handleVoteOnPoll(poll.id, value, comment)}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Poll Modal */}
      <AnimatePresence>
        {showCreatePoll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreatePoll(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Create New Poll
                  </h3>
                  <button
                    onClick={() => setShowCreatePoll(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Poll Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poll Title *
                    </label>
                    <input
                      type="text"
                      value={pollTitle}
                      onChange={(e) => setPollTitle(e.target.value)}
                      placeholder="What should we prioritize?"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Poll Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={pollDescription}
                      onChange={(e) => setPollDescription(e.target.value)}
                      placeholder="Provide more context for this poll..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Poll Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poll Type
                    </label>
                    <select
                      value={pollType}
                      onChange={(e) => setPollType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="priority">Priority (1-5 scale)</option>
                      <option value="approval">Approval (Yes/No)</option>
                      <option value="effort">Effort Estimate (1-5 scale)</option>
                      <option value="custom">Custom Options</option>
                    </select>
                  </div>

                  {/* Custom Options */}
                  {pollType === 'custom' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Options
                        </label>
                        <button
                          onClick={addPollOption}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Option
                        </button>
                      </div>
                      <div className="space-y-2">
                        {pollOptions.map((option, index) => (
                          <div key={option.id} className="flex gap-2">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updatePollOption(index, 'text', e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => removePollOption(index)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Poll Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="allowComments"
                        checked={allowComments}
                        onChange={(e) => setAllowComments(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="allowComments" className="text-sm text-gray-700 dark:text-gray-300">
                        Allow comments with votes
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="allowMultiple"
                        checked={allowMultipleVotes}
                        onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="allowMultiple" className="text-sm text-gray-700 dark:text-gray-300">
                        Allow multiple votes per user
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
                        Anonymous voting
                      </label>
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreatePoll(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                             transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePoll}
                    disabled={loading || !pollTitle.trim()}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Poll'}
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

// Poll Card Component
interface PollCardProps {
  poll: CardPoll;
  currentUserId: string;
  onVote: (value: number, comment?: string) => void;
  loading: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ poll, currentUserId, onVote, loading }) => {
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [voteValue, setVoteValue] = useState<number>(1);
  const [voteComment, setVoteComment] = useState('');

  const userVote = poll.votes?.find(v => v.userId === currentUserId);
  const isActive = poll.status === 'active' && (!poll.endDate || new Date() <= poll.endDate);
  const results = poll.results || CardVotingService.calculatePollResults(poll.votes || [], poll.type, poll.options);

  const handleSubmitVote = () => {
    onVote(voteValue, poll.allowComments && voteComment ? voteComment : undefined);
    setShowVoteForm(false);
    setVoteComment('');
  };

  const getPollTypeIcon = () => {
    switch (poll.type) {
      case 'priority': return <Star size={16} className="text-yellow-500" />;
      case 'approval': return <ThumbsUp size={16} className="text-green-500" />;
      case 'effort': return <Clock size={16} className="text-blue-500" />;
      default: return <BarChart3 size={16} className="text-purple-500" />;
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getPollTypeIcon()}
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{poll.title}</h4>
            {poll.isAnonymous && <EyeOff size={14} className="text-gray-400" />}
          </div>
          {poll.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{poll.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {results.totalVotes} votes
            </span>
            {results.averageScore && (
              <span className="flex items-center gap-1">
                <TrendingUp size={12} />
                {results.averageScore} avg
              </span>
            )}
            {poll.endDate && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Ends {poll.endDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        {isActive && !userVote && (
          <button
            onClick={() => setShowVoteForm(true)}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 
                     disabled:opacity-50 transition-colors"
          >
            Vote
          </button>
        )}
      </div>

      {/* Results */}
      {results.totalVotes > 0 && (
        <div className="space-y-2">
          {Object.entries(results.distribution).map(([key, count]) => {
            const percentage = (count / results.totalVotes) * 100;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                  {poll.options?.find(o => o.id === key)?.text || `Option ${key}`}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600 dark:text-gray-400 text-right">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User's Vote */}
      {userVote && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Your vote: {userVote.value}
            {userVote.comment && (
              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                "{userVote.comment}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vote Form */}
      {showVoteForm && (
        <div className="mt-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
          <div className="space-y-3">
            {poll.type === 'approval' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setVoteValue(1)}
                  className={`flex-1 py-2 px-3 rounded border-2 transition-colors ${
                    voteValue === 1
                      ? 'border-green-500 bg-green-100 text-green-700'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  <ThumbsUp size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => setVoteValue(0)}
                  className={`flex-1 py-2 px-3 rounded border-2 transition-colors ${
                    voteValue === 0
                      ? 'border-red-500 bg-red-100 text-red-700'
                      : 'border-gray-300 hover:border-red-400'
                  }`}
                >
                  <ThumbsDown size={16} className="mx-auto" />
                </button>
              </div>
            ) : poll.options ? (
              <div className="space-y-2">
                {poll.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setVoteValue(parseInt(option.id.replace('option_', '')))}
                    className={`w-full p-2 text-left rounded border-2 transition-colors ${
                      voteValue === parseInt(option.id.replace('option_', ''))
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setVoteValue(value)}
                    className={`w-10 h-10 rounded border-2 transition-colors ${
                      voteValue === value
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}

            {poll.allowComments && (
              <textarea
                value={voteComment}
                onChange={(e) => setVoteComment(e.target.value)}
                placeholder="Add a comment (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowVoteForm(false)}
                className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                         transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitVote}
                disabled={loading}
                className="flex-1 py-2 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 
                         disabled:opacity-50 transition-colors"
              >
                Submit Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 