import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Board, List, Card, BoardMember } from '@/types';
import { cleanFirestoreData, convertFirestoreDate } from '@/utils/firestore';

// Board operations
export const createBoard = async (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'members'>): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to create boards');

  // Create initial board member (creator as admin)
  const creatorMember: BoardMember = {
    userId: currentUser.uid,
    email: currentUser.email || '',
    displayName: currentUser.displayName || currentUser.email || '',
    photoURL: currentUser.photoURL || '',
    role: 'admin',
    joinedAt: new Date(),
    invitedBy: currentUser.uid
  };

  const docRef = await addDoc(collection(db, 'boards'), {
    ...board,
    members: [creatorMember],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getBoard = async (boardId: string): Promise<Board | null> => {
  const docRef = doc(db, 'boards', boardId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertFirestoreDate(data.createdAt) || new Date(),
      updatedAt: convertFirestoreDate(data.updatedAt) || new Date(),
      members: data.members?.map((member: any) => ({
        ...member,
        joinedAt: convertFirestoreDate(member.joinedAt) || new Date()
      })) || []
    } as Board;
  }
  
  return null;
};

export const getUserBoards = async (userId: string): Promise<Board[]> => {
  // For now, get all boards and filter client-side
  // In production, you'd want to create a proper index for user membership queries
  const allBoardsQuery = query(collection(db, 'boards'));
  const querySnapshot = await getDocs(allBoardsQuery);
  
  const boards = querySnapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: convertFirestoreDate(data.createdAt) || new Date(),
        updatedAt: convertFirestoreDate(data.updatedAt) || new Date(),
        members: data.members?.map((member: any) => ({
          ...member,
          joinedAt: convertFirestoreDate(member.joinedAt) || new Date()
        })) || []
      } as Board;
    })
    .filter(board => {
      // Check if user is a member of this board
      const isMember = board.members.some(member => member.userId === userId);
      const isCreator = board.createdBy === userId; // Fallback for old boards
      
      return isMember || isCreator;
    });
  
  // Sort manually by updatedAt
  return boards.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

export const updateBoard = async (boardId: string, updates: Partial<Board>): Promise<void> => {
  const docRef = doc(db, 'boards', boardId);
  
  // Handle member updates specially
  const updateData: any = { ...updates };
  
  if (updates.members) {
    updateData.members = updates.members.map(member => ({
      ...member,
      joinedAt: member.joinedAt instanceof Date ? Timestamp.fromDate(member.joinedAt) : member.joinedAt
    }));
  }
  
  updateData.updatedAt = serverTimestamp();
  
  await updateDoc(docRef, updateData);
};

export const deleteBoard = async (boardId: string): Promise<void> => {
  // Delete all lists and cards associated with the board
  const lists = await getBoardLists(boardId);
  for (const list of lists) {
    await deleteList(list.id);
  }
  
  const docRef = doc(db, 'boards', boardId);
  await deleteDoc(docRef);
};

// Board Member Management
export const addBoardMember = async (
  boardId: string, 
  member: Omit<BoardMember, 'joinedAt'>
): Promise<void> => {
  const board = await getBoard(boardId);
  if (!board) throw new Error('Board not found');

  // Check if user is already a member
  const existingMember = board.members.find(m => m.userId === member.userId);
  if (existingMember) {
    throw new Error('User is already a member of this board');
  }

  const newMember: BoardMember = {
    ...member,
    joinedAt: new Date()
  };

  const updatedMembers = [...board.members, newMember];
  await updateBoard(boardId, { members: updatedMembers });
};

export const removeBoardMember = async (
  boardId: string, 
  userId: string
): Promise<void> => {
  const board = await getBoard(boardId);
  if (!board) throw new Error('Board not found');

  // Don't allow removing the last admin
  const admins = board.members.filter(m => m.role === 'admin');
  const memberToRemove = board.members.find(m => m.userId === userId);
  
  if (memberToRemove?.role === 'admin' && admins.length === 1) {
    throw new Error('Cannot remove the last admin from the board');
  }

  const updatedMembers = board.members.filter(m => m.userId !== userId);
  await updateBoard(boardId, { members: updatedMembers });
};

