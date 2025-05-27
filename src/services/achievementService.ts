import { db } from '@/lib/firebase';
import { 
  doc, 
  collection, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { 
  UserAchievements, 
  Achievement, 
  Streak, 
  UserStats, 
  LeaderboardEntry,
  Leaderboard,
  AchievementNotification,
  Badge
} from '@/types';
import { ACHIEVEMENTS } from '@/data/achievements';

export class AchievementService {
  // Initialize user achievements
  static async initializeUserAchievements(userId: string): Promise<void> {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const existingDoc = await getDoc(userAchievementsRef);
    
    if (!existingDoc.exists()) {
      const initialAchievements: UserAchievements = {
        userId,
        totalPoints: 0,
        level: 1,
        badges: [],
        streaks: [
          {
            type: 'daily_tasks',
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
            startDate: new Date()
          }
        ],
        milestones: [],
        stats: {
          tasksCompleted: 0,
          tasksCompletedToday: 0,
          cardsCreated: 0,
          cardsHelped: 0,
          commentsPosted: 0,
          checklistsCompleted: 0,
          averageCompletionTime: 0,
          earlyCompletions: 0,
          collaborationScore: 0,
          consistencyScore: 0,
          onTimeCompletions: 0,
          perfectCards: 0,
          organizedCards: 0,
          detailedCards: 0,
          uniqueMentions: 0,
          mentionsCount: 0
        },
        lastUpdated: new Date()
      };
      
      await setDoc(userAchievementsRef, {
        ...initialAchievements,
        lastUpdated: serverTimestamp()
      });
    }
  }

  // Track task completion
  static async trackTaskCompletion(
    userId: string, 
    cardId: string,
    completedAt: Date = new Date(),
    metadata?: {
      hadDueDate?: boolean;
      wasBeforeDueDate?: boolean;
      checklistsComplete?: boolean;
      completionTimeHours?: number;
    }
  ): Promise<Achievement[]> {
    await this.initializeUserAchievements(userId);
    
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const hour = completedAt.getHours();
    const isEarly = hour < 9;
    const isLate = hour >= 22;
    
    // Update stats
    const updates: any = {
      'stats.tasksCompleted': increment(1),
      'stats.tasksCompletedToday': increment(1),
      lastUpdated: serverTimestamp()
    };
    
    if (isEarly) {
      updates['stats.earlyCompletions'] = increment(1);
    }
    
    if (metadata?.wasBeforeDueDate) {
      updates['stats.onTimeCompletions'] = increment(1);
    }
    
    await updateDoc(userAchievementsRef, updates);
    
    // Update streak
    await this.updateStreak(userId, 'daily_tasks');
    
    // Check for new achievements
    const newAchievements = await this.checkAchievements(userId);
    
    // Trigger celebrations for new achievements
    if (typeof window !== 'undefined' && newAchievements.length > 0) {
      const { celebrate } = await import('../components/celebrations/CelebrationSystem');
      
      for (const achievement of newAchievements) {
        let intensity: 'low' | 'medium' | 'high' | 'epic' = 'medium';
        
        // Set intensity based on achievement rarity
        switch (achievement.rarity) {
          case 'legendary':
            intensity = 'epic';
            break;
          case 'epic':
            intensity = 'high';
            break;
          case 'rare':
            intensity = 'medium';
            break;
          default:
            intensity = 'low';
        }
        
        celebrate({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `${achievement.name} - ${achievement.points} points! 🏆`,
          intensity,
          duration: intensity === 'epic' ? 8000 : 5000
        });
      }
    }
    
    return newAchievements;
  }

  // Track card creation
  static async trackCardCreation(
    userId: string,
    metadata?: {
      hasLabels?: boolean;
      hasDueDate?: boolean;
      descriptionLength?: number;
    }
  ): Promise<Achievement[]> {
    await this.initializeUserAchievements(userId);
    
    const updates: any = {
      'stats.cardsCreated': increment(1),
      lastUpdated: serverTimestamp()
    };
    
    if (metadata?.hasLabels && metadata?.hasDueDate) {
      updates['stats.organizedCards'] = increment(1);
    }
    
    if (metadata?.descriptionLength && metadata.descriptionLength >= 100) {
      updates['stats.detailedCards'] = increment(1);
    }
    
    await updateDoc(doc(db, 'userAchievements', userId), updates);
    
    return await this.checkAchievements(userId);
  }

  // Track collaboration
  static async trackCollaboration(
    userId: string,
    type: 'comment' | 'checklist' | 'attachment' | 'mention',
    cardId: string,
    metadata?: {
      mentionedUsers?: string[];
      isHelpful?: boolean;
    }
  ): Promise<Achievement[]> {
    await this.initializeUserAchievements(userId);
    
    const updates: any = {
      lastUpdated: serverTimestamp()
    };
    
    switch (type) {
      case 'comment':
        updates['stats.commentsPosted'] = increment(1);
        updates['stats.collaborationScore'] = increment(2);
        break;
      case 'checklist':
        updates['stats.checklistsCompleted'] = increment(1);
        updates['stats.collaborationScore'] = increment(1);
        break;
      case 'mention':
        if (metadata?.mentionedUsers) {
          updates['stats.mentionsCount'] = increment(metadata.mentionedUsers.length);
          updates['stats.collaborationScore'] = increment(metadata.mentionedUsers.length);
        }
        break;
    }
    
    // Track cards helped
    const cardHelpRef = doc(db, 'userCardInteractions', `${userId}_${cardId}`);
    await setDoc(cardHelpRef, {
      userId,
      cardId,
      lastInteraction: serverTimestamp(),
      interactionTypes: {
        [type]: true
      }
    }, { merge: true });
    
    await updateDoc(doc(db, 'userAchievements', userId), updates);
    
    return await this.checkAchievements(userId);
  }

  // Update streak
  static async updateStreak(userId: string, streakType: 'daily_tasks'): Promise<void> {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const userAchievements = await getDoc(userAchievementsRef);
    
    if (!userAchievements.exists()) return;
    
    const rawData = userAchievements.data();
    
    // Ensure streaks is an array
    const streaks = Array.isArray(rawData.streaks) ? rawData.streaks : [];
    
    const streak = streaks.find(s => s.type === streakType);
    
    if (!streak) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = new Date(streak.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    let newCurrentStreak = streak.currentStreak;
    
    if (daysDiff === 0) {
      // Activity already recorded today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day - increment streak
      newCurrentStreak = streak.currentStreak + 1;
    } else {
      // Streak broken - reset to 1
      newCurrentStreak = 1;
    }
    
    const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
    
    await updateDoc(userAchievementsRef, {
      [`streaks.${streaks.indexOf(streak)}`]: {
        ...streak,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: new Date()
      },
      'stats.consistencyScore': increment(newCurrentStreak),
      lastUpdated: serverTimestamp()
    });
  }

  // Check for new achievements
  static async checkAchievements(userId: string): Promise<Achievement[]> {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const userAchievements = await getDoc(userAchievementsRef);
    
    if (!userAchievements.exists()) return [];
    
    const rawData = userAchievements.data();
    
    // Ensure proper data structure
    const data: UserAchievements = {
      ...rawData,
      streaks: Array.isArray(rawData.streaks) ? rawData.streaks : [],
      badges: Array.isArray(rawData.badges) ? rawData.badges : [],
      milestones: Array.isArray(rawData.milestones) ? rawData.milestones : [],
      stats: rawData.stats || {},
      totalPoints: rawData.totalPoints || 0,
      level: rawData.level || 1,
      userId: rawData.userId,
      lastUpdated: rawData.lastUpdated?.toDate ? rawData.lastUpdated.toDate() : new Date()
    } as UserAchievements;
    
    const unlockedAchievements: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (data.badges.some(b => b.achievementId === achievement.id)) {
        continue;
      }
      
      const isUnlocked = await this.checkAchievementCriteria(achievement, data, userId);
      
      if (isUnlocked) {
        // Unlock the achievement
        const badge: Badge = {
          achievementId: achievement.id,
          unlockedAt: new Date(),
          progress: achievement.criteria.target,
          isNew: true
        };
        
        data.badges.push(badge);
        data.totalPoints += achievement.points;
        
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
        
        // Create notification
        await this.createAchievementNotification(userId, achievement);
      }
    }
    
    if (unlockedAchievements.length > 0) {
      await updateDoc(userAchievementsRef, {
        badges: data.badges,
        totalPoints: data.totalPoints,
        level: this.calculateLevel(data.totalPoints),
        lastUpdated: serverTimestamp()
      });
    }
    
    return unlockedAchievements;
  }

  // Check specific achievement criteria
  private static async checkAchievementCriteria(
    achievement: Achievement,
    userAchievements: UserAchievements,
    userId: string
  ): Promise<boolean> {
    const { criteria } = achievement;
    const { stats, streaks } = userAchievements;
    
    // Ensure streaks is an array
    const streaksArray = Array.isArray(streaks) ? streaks : [];
    
    switch (criteria.type) {
      case 'task_completion':
        switch (criteria.metric) {
          case 'tasks_per_day':
            return criteria.timeframe === 'day' && stats.tasksCompletedToday >= criteria.target;
          case 'total_tasks':
            return stats.tasksCompleted >= criteria.target;
          case 'early_completions':
            return stats.earlyCompletions >= criteria.target;
          case 'on_time_completions':
            return stats.onTimeCompletions >= criteria.target;
          case 'perfect_cards':
            return stats.perfectCards >= criteria.target;
        }
        break;
        
      case 'card_interaction':
        switch (criteria.metric) {
          case 'cards_helped':
            const cardsHelped = await this.getUniqueCardsHelped(userId);
            return cardsHelped >= criteria.target;
          case 'cards_created':
            return stats.cardsCreated >= criteria.target;
          case 'organized_cards':
            return stats.organizedCards >= criteria.target;
          case 'detailed_cards':
            return stats.detailedCards >= criteria.target;
        }
        break;
        
      case 'streak':
        const streak = streaksArray.find(s => s.type === 'daily_tasks');
        return streak ? streak.currentStreak >= criteria.target : false;
        
      case 'team_activity':
        switch (criteria.metric) {
          case 'comments_posted':
            return stats.commentsPosted >= criteria.target;
          case 'unique_mentions':
            return stats.uniqueMentions >= criteria.target;
        }
        break;
        
      case 'custom':
        switch (criteria.metric) {
          case 'achievements_unlocked':
            return userAchievements.badges.length >= criteria.target;
        }
        break;
    }
    
    return false;
  }

  // Get unique cards helped by user
  private static async getUniqueCardsHelped(userId: string): Promise<number> {
    const q = query(
      collection(db, 'userCardInteractions'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Create achievement notification
  private static async createAchievementNotification(
    userId: string,
    achievement: Achievement
  ): Promise<void> {
    const notification: AchievementNotification = {
      id: `achievement_${Date.now()}`,
      userId,
      achievement,
      unlockedAt: new Date(),
      seen: false,
      celebrated: false
    };
    
    await setDoc(
      doc(db, 'achievementNotifications', notification.id),
      {
        ...notification,
        unlockedAt: serverTimestamp()
      }
    );
  }

  // Get user achievements
  static async getUserAchievements(userId: string): Promise<UserAchievements | null> {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const docSnap = await getDoc(userAchievementsRef);
    
    if (!docSnap.exists()) {
      await this.initializeUserAchievements(userId);
      return await this.getUserAchievements(userId);
    }
    
    const data = docSnap.data();
    
    // Ensure streaks is always an array
    const userAchievements: UserAchievements = {
      ...data,
      streaks: Array.isArray(data.streaks) ? data.streaks : [],
      badges: Array.isArray(data.badges) ? data.badges : [],
      milestones: Array.isArray(data.milestones) ? data.milestones : [],
      lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : new Date()
    } as UserAchievements;
    
    return userAchievements;
  }

  // Get leaderboard
  static async getLeaderboard(
    boardId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly',
    metric: 'productivity' | 'collaboration' | 'consistency' | 'overall' = 'overall'
  ): Promise<Leaderboard> {
    const boardMembers = await this.getBoardMembers(boardId);
    const entries: LeaderboardEntry[] = [];
    
    for (const member of boardMembers) {
      const achievements = await this.getUserAchievements(member.userId);
      if (!achievements) continue;
      
      let score = 0;
      switch (metric) {
        case 'productivity':
          score = achievements.stats?.tasksCompleted || 0;
          break;
        case 'collaboration':
          score = achievements.stats?.collaborationScore || 0;
          break;
        case 'consistency':
          score = achievements.stats?.consistencyScore || 0;
          break;
        case 'overall':
          score = achievements.totalPoints || 0;
          break;
      }
      
      // Ensure streaks is an array before accessing
      const streaksArray = Array.isArray(achievements.streaks) ? achievements.streaks : [];
      
      entries.push({
        userId: member.userId,
        userEmail: member.email,
        userName: member.displayName,
        userPhoto: member.photoURL,
        rank: 0,
        score,
        change: 0,
        achievements: achievements.badges?.length || 0,
        level: achievements.level || 1,
        stats: {
          tasksThisPeriod: achievements.stats?.tasksCompleted || 0,
          streakDays: streaksArray[0]?.currentStreak || 0,
          collaborationPoints: achievements.stats?.collaborationScore || 0
        }
      });
    }
    
    // Sort by score and assign ranks
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return {
      id: `${boardId}_${period}_${metric}`,
      boardId,
      period,
      metric,
      entries,
      lastUpdated: new Date()
    };
  }

  // Helper to get board members
  private static async getBoardMembers(boardId: string): Promise<any[]> {
    const boardRef = doc(db, 'boards', boardId);
    const boardDoc = await getDoc(boardRef);
    
    if (!boardDoc.exists()) return [];
    
    return boardDoc.data().members || [];
  }

  // Calculate level from points
  private static calculateLevel(points: number): number {
    const levels = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];
    return levels.findIndex(threshold => points < threshold) || levels.length;
  }

  // Subscribe to achievement notifications
  static subscribeToAchievementNotifications(
    userId: string,
    callback: (notifications: AchievementNotification[]) => void
  ): (() => void) {
    const q = query(
      collection(db, 'achievementNotifications'),
      where('userId', '==', userId),
      where('seen', '==', false),
      orderBy('unlockedAt', 'desc'),
      limit(10)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as AchievementNotification[];
      
      callback(notifications);
    });
  }

  // Mark notification as seen
  static async markNotificationAsSeen(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'achievementNotifications', notificationId), {
      seen: true
    });
  }

  // Reset daily stats (should be called by a scheduled function)
  static async resetDailyStats(userId: string): Promise<void> {
    await updateDoc(doc(db, 'userAchievements', userId), {
      'stats.tasksCompletedToday': 0,
      lastUpdated: serverTimestamp()
    });
  }
} 