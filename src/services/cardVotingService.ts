'use client';

import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardVote, CardPoll, PollOption, PollResults } from '@/types';
import { cleanFirestoreData } from '@/utils/firestore';

export class CardVotingService {
  /**
   * Add or update a vote on a card
   */
  static async addVote(
    cardId: string,
    userId: string,
    userEmail: string,
    userName: string,
    voteType: 'priority' | 'approval' | 'effort' | 'custom',
    value: number,
    comment?: string,
    userPhoto?: string
  ): Promise<void> {
    try {
      console.log('🔥 CardVotingService.addVote called with:', {
        cardId,
        userId,
        userEmail,
        userName,
        voteType,
        value
      });

      const cardRef = doc(db, 'cards', cardId);
      console.log('📄 Getting card document...');
      
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        console.error('❌ Card not found:', cardId);
        throw new Error('Card not found');
      }

      console.log('✅ Card document found');
      const cardData = cardDoc.data();
      const votes = cardData.votes || [];

      // Remove existing vote from same user for same type
      const filteredVotes = votes.filter((vote: CardVote) => 
        !(vote.userId === userId && vote.voteType === voteType)
      );

      // Create new vote
      const newVote: CardVote = {
        userId,
        userEmail,
        userName,
        userPhoto, // Keep as undefined if not provided
        voteType,
        value,
        comment, // Keep as undefined if not provided
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('🗳️ New vote created:', newVote);

      // Add new vote
      const updatedVotes = [...filteredVotes, newVote];
      
      // Calculate priority score if this is a priority vote
      let priorityScore = cardData.priorityScore;
      if (voteType === 'priority') {
        priorityScore = this.calculatePriorityScore(updatedVotes);
        console.log('📈 Calculated priority score:', priorityScore);
      }

      // Prepare update data
      const updateData = {
        votes: updatedVotes,
        priorityScore,
        updatedAt: new Date()
      };

      // Clean the data to remove undefined values before sending to Firestore
      const cleanedData = cleanFirestoreData(updateData);
      
      console.log('🧹 Cleaned update data:', cleanedData);
      console.log('💾 Updating card document...');
      
      await updateDoc(cardRef, cleanedData);
      
      console.log('✅ Vote added successfully');
    } catch (error) {
      console.error('❌ Error in addVote:', error);
      throw error;
    }
  }