export const updateBoardMemberRole = async (
  boardId: string, 
  userId: string, 
  newRole: 'admin' | 'member' | 'viewer'
): Promise<void> => {
  const board = await getBoard(boardId);
  if (!board) throw new Error('Board not found');

  // Don't allow changing the last admin's role
  const admins = board.members.filter(m => m.role === 'admin');
  const memberToUpdate = board.members.find(m => m.userId === userId);
  
  if (memberToUpdate?.role === 'admin' && admins.length === 1 && newRole !== 'admin') {
    throw new Error('Cannot change the role of the last admin');
  }

  const updatedMembers = board.members.map(member => 
    member.userId === userId 
      ? { ...member, role: newRole }
      : member
  );
  
  await updateBoard(boardId, { members: updatedMembers });
};

export const getBoardMembers = async (boardId: string): Promise<BoardMember[]> => {
  const board = await getBoard(boardId);
  return board?.members || [];
};

// Check if user has permission to perform action on board
export const checkBoardPermission = async (
  boardId: string, 
  userId: string, 
  requiredRole: 'viewer' | 'member' | 'admin' = 'viewer'
): Promise<boolean> => {
  const board = await getBoard(boardId);
  if (!board) return false;

  const member = board.members.find(m => m.userId === userId);
  if (!member) return false;

  const roleHierarchy = { viewer: 0, member: 1, admin: 2 };
  return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
};

// List operations
export const createList = async (list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'lists'), {
    ...list,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getBoardLists = async (boardId: string): Promise<List[]> => {
  const q = query(
    collection(db, 'lists'),
    where('boardId', '==', boardId)
    // Temporarily removed orderBy to avoid index requirement
    // orderBy('position', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  const lists = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as List;
  });
  
  // Sort manually by position
  return lists.sort((a, b) => (a.position || 0) - (b.position || 0));
};

