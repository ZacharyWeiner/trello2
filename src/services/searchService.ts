import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { SearchFilters, SearchResult, SavedSearch, QuickFilter, Board, Card, Comment } from '@/types';

// Helper function to safely convert Firestore timestamps to Date objects
const safeToDate = (timestamp: any): Date => {
  try {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (typeof timestamp === 'string') return new Date(timestamp);
    if (typeof timestamp === 'number') return new Date(timestamp);
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000); // Firestore timestamp format
    return new Date();
  } catch (error) {
    console.warn('Error converting timestamp:', timestamp, error);
    return new Date();
  }
};

// Global search function
export const searchContent = async (
  filters: SearchFilters,
  maxResults: number = 50
): Promise<SearchResult[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to search');

  const results: SearchResult[] = [];

  try {
    // Get user's accessible boards first
    const userBoards = await getUserAccessibleBoards(currentUser.uid);
    const boardIds = filters.boards?.length 
      ? userBoards.filter(b => filters.boards!.includes(b.id)).map(b => b.id)
      : userBoards.map(b => b.id);

    if (boardIds.length === 0) return [];

    // Search boards
    if (!filters.query || filters.query.length === 0 || shouldSearchBoards(filters)) {
      const boardResults = await searchBoards(userBoards, filters);
      results.push(...boardResults);
    }

    // Search cards
    const cardResults = await searchCards(boardIds, filters);
    results.push(...cardResults);

    // Search comments
    if (filters.query && filters.query.length > 0) {
      const commentResults = await searchComments(boardIds, filters);
      results.push(...commentResults);
    }

    // Sort by relevance score and limit results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
};

// Get boards user has access to
const getUserAccessibleBoards = async (userId: string): Promise<Board[]> => {
  const boardsQuery = query(collection(db, 'boards'));
  const snapshot = await getDocs(boardsQuery);
  
  return snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
        members: data.members || []
      } as Board;
    })
    .filter(board => {
      // Check if user is a member or creator
      const isMember = board.members.some(member => member.userId === userId);
      const isCreator = board.createdBy === userId;
      return isMember || isCreator;
    });
};

// Search boards
const searchBoards = async (boards: Board[], filters: SearchFilters): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];
  
  for (const board of boards) {
    let relevanceScore = 0;
    const matchedFields: string[] = [];
    
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      if (board.title.toLowerCase().includes(query)) {
        relevanceScore += 10;
        matchedFields.push('title');
      }
      if (board.description?.toLowerCase().includes(query)) {
        relevanceScore += 5;
        matchedFields.push('description');
      }
    }
    
    // Date filters
    if (filters.createdDateRange) {
      const { start, end } = filters.createdDateRange;
      if (board.createdAt >= start && board.createdAt <= end) {
        relevanceScore += 2;
      } else if (filters.query) {
        continue; // Skip if doesn't match date range and we have a query
      }
    }
    
    if (relevanceScore > 0 || !filters.query) {
      results.push({
        type: 'board',
        id: board.id,
        title: board.title,
        description: board.description,
        boardId: board.id,
        boardTitle: board.title,
        relevanceScore,
        matchedFields,
        snippet: generateSnippet(board.description || '', filters.query),
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      });
    }
  }
  
  return results;
};

