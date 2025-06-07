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
  setDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserProfile, UserPreferences, BoardMember, BoardInvitation } from '@/types';
import { sendBoardInvitationEmail, generateInvitationEmailContent } from './emailService';

// User Profile Management
export const createUserProfile = async (
  userId: string, 
  userData: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  const defaultPreferences: UserPreferences = {
    emailNotifications: true,
    pushNotifications: true,
    theme: 'light',
    language: 'en',
    compactMode: false,
    animationsEnabled: true
  };

  const profileData = {
    id: userId,
    email: userData.email || '',
    displayName: userData.displayName || '',
    photoURL: userData.photoURL || '',
    bio: userData.bio || '',
    role: userData.role || 'member',
    joinedAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    preferences: defaultPreferences,
    ...userData
  };

  await setDoc(userRef, profileData);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      joinedAt: data.joinedAt?.toDate() || new Date(),
      lastActive: data.lastActive?.toDate() || new Date(),
    } as UserProfile;
  }
  
  return null;
};

export const updateUserProfile = async (
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  const updateData = {
    ...updates,
    lastActive: serverTimestamp()
  };
  
  await updateDoc(userRef, updateData);
};

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  // Note: This is a simple implementation. For production, consider using 
  // Algolia or similar for better search capabilities
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('displayName'));
  
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      joinedAt: data.joinedAt?.toDate() || new Date(),
      lastActive: data.lastActive?.toDate() || new Date(),
    } as UserProfile;
  });
  
  // Client-side filtering (consider server-side for production)
  return users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Board Invitations
export const createBoardInvitation = async (
  boardId: string,
  boardTitle: string,
  inviteeEmail: string,
  role: 'admin' | 'member' | 'viewer' = 'member'
): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to send invitations');

  const invitationToken = generateInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitationData = {
    boardId,
    boardTitle,
    inviterEmail: currentUser.email || '',
    inviterName: currentUser.displayName || currentUser.email || '',
    inviteeEmail,
    role,
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    token: invitationToken
  };

  const docRef = await addDoc(collection(db, 'boardInvitations'), invitationData);
  
  // Send invitation email
  try {
    const emailSent = await sendBoardInvitationEmail({
      inviteeEmail,
      inviteeName: inviteeEmail.split('@')[0], // Use email username as fallback name
      inviterName: currentUser.displayName || currentUser.email || '',
      inviterEmail: currentUser.email || '',
      boardTitle,
      role,
      invitationToken,
      expiresAt
    });

    if (!emailSent) {
      console.warn('⚠️ Email sending failed, but invitation was created in database');
      
      // Generate email content for manual sending/debugging
      const emailContent = generateInvitationEmailContent({
        inviteeName: inviteeEmail.split('@')[0],
        inviterName: currentUser.displayName || currentUser.email || '',
        inviterEmail: currentUser.email || '',
        boardTitle,
        role,
        invitationToken,
        expiresAt
      });
      
      console.log('📧 Email content for manual sending:', emailContent);
    }
  } catch (error) {
    console.error('❌ Error sending invitation email:', error);
    // Don't fail the invitation creation if email fails
  }
  
  return docRef.id;
};

export const getBoardInvitations = async (boardId: string): Promise<BoardInvitation[]> => {
  const q = query(
    collection(db, 'boardInvitations'),
    where('boardId', '==', boardId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
    } as BoardInvitation;
  });
};

export const getInvitationByToken = async (token: string): Promise<BoardInvitation | null> => {
  const q = query(
    collection(db, 'boardInvitations'),
    where('token', '==', token)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0]; // Should only be one invitation per token
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate() || new Date(),
  } as BoardInvitation;
};

export const getUserInvitations = async (userEmail: string): Promise<BoardInvitation[]> => {
  const q = query(
    collection(db, 'boardInvitations'),
    where('inviteeEmail', '==', userEmail),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
    } as BoardInvitation;
  });
};

export const acceptBoardInvitation = async (invitationId: string): Promise<void> => {
  const invitationRef = doc(db, 'boardInvitations', invitationId);
  await updateDoc(invitationRef, {
    status: 'accepted',
    acceptedAt: serverTimestamp()
  });
};

export const declineBoardInvitation = async (invitationId: string): Promise<void> => {
  const invitationRef = doc(db, 'boardInvitations', invitationId);
  await updateDoc(invitationRef, {
    status: 'declined',
    declinedAt: serverTimestamp()
  });
};

// Board Members Management
export const addBoardMember = async (
  boardId: string, 
  member: Omit<BoardMember, 'joinedAt'>
): Promise<void> => {
  // This will be handled when updating the board document
  // We'll implement this in the boardService update
  console.log('Adding board member:', { boardId, member });
};

export const removeBoardMember = async (
  boardId: string, 
  userId: string
): Promise<void> => {
  // This will be handled when updating the board document
  console.log('Removing board member:', { boardId, userId });
};

export const updateBoardMemberRole = async (
  boardId: string, 
  userId: string, 
  newRole: 'admin' | 'member' | 'viewer'
): Promise<void> => {
  // This will be handled when updating the board document
  console.log('Updating member role:', { boardId, userId, newRole });
};

// Utility functions
const generateInvitationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const getUsersByIds = async (userIds: string[]): Promise<UserProfile[]> => {
  if (userIds.length === 0) return [];
  
  const users: UserProfile[] = [];
  
  // Firestore 'in' queries are limited to 10 items, so we batch them
  const batches = [];
  for (let i = 0; i < userIds.length; i += 10) {
    batches.push(userIds.slice(i, i + 10));
  }
  
  for (const batch of batches) {
    const q = query(
      collection(db, 'users'),
      where('id', 'in', batch)
    );
    
    const querySnapshot = await getDocs(q);
    const batchUsers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        lastActive: data.lastActive?.toDate() || new Date(),
      } as UserProfile;
    });
    
    users.push(...batchUsers);
  }
  
  return users;
};

// Avatar utilities
export const getAvatarUrl = (user: UserProfile): string => {
  if (user.photoURL) {
    return user.photoURL;
  }
  
  // Fallback to Gravatar
  const email = user.email.toLowerCase().trim();
  const hash = btoa(email); // Simple hash, consider using crypto for production
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=40`;
};

export const getUserInitials = (user: UserProfile | { displayName?: string; email: string }): string => {
  if (!user) {
    return 'U';
  }
  
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  
  return 'U';
}; 