export const updateList = async (listId: string, updates: Partial<List>): Promise<void> => {
  const docRef = doc(db, 'lists', listId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteList = async (listId: string): Promise<void> => {
  // Delete all cards in the list
  const cards = await getListCards(listId);
  for (const card of cards) {
    await deleteCard(card.id);
  }
  
  const docRef = doc(db, 'lists', listId);
  await deleteDoc(docRef);
};

// Card operations
export const createCard = async (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'cards'), {
    ...card,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getListCards = async (listId: string): Promise<Card[]> => {
  const q = query(
    collection(db, 'cards'),
    where('listId', '==', listId)
    // Removed archived filter - we'll filter manually to handle cards without archived field
    // Temporarily removed orderBy to avoid index requirement
    // orderBy('position', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  const cards = querySnapshot.docs.map(doc => {
    const data = doc.data();
    
    // Convert Firebase Timestamps back to Date objects
    const card: Card = {
      id: doc.id,
      ...data,
      createdAt: convertFirestoreDate(data.createdAt) || new Date(),
      updatedAt: convertFirestoreDate(data.updatedAt) || new Date(),
      dueDate: convertFirestoreDate(data.dueDate),
      archivedAt: convertFirestoreDate(data.archivedAt),
    } as Card;
    
    // Handle checklists deserialization
    if (data.checklists) {
      card.checklists = data.checklists.map((checklist: any) => ({
        ...checklist,
        createdAt: convertFirestoreDate(checklist.createdAt) || new Date(),
        updatedAt: convertFirestoreDate(checklist.updatedAt) || new Date(),
        items: (checklist.items || []).map((item: any) => ({
          ...item,
          createdAt: convertFirestoreDate(item.createdAt) || new Date(),
          updatedAt: convertFirestoreDate(item.updatedAt) || new Date(),
        }))
      }));
    }
    
    // Handle comments deserialization  
    if (data.comments) {
      card.comments = data.comments.map((comment: any) => ({
        ...comment,
        createdAt: convertFirestoreDate(comment.createdAt) || new Date(),
        updatedAt: convertFirestoreDate(comment.updatedAt) || new Date(),
      }));
    }
    
    // Handle attachments deserialization
    if (data.attachments) {
      card.attachments = data.attachments.map((attachment: any) => ({
        ...attachment,
        uploadedAt: convertFirestoreDate(attachment.uploadedAt) || new Date(),
      }));
    }
    
    // Handle labels deserialization
    if (data.labels) {
      card.labels = data.labels;
    }
    
    // Handle cover
    if (data.cover) {
      card.cover = data.cover;
    }
    
    // Handle assignees
    if (data.assignees) {
      card.assignees = data.assignees;
    }
    
    // Handle video links with proper date conversion
    if (data.videoLinks) {
      card.videoLinks = data.videoLinks.map((link: any) => ({
        ...link,
        createdAt: convertFirestoreDate(link.createdAt) || new Date()
      })).filter((link: any) => link.id && link.url);
    }
    
    return card;
  })
  .filter(card => !card.archived); // Filter out archived cards manually
  
  // Sort manually by position
  return cards.sort((a, b) => (a.position || 0) - (b.position || 0));
};

export const updateCard = async (cardId: string, updates: Partial<Card>): Promise<void> => {
  const docRef = doc(db, 'cards', cardId);
  
  // Prepare updates for Firebase - handle complex nested objects
  const firebaseUpdates: any = { ...updates };
  
  // Convert Date objects to Timestamps for Firebase
  if (updates.dueDate !== undefined) {
    firebaseUpdates.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
  }
  
  // Ensure nested objects are properly serialized
  if (updates.checklists) {
    firebaseUpdates.checklists = updates.checklists.map(checklist => ({
      ...checklist,
      createdAt: checklist.createdAt instanceof Date ? Timestamp.fromDate(checklist.createdAt) : checklist.createdAt,
      updatedAt: checklist.updatedAt instanceof Date ? Timestamp.fromDate(checklist.updatedAt) : checklist.updatedAt,
      items: (checklist.items || []).map(item => ({
        ...item,
        createdAt: item.createdAt instanceof Date ? Timestamp.fromDate(item.createdAt) : item.createdAt,
        updatedAt: item.updatedAt instanceof Date ? Timestamp.fromDate(item.updatedAt) : item.updatedAt,
      }))
    }));
  }
  
  if (updates.comments) {
    firebaseUpdates.comments = updates.comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Date ? Timestamp.fromDate(comment.createdAt) : comment.createdAt,
      updatedAt: comment.updatedAt instanceof Date ? Timestamp.fromDate(comment.updatedAt) : comment.updatedAt,
    }));
  }
  
  // Handle attachments array
  if (updates.attachments) {
    firebaseUpdates.attachments = updates.attachments.map(attachment => ({
      ...attachment,
      uploadedAt: attachment.uploadedAt instanceof Date ? Timestamp.fromDate(attachment.uploadedAt) : attachment.uploadedAt,
    }));
  }
  
  // Handle labels array
  if (updates.labels !== undefined) {
    firebaseUpdates.labels = updates.labels || [];
  }
  
  // Handle cover
  if (updates.cover !== undefined) {
    firebaseUpdates.cover = updates.cover;
  }
  
  // Handle assignees array
  if (updates.assignees !== undefined) {
    firebaseUpdates.assignees = updates.assignees || [];
  }
  
  // Handle video links array
  if (updates.videoLinks !== undefined) {
    firebaseUpdates.videoLinks = (updates.videoLinks || []).map(link => ({
      ...link,
      createdAt: link.createdAt instanceof Date ? Timestamp.fromDate(link.createdAt) : link.createdAt
    }));
  }
  
  firebaseUpdates.updatedAt = serverTimestamp();
  
  console.log('🔥 Firebase updateCard - cardId:', cardId, 'updates:', firebaseUpdates);
  
  // Clean the data to remove undefined values before sending to Firestore
  const cleanedUpdates = cleanFirestoreData(firebaseUpdates);
  
  console.log('🧹 Cleaned updates for Firestore:', cleanedUpdates);
  
  await updateDoc(docRef, cleanedUpdates);
};

export const deleteCard = async (cardId: string): Promise<void> => {
  const docRef = doc(db, 'cards', cardId);
  await deleteDoc(docRef);
};