// Search cards
const searchCards = async (boardIds: string[], filters: SearchFilters): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];
  
  // Get all cards from accessible boards
  for (const boardId of boardIds) {
    const cardsQuery = query(
      collection(db, 'cards'),
      where('boardId', '==', boardId)
    );
    
    const snapshot = await getDocs(cardsQuery);
    const cards = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
        dueDate: data.dueDate ? safeToDate(data.dueDate) : undefined,
        labels: data.labels || [],
        assignees: data.assignees || [],
        checklists: data.checklists || [],
        comments: data.comments || [],
        attachments: data.attachments || []
      } as Card;
    });
    
    // Get board info for results
    const boardQuery = query(collection(db, 'boards'), where('__name__', '==', boardId));
    const boardSnapshot = await getDocs(boardQuery);
    const board = boardSnapshot.docs[0]?.data() as Board;
    
    for (const card of cards) {
      if (matchesCardFilters(card, filters)) {
        const relevanceScore = calculateCardRelevance(card, filters);
        const matchedFields = getCardMatchedFields(card, filters);
        
        if (relevanceScore > 0) {
          results.push({
            type: 'card',
            id: card.id,
            title: card.title,
            description: card.description,
            boardId: card.boardId,
            boardTitle: board?.title || 'Unknown Board',
            listId: card.listId,
            cardId: card.id,
            relevanceScore,
            matchedFields,
            snippet: generateSnippet(card.description || '', filters.query),
            labels: card.labels,
            dueDate: card.dueDate,
            assignees: card.assignees,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
          });
        }
      }
    }
  }
  
  return results;
};

// Search comments
const searchComments = async (boardIds: string[], filters: SearchFilters): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];
  
  if (!filters.query) return results;
  
  // This is a simplified version - in production you'd want a more efficient approach
  const cardResults = await searchCards(boardIds, { query: '' }); // Get all cards first
  
  for (const cardResult of cardResults) {
    // Get the full card to access comments
    const cardsQuery = query(
      collection(db, 'cards'),
      where('__name__', '==', cardResult.id)
    );
    const snapshot = await getDocs(cardsQuery);
    const card = snapshot.docs[0]?.data() as Card;
    
    if (card?.comments) {
      for (const comment of card.comments) {
        if (comment.text.toLowerCase().includes(filters.query.toLowerCase())) {
          results.push({
            type: 'comment',
            id: comment.id,
            title: `Comment on "${card.title}"`,
            description: comment.text,
            boardId: card.boardId,
            boardTitle: cardResult.boardTitle,
            listId: card.listId,
            cardId: card.id,
            relevanceScore: 8,
            matchedFields: ['comment'],
            snippet: generateSnippet(comment.text, filters.query),
            createdAt: safeToDate(comment.createdAt),
            updatedAt: safeToDate(comment.updatedAt)
          });
        }
      }
    }
  }
  
  return results;
};

// Helper functions
const shouldSearchBoards = (filters: SearchFilters): boolean => {
  return !filters.labels?.length && 
         !filters.assignees?.length && 
         !filters.dueDateRange && 
         !filters.isOverdue;
};

const matchesCardFilters = (card: Card, filters: SearchFilters): boolean => {
  // Label filter
  if (filters.labels?.length) {
    const cardLabelIds = card.labels?.map(l => l.id) || [];
    const hasMatchingLabel = filters.labels.some(labelId => cardLabelIds.includes(labelId));
    if (!hasMatchingLabel) return false;
  }
  
  // Assignee filter
  if (filters.assignees?.length) {
    const hasMatchingAssignee = filters.assignees.some(assignee => 
      card.assignees?.includes(assignee)
    );
    if (!hasMatchingAssignee) return false;
  }
  
  // Due date range filter
  if (filters.dueDateRange && card.dueDate) {
    const { start, end } = filters.dueDateRange;
    if (card.dueDate < start || card.dueDate > end) return false;
  }
  
  // Overdue filter
  if (filters.isOverdue) {
    if (!card.dueDate || card.dueDate >= new Date()) return false;
  }
  
  // Has attachments filter
  if (filters.hasAttachments) {
    if (!card.attachments?.length) return false;
  }
  
  // Has comments filter
  if (filters.hasComments) {
    if (!card.comments?.length) return false;
  }
  
  // Has checklists filter
  if (filters.hasChecklists) {
    if (!card.checklists?.length) return false;
  }
  
  // Created by filter
  if (filters.createdBy?.length) {
    if (!filters.createdBy.includes(card.createdBy)) return false;
  }
  
  // Date range filters
  if (filters.createdDateRange) {
    const { start, end } = filters.createdDateRange;
    if (card.createdAt < start || card.createdAt > end) return false;
  }
  
  if (filters.updatedDateRange) {
    const { start, end } = filters.updatedDateRange;
    if (card.updatedAt < start || card.updatedAt > end) return false;
  }
  
  return true;
};

