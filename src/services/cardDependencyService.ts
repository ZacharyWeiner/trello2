import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  query,
  where,
  getDocs,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardDependency } from '@/types';

export class CardDependencyService {
  
  /**
   * Add a dependency relationship between two cards
   */
  static async addDependency(
    sourceCardId: string,
    targetCardId: string,
    type: 'blocks' | 'blocked_by' | 'related',
    reason?: string,
    userId?: string
  ): Promise<void> {
    if (sourceCardId === targetCardId) {
      throw new Error('A card cannot depend on itself');
    }

    // Get both cards to create the dependency objects
    const [sourceCard, targetCard] = await Promise.all([
      CardDependencyService.getCard(sourceCardId),
      CardDependencyService.getCard(targetCardId)
    ]);

    if (!sourceCard || !targetCard) {
      throw new Error('One or both cards not found');
    }

    // Check for circular dependencies
    if (await CardDependencyService.wouldCreateCircularDependency(sourceCardId, targetCardId, type)) {
      throw new Error('This dependency would create a circular dependency');
    }

    const batch = writeBatch(db);
    const now = Timestamp.now();

    // Create dependency objects
    const sourceDependency: CardDependency = {
      cardId: targetCardId,
      cardTitle: targetCard.title,
      boardId: targetCard.boardId,
      boardTitle: await CardDependencyService.getBoardTitle(targetCard.boardId),
      listId: targetCard.listId,
      listTitle: await CardDependencyService.getListTitle(targetCard.listId),
      type,
      createdBy: userId || 'system',
      createdAt: now.toDate(),
      ...(reason && { reason })
    };

    const targetDependency: CardDependency = {
      cardId: sourceCardId,
      cardTitle: sourceCard.title,
      boardId: sourceCard.boardId,
      boardTitle: await CardDependencyService.getBoardTitle(sourceCard.boardId),
      listId: sourceCard.listId,
      listTitle: await CardDependencyService.getListTitle(sourceCard.listId),
      type: type === 'blocks' ? 'blocked_by' : type === 'blocked_by' ? 'blocks' : 'related',
      createdBy: userId || 'system',
      createdAt: now.toDate(),
      ...(reason && { reason })
    };

    // Update source card
    const sourceCardRef = doc(db, 'cards', sourceCardId);
    if (type === 'blocks') {
      batch.update(sourceCardRef, {
        dependencies: arrayUnion(sourceDependency),
        updatedAt: now.toDate()
      });
    } else if (type === 'blocked_by') {
      batch.update(sourceCardRef, {
        blockedBy: arrayUnion(sourceDependency),
        updatedAt: now.toDate()
      });
    } else if (type === 'related') {
      batch.update(sourceCardRef, {
        dependencies: arrayUnion(sourceDependency),
        updatedAt: now.toDate()
      });
    }

    // Update target card
    const targetCardRef = doc(db, 'cards', targetCardId);
    if (type === 'blocks') {
      batch.update(targetCardRef, {
        blockedBy: arrayUnion(targetDependency),
        updatedAt: now.toDate()
      });
    } else if (type === 'blocked_by') {
      batch.update(targetCardRef, {
        dependencies: arrayUnion(targetDependency),
        updatedAt: now.toDate()
      });
    } else if (type === 'related') {
      batch.update(targetCardRef, {
        dependencies: arrayUnion(targetDependency),
        updatedAt: now.toDate()
      });
    }

    console.log('🔗 Adding dependency:', {
      sourceCardId,
      targetCardId,
      type,
      reason,
      sourceDependency,
      targetDependency
    });

    await batch.commit();
    console.log('✅ Dependency batch committed successfully');
  }

  /**
   * Remove a dependency relationship between two cards
   */
  static async removeDependency(
    sourceCardId: string,
    targetCardId: string,
    type: 'blocks' | 'blocked_by' | 'related'
  ): Promise<void> {
    const [sourceCard, targetCard] = await Promise.all([
      CardDependencyService.getCard(sourceCardId),
      CardDependencyService.getCard(targetCardId)
    ]);

    if (!sourceCard || !targetCard) {
      throw new Error('One or both cards not found');
    }

    const batch = writeBatch(db);
    const now = Timestamp.now();

    // Find and remove the dependency from source card
    const sourceDependency = (type === 'blocks' || type === 'related' ? sourceCard.dependencies : sourceCard.blockedBy)
      ?.find(dep => dep.cardId === targetCardId);
    
    if (sourceDependency) {
      const sourceCardRef = doc(db, 'cards', sourceCardId);
      if (type === 'blocks' || type === 'related') {
        batch.update(sourceCardRef, {
          dependencies: arrayRemove(sourceDependency),
          updatedAt: now.toDate()
        });
      } else {
        batch.update(sourceCardRef, {
          blockedBy: arrayRemove(sourceDependency),
          updatedAt: now.toDate()
        });
      }
    }

    // Find and remove the dependency from target card
    const targetDependency = (type === 'blocks' ? targetCard.blockedBy : targetCard.dependencies)
      ?.find(dep => dep.cardId === sourceCardId);
    
    if (targetDependency) {
      const targetCardRef = doc(db, 'cards', targetCardId);
      if (type === 'blocks') {
        batch.update(targetCardRef, {
          blockedBy: arrayRemove(targetDependency),
          updatedAt: now.toDate()
        });
      } else {
        batch.update(targetCardRef, {
          dependencies: arrayRemove(targetDependency),
          updatedAt: now.toDate()
        });
      }
    }

    await batch.commit();
  }