export const moveCard = async (
  cardId: string, 
  newListId: string, 
  newPosition: number
): Promise<void> => {
  // Get the list to check if it's a "done" list
  const listDoc = await getDoc(doc(db, 'lists', newListId));
  const list = listDoc.data();
  
  // Get the card to check completion status
  const cardDoc = await getDoc(doc(db, 'cards', cardId));
  const card = cardDoc.data();
  
  await updateCard(cardId, {
    listId: newListId,
    position: newPosition,
  });
  
  // Track achievement and trigger celebration if moved to a "done" list
  if (list && card && (list.listType === 'done' || list.title?.toLowerCase().includes('done') || list.title?.toLowerCase().includes('completed'))) {
    const { AchievementService } = await import('./achievementService');
    
    // Check if all checklists are complete
    const allChecklistsComplete = card.checklists?.every((checklist: any) => 
      (checklist.items || []).every((item: any) => item.completed)
    ) ?? true;
    
    await AchievementService.trackTaskCompletion(
      card.createdBy,
      cardId,
      new Date(),
      {
        hadDueDate: !!card.dueDate,
        wasBeforeDueDate: card.dueDate ? new Date(card.dueDate) > new Date() : false,
        checklistsComplete: allChecklistsComplete
      }
    );

    // Trigger celebration for task completion
    if (typeof window !== 'undefined') {
      const { celebrate, CelebrationTemplates } = await import('../components/celebrations/CelebrationSystem');
      
      // Determine celebration intensity based on task characteristics
      let intensity: 'low' | 'medium' | 'high' | 'epic' = 'medium';
      
      if (allChecklistsComplete && card.dueDate && new Date(card.dueDate) > new Date()) {
        intensity = 'high'; // Perfect completion (on time + all checklists)
      } else if (card.dueDate && new Date(card.dueDate) < new Date()) {
        intensity = 'low'; // Late completion
      } else if (allChecklistsComplete) {
        intensity = 'medium'; // Good completion
      }
      
      // Check if this is the first task of the day
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isFirstTaskOfDay = card.createdAt && new Date(card.createdAt) >= startOfDay;
      
      if (isFirstTaskOfDay) {
        celebrate(CelebrationTemplates.firstTaskOfDay());
      } else {
        celebrate(CelebrationTemplates.taskComplete(card.title || 'Task'));
      }
    }
  }
};

// Migration function to convert old boards to new member structure
export const migrateBoardMembers = async (boardId: string): Promise<void> => {
  const board = await getBoard(boardId);
  if (!board) return;

  // Check if board already has proper member structure
  if (board.members && board.members.length > 0 && typeof board.members[0] === 'object' && 'userId' in board.members[0]) {
    console.log('Board already migrated:', boardId);
    return;
  }

  // Get current user for migration
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  // Convert old string array to BoardMember objects
  const oldMembers = board.members as any;
  const newMembers: BoardMember[] = [];

  if (Array.isArray(oldMembers)) {
    for (const memberId of oldMembers) {
      if (typeof memberId === 'string') {
        // Create BoardMember object
        const member: BoardMember = {
          userId: memberId,
          email: memberId === currentUser.uid ? (currentUser.email || '') : '',
          displayName: memberId === currentUser.uid ? (currentUser.displayName || currentUser.email || '') : '',
          photoURL: memberId === currentUser.uid ? (currentUser.photoURL || '') : '',
          role: memberId === board.createdBy ? 'admin' : 'member',
          joinedAt: new Date(),
          invitedBy: board.createdBy || memberId
        };
        newMembers.push(member);
      }
    }
  }

  // If no members found, add the creator as admin
  if (newMembers.length === 0 && board.createdBy) {
    const creatorMember: BoardMember = {
      userId: board.createdBy,
      email: board.createdBy === currentUser.uid ? (currentUser.email || '') : '',
      displayName: board.createdBy === currentUser.uid ? (currentUser.displayName || currentUser.email || '') : '',
      photoURL: board.createdBy === currentUser.uid ? (currentUser.photoURL || '') : '',
      role: 'admin',
      joinedAt: new Date(),
      invitedBy: board.createdBy
    };
    newMembers.push(creatorMember);
  }

  // Update the board with new member structure
  if (newMembers.length > 0) {
    await updateBoard(boardId, { members: newMembers });
    console.log('✅ Migrated board members for board:', boardId);
  }
};

