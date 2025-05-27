import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { VideoCallLink } from '@/types';

export class VideoCallService {
  /**
   * Convert VideoCallLink to Firestore-compatible format
   */
  static toFirestore(links: VideoCallLink[]): any[] {
    return links.map(link => ({
      ...link,
      createdAt: link.createdAt instanceof Date 
        ? Timestamp.fromDate(link.createdAt)
        : Timestamp.fromDate(new Date(link.createdAt))
    }));
  }

  /**
   * Convert from Firestore format to VideoCallLink
   */
  static fromFirestore(links: any[]): VideoCallLink[] {
    if (!links || !Array.isArray(links)) return [];
    
    return links.map(link => {
      let createdAt: Date;
      
      if (link.createdAt && typeof link.createdAt === 'object' && 'toDate' in link.createdAt) {
        // Firestore Timestamp
        createdAt = link.createdAt.toDate();
      } else if (link.createdAt && typeof link.createdAt === 'object' && 'seconds' in link.createdAt) {
        // Serialized Firestore timestamp
        createdAt = new Date(link.createdAt.seconds * 1000);
      } else {
        // Try to parse as date
        createdAt = new Date(link.createdAt);
      }
      
      // If date is invalid, use current date
      if (isNaN(createdAt.getTime())) {
        createdAt = new Date();
      }
      
      return {
        ...link,
        createdAt
      };
    }).filter(link => link.id && link.url); // Filter out invalid links
  }

  /**
   * Update video links for a card
   */
  static async updateCardVideoLinks(cardId: string, videoLinks: VideoCallLink[]): Promise<void> {
    try {
      const cardRef = doc(db, 'cards', cardId);
      await updateDoc(cardRef, {
        videoLinks: this.toFirestore(videoLinks),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating video links:', error);
      throw error;
    }
  }

  /**
   * Add a single video link to a card
   */
  static async addVideoLink(cardId: string, currentLinks: VideoCallLink[], newLink: VideoCallLink): Promise<void> {
    const updatedLinks = [...currentLinks, newLink];
    await this.updateCardVideoLinks(cardId, updatedLinks);
  }

  /**
   * Remove a video link from a card
   */
  static async removeVideoLink(cardId: string, currentLinks: VideoCallLink[], linkId: string): Promise<void> {
    const updatedLinks = currentLinks.filter(link => link.id !== linkId);
    await this.updateCardVideoLinks(cardId, updatedLinks);
  }
} 