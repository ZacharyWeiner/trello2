'use client';

import { 
  doc, 
  updateDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/types';

export class CardArchiveService {
  /**
   * Archive a card
   */
  static async archiveCard(
    cardId: string,
    userId: string
  ): Promise<void> {
    try {
      const cardRef = doc(db, 'cards', cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const cardData = cardDoc.data() as Card;

      await updateDoc(cardRef, {
        archived: true,
        archivedAt: Timestamp.now(),
        archivedBy: userId,
        originalListId: cardData.listId, // Store original list for restoration
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error archiving card:', error);
      throw error;
    }
  }

  /**
   * Restore an archived card
   */
  static async restoreCard(
    cardId: string,
    targetListId?: string // Optional: restore to a different list
  ): Promise<void> {
    try {
      const cardRef = doc(db, 'cards', cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const cardData = cardDoc.data() as Card;
      
      if (!cardData.archived) {
        throw new Error('Card is not archived');
      }

      // Determine which list to restore to
      const restoreListId = targetListId || cardData.originalListId || cardData.listId;

      // Get the highest position in the target list for new cards
      const newPosition = await this.getNextPositionInList(restoreListId);

      await updateDoc(cardRef, {
        archived: false,
        archivedAt: null,
        archivedBy: null,
        listId: restoreListId,
        position: newPosition,
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error restoring card:', error);
      throw error;
    }
  }

  /**
   * Get all archived cards for a board
   */
  static async getArchivedCards(boardId: string): Promise<Card[]> {
    try {
      const q = query(
        collection(db, 'cards'),
        where('boardId', '==', boardId),
        where('archived', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const cards = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          archivedAt: data.archivedAt?.toDate(),
        } as Card;
      });

      // Sort by archived date (most recent first)
      return cards.sort((a, b) => {
        if (!a.archivedAt || !b.archivedAt) return 0;
        return b.archivedAt.getTime() - a.archivedAt.getTime();
      });

    } catch (error) {
      console.error('Error getting archived cards:', error);
      throw error;
    }
  }

  /**
   * Permanently delete an archived card
   */
  static async permanentlyDeleteCard(cardId: string): Promise<void> {
    try {
      const cardRef = doc(db, 'cards', cardId);
      const cardDoc = await getDoc(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const cardData = cardDoc.data() as Card;
      
      if (!cardData.archived) {
        throw new Error('Card must be archived before permanent deletion');
      }

      // Instead of deleting, we'll mark it as permanently deleted
      // This allows for potential recovery and maintains data integrity
      await updateDoc(cardRef, {
        permanentlyDeleted: true,
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

    } catch (error) {
      console.error('Error permanently deleting card:', error);
      throw error;
    }
  }

  /**
   * Get the next position for a card in a list
   */
  private static async getNextPositionInList(listId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'cards'),
        where('listId', '==', listId)
        // Removed archived filter - we'll filter manually to handle cards without archived field
      );

      const querySnapshot = await getDocs(q);
      const cards = querySnapshot.docs
        .map(doc => doc.data() as Card)
        .filter(card => !card.archived); // Filter out archived cards manually
      
      if (cards.length === 0) {
        return 0;
      }

      // Find the highest position
      const maxPosition = Math.max(...cards.map(card => card.position || 0));
      return maxPosition + 1;

    } catch (error) {
      console.error('Error getting next position:', error);
      return 0;
    }
  }

  /**
   * Archive multiple cards at once
   */
  static async archiveMultipleCards(
    cardIds: string[],
    userId: string
  ): Promise<void> {
    try {
      const promises = cardIds.map(cardId => this.archiveCard(cardId, userId));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error archiving multiple cards:', error);
      throw error;
    }
  }

  /**
   * Restore multiple cards at once
   */
  static async restoreMultipleCards(
    cardIds: string[],
    targetListId?: string
  ): Promise<void> {
    try {
      const promises = cardIds.map(cardId => this.restoreCard(cardId, targetListId));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error restoring multiple cards:', error);
      throw error;
    }
  }

  /**
   * Get archive statistics for a board
   */
  static async getArchiveStats(boardId: string): Promise<{
    totalArchived: number;
    archivedThisWeek: number;
    archivedThisMonth: number;
    oldestArchived?: Date;
    newestArchived?: Date;
  }> {
    try {
      const archivedCards = await this.getArchivedCards(boardId);
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const archivedThisWeek = archivedCards.filter(card => 
        card.archivedAt && card.archivedAt >= oneWeekAgo
      ).length;

      const archivedThisMonth = archivedCards.filter(card => 
        card.archivedAt && card.archivedAt >= oneMonthAgo
      ).length;

      const archivedDates = archivedCards
        .map(card => card.archivedAt)
        .filter(date => date) as Date[];

      return {
        totalArchived: archivedCards.length,
        archivedThisWeek,
        archivedThisMonth,
        oldestArchived: archivedDates.length > 0 ? new Date(Math.min(...archivedDates.map(d => d.getTime()))) : undefined,
        newestArchived: archivedDates.length > 0 ? new Date(Math.max(...archivedDates.map(d => d.getTime()))) : undefined,
      };

    } catch (error) {
      console.error('Error getting archive stats:', error);
      return {
        totalArchived: 0,
        archivedThisWeek: 0,
        archivedThisMonth: 0,
      };
    }
  }
} 