// Migrate all user boards
export const migrateAllUserBoards = async (userId: string): Promise<void> => {
  console.log('🔄 Starting board migration for user:', userId);
  
  // Get all boards (including old format ones)
  const allBoardsQuery = query(collection(db, 'boards'));
  const querySnapshot = await getDocs(allBoardsQuery);
  
  const userBoards = querySnapshot.docs.filter(doc => {
    const data = doc.data();
    // Check if user is creator or in old members array
    return data.createdBy === userId || 
           (Array.isArray(data.members) && data.members.includes(userId));
  });

  console.log(`Found ${userBoards.length} boards to potentially migrate`);

  for (const boardDoc of userBoards) {
    try {
      await migrateBoardMembers(boardDoc.id);
    } catch (error) {
      console.error('Error migrating board:', boardDoc.id, error);
    }
  }

  console.log('✅ Board migration completed');
};

// Real-time listeners
export const subscribeToBoardUpdates = (
  boardId: string, 
  callback: (board: Board | null) => void
): (() => void) => {
  const boardRef = doc(db, 'boards', boardId);
  
  return onSnapshot(boardRef, (doc: DocumentSnapshot) => {
    if (doc.exists()) {
      const data = doc.data();
      const board: Board = {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreDate(data.createdAt) || new Date(),
        updatedAt: convertFirestoreDate(data.updatedAt) || new Date(),
        members: data.members || [],
        labels: data.labels || []
      } as Board;
      callback(board);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to board updates:', error);
    callback(null);
  });
};

export const subscribeToListsUpdates = (
  boardId: string,
  callback: (lists: List[]) => void
): (() => void) => {
  const listsRef = collection(db, 'lists');
  const q = query(
    listsRef,
    where('boardId', '==', boardId)
    // Removed orderBy to avoid index requirement - will sort manually
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const lists = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreDate(data.createdAt) || new Date(),
        updatedAt: convertFirestoreDate(data.updatedAt) || new Date(),
      } as List;
    });
    
    // Sort manually by position
    const sortedLists = lists.sort((a, b) => (a.position || 0) - (b.position || 0));
    callback(sortedLists);
  }, (error) => {
    console.error('Error listening to lists updates:', error);
    callback([]);
  });
};

export const subscribeToCardsUpdates = (
  listId: string,
  callback: (cards: Card[]) => void
): (() => void) => {
  const cardsRef = collection(db, 'cards');
  const q = query(
    cardsRef,
    where('listId', '==', listId)
    // Removed archived filter - we'll filter manually to handle cards without archived field
    // Removed orderBy to avoid index requirement - will sort manually
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    console.log(`🔄 Cards snapshot received for list ${listId}:`, snapshot.docs.length, 'cards');
    
    const cards = snapshot.docs.map(doc => {
      const data = doc.data();
      const card = {
        ...data,
        id: doc.id,
        createdAt: convertFirestoreDate(data.createdAt) || new Date(),
        updatedAt: convertFirestoreDate(data.updatedAt) || new Date(),
        dueDate: convertFirestoreDate(data.dueDate),
        archivedAt: convertFirestoreDate(data.archivedAt),
        checklists: data.checklists || [],
        comments: (data.comments || []).map((comment: any) => ({
          ...comment,
          createdAt: convertFirestoreDate(comment.createdAt) || new Date(),
          updatedAt: convertFirestoreDate(comment.updatedAt) || new Date(),
        })),
        attachments: data.attachments || [],
        assignees: data.assignees || [],
        labels: data.labels || [],
        // Handle video links with proper date conversion
        videoLinks: (data.videoLinks || []).map((link: any) => ({
          ...link,
          createdAt: convertFirestoreDate(link.createdAt) || new Date()
        })).filter((link: any) => link.id && link.url)
      } as Card;
      
      // Log checklist info for debugging
      if (card.checklists && card.checklists.length > 0) {
        console.log(`📋 Card "${card.title}" has ${card.checklists.length} checklists:`, 
          card.checklists.map(c => ({ 
            title: c.title, 
            items: (c.items || []).length,
            completed: (c.items || []).filter(i => i.completed).length 
          }))
        );
      }
      
      return card;
    })
    .filter(card => !card.archived); // Filter out archived cards manually
    
    // Sort manually by position
    const sortedCards = cards.sort((a, b) => (a.position || 0) - (b.position || 0));
    callback(sortedCards);
  }, (error) => {
    console.error('Error listening to cards updates:', error);
    callback([]);
  });
}; 