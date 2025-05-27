'use client';

import React from 'react';
import { Star, ThumbsUp, Clock, BarChart3, Users } from 'lucide-react';
import { Card } from '@/types';
import { CardVotingService } from '@/services/cardVotingService';

interface CardVotingIndicatorProps {
  card: Card;
  showDetails?: boolean;
  className?: string;
}

export const CardVotingIndicator: React.FC<CardVotingIndicatorProps> = ({
  card,
  showDetails = false,
  className = ''
}) => {
  const votes = card.votes || [];
  const polls = card.polls || [];
  
  if (votes.length === 0 && polls.length === 0) {
    return null;
  }

  const stats = CardVotingService.getVotingStats(card);
  const priorityVotes = votes.filter(v => v.voteType === 'priority');
  const approvalVotes = votes.filter(v => v.voteType === 'approval');
  const effortVotes = votes.filter(v => v.voteType === 'effort');
  const activePolls = polls.filter(p => p.status === 'active');

  if (showDetails) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Priority Score */}
        {priorityVotes.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-yellow-600">
              <Star size={12} />
              <span className="font-medium">{stats.priorityScore}</span>
            </div>
            <span className="text-gray-500">({priorityVotes.length} votes)</span>
          </div>
        )}

        {/* Approval Rate */}
        {approvalVotes.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-green-600">
              <ThumbsUp size={12} />
              <span className="font-medium">{stats.approvalRate}%</span>
            </div>
            <span className="text-gray-500">({approvalVotes.length} votes)</span>
          </div>
        )}

        {/* Effort Estimate */}
        {effortVotes.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-blue-600">
              <Clock size={12} />
              <span className="font-medium">{stats.effortEstimate}</span>
            </div>
            <span className="text-gray-500">({effortVotes.length} votes)</span>
          </div>
        )}

        {/* Active Polls */}
        {activePolls.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-purple-600">
              <BarChart3 size={12} />
              <span className="font-medium">{activePolls.length}</span>
            </div>
            <span className="text-gray-500">active polls</span>
          </div>
        )}
      </div>
    );
  }

  // Compact view
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Priority Score Badge */}
      {stats.priorityScore > 0 && (
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200"
          title={`Priority Score: ${stats.priorityScore} (${priorityVotes.length} votes)`}
        >
          <Star size={10} />
          <span>{stats.priorityScore}</span>
        </div>
      )}

      {/* Approval Rate Badge */}
      {approvalVotes.length > 0 && (
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"
          title={`Approval Rate: ${stats.approvalRate}% (${approvalVotes.length} votes)`}
        >
          <ThumbsUp size={10} />
          <span>{stats.approvalRate}%</span>
        </div>
      )}

      {/* Effort Estimate Badge */}
      {effortVotes.length > 0 && (
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
          title={`Effort Estimate: ${stats.effortEstimate} (${effortVotes.length} votes)`}
        >
          <Clock size={10} />
          <span>{stats.effortEstimate}</span>
        </div>
      )}

      {/* Active Polls Badge */}
      {activePolls.length > 0 && (
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
          title={`${activePolls.length} active polls`}
        >
          <BarChart3 size={10} />
          <span>{activePolls.length}</span>
        </div>
      )}

      {/* Total Votes Count */}
      {stats.totalVotes > 0 && (
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
          title={`${stats.totalVotes} total votes`}
        >
          <Users size={10} />
          <span>{stats.totalVotes}</span>
        </div>
      )}
    </div>
  );
}; 