const calculateCardRelevance = (card: Card, filters: SearchFilters): number => {
  let score = 0;
  
  if (filters.query) {
    const query = filters.query.toLowerCase();
    
    // Title match (highest priority)
    if (card.title.toLowerCase().includes(query)) {
      score += 15;
    }
    
    // Description match
    if (card.description?.toLowerCase().includes(query)) {
      score += 10;
    }
    
    // Label name match
    if (card.labels?.some(label => label.name.toLowerCase().includes(query))) {
      score += 5;
    }
    
    // Comment match
    if (card.comments?.some(comment => comment.text.toLowerCase().includes(query))) {
      score += 8;
    }
  } else {
    score = 5; // Base score for filter-only searches
  }
  
  // Boost recent items
  const daysSinceUpdate = (Date.now() - card.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) score += 3;
  if (daysSinceUpdate < 1) score += 2;
  
  return score;
};

const getCardMatchedFields = (card: Card, filters: SearchFilters): string[] => {
  const fields: string[] = [];
  
  if (filters.query) {
    const query = filters.query.toLowerCase();
    
    if (card.title.toLowerCase().includes(query)) fields.push('title');
    if (card.description?.toLowerCase().includes(query)) fields.push('description');
    if (card.labels?.some(label => label.name.toLowerCase().includes(query))) fields.push('labels');
    if (card.comments?.some(comment => comment.text.toLowerCase().includes(query))) fields.push('comments');
  }
  
  return fields;
};

const generateSnippet = (text: string, query?: string): string => {
  if (!query || !text) return text.slice(0, 150) + (text.length > 150 ? '...' : '');
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text.slice(0, 150) + (text.length > 150 ? '...' : '');
  
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + query.length + 50);
  
  let snippet = text.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return snippet;
};

// Saved searches
export const saveSavedSearch = async (search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt' | 'useCount' | 'lastUsed'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'savedSearches'), {
    ...search,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    useCount: 0
  });
  return docRef.id;
};

export const getUserSavedSearches = async (userId: string): Promise<SavedSearch[]> => {
  const q = query(
    collection(db, 'savedSearches'),
    where('userId', '==', userId),
    orderBy('lastUsed', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
          return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
        lastUsed: data.lastUsed ? safeToDate(data.lastUsed) : undefined
      } as SavedSearch;
  });
};

export const updateSavedSearchUsage = async (searchId: string): Promise<void> => {
  const docRef = doc(db, 'savedSearches', searchId);
  await updateDoc(docRef, {
    useCount: (await getDocs(query(collection(db, 'savedSearches'), where('__name__', '==', searchId)))).docs[0]?.data()?.useCount + 1 || 1,
    lastUsed: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const deleteSavedSearch = async (searchId: string): Promise<void> => {
  await deleteDoc(doc(db, 'savedSearches', searchId));
};

// Quick filters
export const getDefaultQuickFilters = (): QuickFilter[] => [
  {
    id: 'my-cards',
    name: 'My Cards',
    icon: '👤',
    filters: { assignees: [auth.currentUser?.uid || ''] },
    color: 'blue'
  },
  {
    id: 'overdue',
    name: 'Overdue',
    icon: '⚠️',
    filters: { isOverdue: true },
    color: 'red'
  },
  {
    id: 'due-soon',
    name: 'Due Soon',
    icon: '⏰',
    filters: { 
      dueDateRange: { 
        start: new Date(), 
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      } 
    },
    color: 'yellow'
  },
  {
    id: 'has-attachments',
    name: 'With Files',
    icon: '📎',
    filters: { hasAttachments: true },
    color: 'green'
  },
  {
    id: 'recent',
    name: 'Recent',
    icon: '🕒',
    filters: { 
      updatedDateRange: { 
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
        end: new Date() 
      } 
    },
    color: 'purple'
  }
]; 