import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Notification, BoardMember } from '@/types';
import { sendBoardInvitationEmail } from './emailService';

export class NotificationService {
  /**
   * Create a mention notification
   */
  static async createMentionNotification(
    mentionedUserId: string,
    mentionerUserId: string,
    mentionerName: string,
    cardId: string,
    cardTitle: string,
    boardId: string,
    boardTitle: string,
    commentText: string
  ): Promise<void> {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId: mentionedUserId,
        type: 'comment_mention',
        title: `${mentionerName} mentioned you`,
        message: `You were mentioned in a comment on "${cardTitle}"`,
        data: {
          cardId,
          cardTitle,
          boardId,
          boardTitle,
          mentionerUserId,
          mentionerName,
          commentText: commentText.substring(0, 100) + (commentText.length > 100 ? '...' : '')
        },
        read: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      console.log('✅ Mention notification created for user:', mentionedUserId);
    } catch (error) {
      console.error('❌ Error creating mention notification:', error);
      throw error;
    }
  }

  /**
   * Create multiple mention notifications
   */
  static async createMentionNotifications(
    mentionedUserIds: string[],
    mentionerUserId: string,
    mentionerName: string,
    cardId: string,
    cardTitle: string,
    boardId: string,
    boardTitle: string,
    commentText: string,
    boardMembers: BoardMember[]
  ): Promise<void> {
    // Filter out the mentioner from being notified
    const filteredUserIds = mentionedUserIds.filter(id => id !== mentionerUserId);
    
    // Validate that mentioned users are board members
    const memberIds = new Set(boardMembers.map(m => m.userId));
    const validUserIds = filteredUserIds.filter(id => memberIds.has(id));

    const promises = validUserIds.map(userId =>
      this.createMentionNotification(
        userId,
        mentionerUserId,
        mentionerName,
        cardId,
        cardTitle,
        boardId,
        boardTitle,
        commentText
      )
    );

    await Promise.all(promises);
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    limitCount: number = 50
  ): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Notification;
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const promises = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Create card assignment notification
   */
  static async createCardAssignmentNotification(
    assignedUserId: string,
    assignerUserId: string,
    assignerName: string,
    cardId: string,
    cardTitle: string,
    boardId: string,
    boardTitle: string
  ): Promise<void> {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId: assignedUserId,
        type: 'card_assigned',
        title: `${assignerName} assigned you to a card`,
        message: `You were assigned to "${cardTitle}"`,
        data: {
          cardId,
          cardTitle,
          boardId,
          boardTitle,
          assignerUserId,
          assignerName
        },
        read: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      console.log('✅ Card assignment notification created for user:', assignedUserId);
    } catch (error) {
      console.error('❌ Error creating card assignment notification:', error);
      throw error;
    }
  }

  /**
   * Create due date notification
   */
  static async createDueDateNotification(
    userId: string,
    cardId: string,
    cardTitle: string,
    boardId: string,
    boardTitle: string,
    dueDate: Date
  ): Promise<void> {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId,
        type: 'card_due',
        title: 'Card due soon',
        message: `"${cardTitle}" is due on ${dueDate.toLocaleDateString()}`,
        data: {
          cardId,
          cardTitle,
          boardId,
          boardTitle,
          dueDate: dueDate.toISOString()
        },
        read: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      console.log('✅ Due date notification created for user:', userId);
    } catch (error) {
      console.error('❌ Error creating due date notification:', error);
      throw error;
    }
  }
} 