  /**
   * Get all cards that are blocked by a specific card
   */
  static async getBlockedCards(cardId: string): Promise<Card[]> {
    const card = await CardDependencyService.getCard(cardId);
    if (!card || !card.dependencies) return [];

    const blockedCardIds = card.dependencies
      .filter(dep => dep.type === 'blocks')
      .map(dep => dep.cardId);

    if (blockedCardIds.length === 0) return [];

    const cardsQuery = query(
      collection(db, 'cards'),
      where('__name__', 'in', blockedCardIds)
    );

    const snapshot = await getDocs(cardsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
  }

  /**
   * Get all cards that block a specific card
   */
  static async getBlockingCards(cardId: string): Promise<Card[]> {
    const card = await CardDependencyService.getCard(cardId);
    if (!card || !card.blockedBy) return [];

    const blockingCardIds = card.blockedBy
      .filter(dep => dep.type === 'blocked_by')
      .map(dep => dep.cardId);

    if (blockingCardIds.length === 0) return [];

    const cardsQuery = query(
      collection(db, 'cards'),
      where('__name__', 'in', blockingCardIds)
    );

    const snapshot = await getDocs(cardsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
  }

  /**
   * Check if adding a dependency would create a circular dependency
   */
  static async wouldCreateCircularDependency(
    sourceCardId: string,
    targetCardId: string,
    type: 'blocks' | 'blocked_by' | 'related'
  ): Promise<boolean> {
    if (type === 'related') return false; // Related dependencies don't create blocking cycles

    // Check if target card already blocks source card (directly or indirectly)
    return await CardDependencyService.hasTransitiveDependency(targetCardId, sourceCardId, type === 'blocks' ? 'blocks' : 'blocked_by');
  }

  /**
   * Check if there's a transitive dependency between two cards
   */
  private static async hasTransitiveDependency(
    fromCardId: string,
    toCardId: string,
    dependencyType: 'blocks' | 'blocked_by',
    visited: Set<string> = new Set()
  ): Promise<boolean> {
    if (visited.has(fromCardId)) return false; // Avoid infinite loops
    visited.add(fromCardId);

    const card = await CardDependencyService.getCard(fromCardId);
    if (!card) return false;

    const dependencies = dependencyType === 'blocks' ? card.dependencies : card.blockedBy;
    if (!dependencies) return false;

    // Check direct dependency
    if (dependencies.some(dep => dep.cardId === toCardId && dep.type === dependencyType)) {
      return true;
    }

    // Check transitive dependencies
    for (const dep of dependencies) {
      if (dep.type === dependencyType) {
        if (await CardDependencyService.hasTransitiveDependency(dep.cardId, toCardId, dependencyType, visited)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get dependency graph for visualization
   */
  static async getDependencyGraph(boardId: string): Promise<{
    nodes: { id: string; title: string; listId: string; listTitle: string }[];
    edges: { from: string; to: string; type: 'blocks' | 'blocked_by' | 'related'; reason?: string }[];
  }> {
    const cardsQuery = query(
      collection(db, 'cards'),
      where('boardId', '==', boardId)
    );

    const snapshot = await getDocs(cardsQuery);
    const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));

    const nodes = cards.map(card => ({
      id: card.id,
      title: card.title,
      listId: card.listId,
      listTitle: '' // Will be populated if needed
    }));

    const edges: { from: string; to: string; type: 'blocks' | 'blocked_by' | 'related'; reason?: string }[] = [];

    cards.forEach(card => {
      // Add blocking dependencies
      card.dependencies?.forEach(dep => {
        if (dep.type === 'blocks') {
          edges.push({
            from: card.id,
            to: dep.cardId,
            type: 'blocks',
            reason: dep.reason
          });
        }
      });

      // Add blocked by dependencies
      card.blockedBy?.forEach(dep => {
        if (dep.type === 'blocked_by') {
          edges.push({
            from: dep.cardId,
            to: card.id,
            type: 'blocks',
            reason: dep.reason
          });
        }
      });

      // Add related dependencies
      card.dependencies?.forEach(dep => {
        if (dep.type === 'related') {
          edges.push({
            from: card.id,
            to: dep.cardId,
            type: 'related',
            reason: dep.reason
          });
        }
      });
    });

    return { nodes, edges };
  }

  // Helper methods
  private static async getCard(cardId: string): Promise<Card | null> {
    const cardDoc = await getDoc(doc(db, 'cards', cardId));
    return cardDoc.exists() ? { id: cardDoc.id, ...cardDoc.data() } as Card : null;
  }

  private static async getBoardTitle(boardId: string): Promise<string> {
    const boardDoc = await getDoc(doc(db, 'boards', boardId));
    return boardDoc.exists() ? boardDoc.data().title : 'Unknown Board';
  }

  private static async getListTitle(listId: string): Promise<string> {
    const listDoc = await getDoc(doc(db, 'lists', listId));
    return listDoc.exists() ? listDoc.data().title : 'Unknown List';
  }
}

// Export convenience functions
export const addCardDependency = CardDependencyService.addDependency;
export const removeCardDependency = CardDependencyService.removeDependency;
export const getBlockedCards = CardDependencyService.getBlockedCards;
export const getBlockingCards = CardDependencyService.getBlockingCards;
export const getDependencyGraph = CardDependencyService.getDependencyGraph; 