  /**
   * Remove a vote from a card
   */
  static async removeVote(
    cardId: string,
    userId: string,
    voteType: 'priority' | 'approval' | 'effort' | 'custom'
  ): Promise<void> {
    try {
      const cardRef = doc(db, 'cards', cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const cardData = cardDoc.data() as Card;
      const existingVotes = cardData.votes || [];
      
      // Remove vote from user for specific type
      const filteredVotes = existingVotes.filter(
        vote => !(vote.userId === userId && vote.voteType === voteType)
      );

      // Recalculate priority score if this was a priority vote
      let priorityScore = cardData.priorityScore;
      if (voteType === 'priority') {
        priorityScore = this.calculatePriorityScore(filteredVotes);
      }

      // Prepare update data
      const updateData = {
        votes: filteredVotes,
        priorityScore,
        updatedAt: new Date()
      };

      // Clean the data to remove undefined values before sending to Firestore
      const cleanedData = cleanFirestoreData(updateData);

      await updateDoc(cardRef, cleanedData);

    } catch (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
  }

  /**
   * Create a new poll on a card
   */
  static async createPoll(
    cardId: string,
    title: string,
    description: string,
    type: 'priority' | 'approval' | 'effort' | 'custom',
    options: PollOption[] | undefined,
    allowComments: boolean,
    allowMultipleVotes: boolean,
    isAnonymous: boolean,
    endDate: Date | undefined,
    createdBy: string
  ): Promise<string> {
    try {
      const pollId = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newPoll: CardPoll = {
        id: pollId,
        title,
        description,
        type,
        options,
        allowComments,
        allowMultipleVotes,
        isAnonymous,
        endDate,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        votes: []
      };

      // Prepare update data
      const updateData = {
        polls: [newPoll], // Use array instead of arrayUnion to avoid issues with undefined values
        updatedAt: new Date()
      };

      // Clean the data to remove undefined values before sending to Firestore
      const cleanedData = cleanFirestoreData(updateData);

      const cardRef = doc(db, 'cards', cardId);
      
      // Get current polls and add the new one
      const cardDoc = await getDoc(cardRef);
      if (cardDoc.exists()) {
        const cardData = cardDoc.data();
        const existingPolls = cardData.polls || [];
        const cleanedPoll = cleanedData.polls?.[0];
        if (cleanedPoll) {
          cleanedData.polls = [...existingPolls, cleanedPoll];
        }
      }

      await updateDoc(cardRef, cleanedData);

      return pollId;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  /**
   * Vote on a poll
   */
  static async voteOnPoll(
    cardId: string,
    pollId: string,
    userId: string,
    userEmail: string,
    userName: string,
    value: number,
    comment?: string,
    userPhoto?: string
  ): Promise<void> {
    try {
      const cardRef = doc(db, 'cards', cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const cardData = cardDoc.data();
      const polls = cardData.polls || [];
      
      const pollIndex = polls.findIndex((p: CardPoll) => p.id === pollId);
      if (pollIndex === -1) {
        throw new Error('Poll not found');
      }

      const poll = polls[pollIndex];
      
      // Check if poll is active
      if (poll.status !== 'active') {
        throw new Error('Poll is not active');
      }
      
      // Check if poll has ended
      if (poll.endDate && new Date() > poll.endDate) {
        throw new Error('Poll has ended');
      }

      // Create new vote
      const newVote: CardVote = {
        userId,
        userEmail,
        userName,
        userPhoto,
        voteType: poll.type,
        value,
        comment,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add vote to poll
      const updatedPoll = {
        ...poll,
        votes: [...(poll.votes || []), newVote],
        updatedAt: new Date()
      };

      // Update polls array
      const updatedPolls = [...polls];
      updatedPolls[pollIndex] = updatedPoll;

      // Prepare update data
      const updateData = {
        polls: updatedPolls,
        updatedAt: new Date()
      };

      // Clean the data to remove undefined values before sending to Firestore
      const cleanedData = cleanFirestoreData(updateData);

      await updateDoc(cardRef, cleanedData);
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  /**
   * Close a poll
   */
  static async closePoll(cardId: string, pollId: string): Promise<void> {
    try {
      const cardRef = doc(db, 'cards', cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const cardData = cardDoc.data() as Card;
      const polls = cardData.polls || [];
      
      const pollIndex = polls.findIndex(poll => poll.id === pollId);
      if (pollIndex === -1) {
        throw new Error('Poll not found');
      }

      const poll = polls[pollIndex];
      const updatedPoll = {
        ...poll,
        status: 'closed' as const,
        updatedAt: new Date(),
        results: this.calculatePollResults(poll.votes || [], poll.type, poll.options)
      };

      const updatedPolls = [...polls];
      updatedPolls[pollIndex] = updatedPoll;

      // Prepare update data
      const updateData = {
        polls: updatedPolls,
        updatedAt: new Date()
      };

      // Clean the data to remove undefined values before sending to Firestore
      const cleanedData = cleanFirestoreData(updateData);

      await updateDoc(cardRef, cleanedData);

    } catch (error) {
      console.error('Error closing poll:', error);
      throw error;
    }
  }

  /**
   * Calculate priority score from priority votes
   */
  static calculatePriorityScore(votes: CardVote[]): number {
    const priorityVotes = votes.filter(vote => vote.voteType === 'priority');
    
    if (priorityVotes.length === 0) {
      return 0;
    }

    const totalScore = priorityVotes.reduce((sum, vote) => sum + vote.value, 0);
    return Math.round((totalScore / priorityVotes.length) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate poll results
   */
  static calculatePollResults(
    votes: CardVote[], 
    pollType: string, 
    options?: PollOption[]
  ): PollResults {
    const totalVotes = votes.length;
    const distribution: { [key: string]: number } = {};
    
    // Initialize distribution
    if (options) {
      options.forEach(option => {
        distribution[option.id] = 0;
      });
    }

    // Count votes
    votes.forEach(vote => {
      const key = vote.value.toString();
      distribution[key] = (distribution[key] || 0) + 1;
    });

    // Calculate average for numeric votes
    let averageScore: number | undefined;
    if (pollType === 'priority' || pollType === 'effort') {
      const totalScore = votes.reduce((sum, vote) => sum + vote.value, 0);
      averageScore = totalVotes > 0 ? Math.round((totalScore / totalVotes) * 100) / 100 : 0;
    }

    // Get top voters (users who voted most recently)
    const voterCounts: { [userId: string]: number } = {};
    votes.forEach(vote => {
      voterCounts[vote.userId] = (voterCounts[vote.userId] || 0) + 1;
    });

    const topVoters = Object.entries(voterCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId]) => userId);

    return {
      totalVotes,
      averageScore,
      distribution,
      topVoters,
      lastUpdated: new Date()
    };
  }

  /**
   * Get voting statistics for a card
   */
  static getVotingStats(card: Card): {
    totalVotes: number;
    priorityScore: number;
    approvalRate: number;
    effortEstimate: number;
    activePolls: number;
  } {
    const votes = card.votes || [];
    const polls = card.polls || [];
    
    const priorityVotes = votes.filter(v => v.voteType === 'priority');
    const approvalVotes = votes.filter(v => v.voteType === 'approval');
    const effortVotes = votes.filter(v => v.voteType === 'effort');
    
    const priorityScore = this.calculatePriorityScore(votes);
    const approvalRate = approvalVotes.length > 0 
      ? (approvalVotes.filter(v => v.value > 0).length / approvalVotes.length) * 100 
      : 0;
    const effortEstimate = effortVotes.length > 0
      ? effortVotes.reduce((sum, v) => sum + v.value, 0) / effortVotes.length
      : 0;
    
    const activePolls = polls.filter(p => p.status === 'active').length;

    return {
      totalVotes: votes.length,
      priorityScore,
      approvalRate: Math.round(approvalRate),
      effortEstimate: Math.round(effortEstimate * 100) / 100,
      activePolls
    };
  }
} 