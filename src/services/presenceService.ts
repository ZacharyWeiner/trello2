import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserPresence, BoardPresence } from '@/types';

// Track user presence on a board
export const updateUserPresence = async (
  boardId: string,
  cardId?: string,
  cursor?: { x: number; y: number }
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ No user authenticated for presence update');
    return;
  }

  const presenceRef = doc(db, 'presence', `${boardId}_${user.uid}`);
  
  const presenceData = {
    userId: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email || '',
    photoURL: user.photoURL || '',
    lastSeen: serverTimestamp(),
    isOnline: true,
    currentBoard: boardId,
    currentCard: cardId || null,
    cursor: cursor || null,
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(presenceRef, presenceData);
    console.log('✅ Presence updated for user:', user.displayName || user.email);
  } catch (error) {
    console.error('❌ Error updating presence:', error);
  }
};

// Remove user presence when they leave
export const removeUserPresence = async (boardId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  const presenceRef = doc(db, 'presence', `${boardId}_${user.uid}`);
  await deleteDoc(presenceRef);
};

// Subscribe to presence updates for a board
export const subscribeToPresence = (
  boardId: string,
  callback: (users: UserPresence[]) => void
): (() => void) => {
  const presenceRef = collection(db, 'presence');
  const q = query(
    presenceRef,
    where('currentBoard', '==', boardId),
    orderBy('lastSeen', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        lastSeen: data.lastSeen?.toDate() || new Date(),
      } as UserPresence;
    }).filter(user => {
      // Filter out users who haven't been seen in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return user.lastSeen > fiveMinutesAgo;
    });
    
    callback(users);
  }, (error) => {
    console.error('Error listening to presence updates:', error);
    callback([]);
  });
};

// Track card activity (viewing/editing)
export const updateCardActivity = async (
  cardId: string,
  action: 'viewing' | 'editing' | 'commenting'
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  const activityRef = doc(db, 'cardActivity', `${cardId}_${user.uid}`);
  
  const activityData = {
    cardId,
    userId: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email || '',
    photoURL: user.photoURL || '',
    action,
    timestamp: serverTimestamp()
  };

  await setDoc(activityRef, activityData);
  
  // Auto-remove after 30 seconds for viewing, 2 minutes for editing
  const timeout = action === 'viewing' ? 30000 : 120000;
  setTimeout(async () => {
    try {
      await deleteDoc(activityRef);
    } catch (error) {
      // Ignore errors - document might already be deleted
    }
  }, timeout);
};

// Subscribe to card activity
export const subscribeToCardActivity = (
  cardId: string,
  callback: (activities: any[]) => void
): (() => void) => {
  const activityRef = collection(db, 'cardActivity');
  const q = query(
    activityRef,
    where('cardId', '==', cardId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });
    
    callback(activities);
  }, (error) => {
    console.error('Error listening to card activity:', error);
    callback([]);
  });
};

// Heartbeat to keep presence alive
export const startPresenceHeartbeat = (boardId: string): (() => void) => {
  const interval = setInterval(() => {
    updateUserPresence(boardId);
  }, 30000); // Update every 30 seconds

  // Cleanup function
  return () => {
    clearInterval(interval);
    removeUserPresence(boardId);
  };
}; 