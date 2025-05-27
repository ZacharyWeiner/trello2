import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Board, List, Card, BoardMember } from '@/types';

// IndexedDB Schema
interface TrelloCloneDB extends DBSchema {
  boards: {
    key: string;
    value: Board & { lastModified: number; synced: boolean };
  };
  lists: {
    key: string;
    value: List & { lastModified: number; synced: boolean };
    indexes: { 'by-board': string };
  };
  cards: {
    key: string;
    value: Card & { lastModified: number; synced: boolean };
    indexes: { 'by-list': string; 'by-board': string };
  };
  pendingActions: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'update' | 'delete';
      entity: 'board' | 'list' | 'card';
      data: any;
      timestamp: number;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      action: string;
      data: any;
      timestamp: number;
      retryCount: number;
    };
  };
}

class OfflineService {
  private db: IDBPDatabase<TrelloCloneDB> | null = null;
  private isOnline = true;
  private syncInProgress = false;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  async init() {
    // Initialize IndexedDB
    this.db = await openDB<TrelloCloneDB>('trello-clone-db', 1, {
      upgrade(db) {
        // Boards store
        const boardStore = db.createObjectStore('boards', { keyPath: 'id' });
        
        // Lists store
        const listStore = db.createObjectStore('lists', { keyPath: 'id' });
        listStore.createIndex('by-board', 'boardId');
        
        // Cards store
        const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
        cardStore.createIndex('by-list', 'listId');
        cardStore.createIndex('by-board', 'boardId');
        
        // Pending actions store
        db.createObjectStore('pendingActions', { keyPath: 'id' });
        
        // Sync queue store
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      },
    });

    // Set up online/offline listeners
    this.isOnline = navigator.onLine;
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Start periodic sync attempts
    this.startPeriodicSync();
  }

  // Network status management
  private handleOnline() {
    this.isOnline = true;
    this.notifyListeners(true);
    this.syncPendingChanges();
  }

  private handleOffline() {
    this.isOnline = false;
    this.notifyListeners(false);
  }

  onNetworkStatusChange(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => callback(isOnline));
  }

  getNetworkStatus() {
    return this.isOnline;
  }

  // Data storage methods
  async storeBoard(board: Board) {
    if (!this.db) return;
    
    const boardWithMeta = {
      ...board,
      lastModified: Date.now(),
      synced: this.isOnline,
    };
    
    await this.db.put('boards', boardWithMeta);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('board', 'update', board);
    }
  }

  async storeList(list: List) {
    if (!this.db) return;
    
    const listWithMeta = {
      ...list,
      lastModified: Date.now(),
      synced: this.isOnline,
    };
    
    await this.db.put('lists', listWithMeta);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('list', 'update', list);
    }
  }

  async storeCard(card: Card) {
    if (!this.db) return;
    
    const cardWithMeta = {
      ...card,
      lastModified: Date.now(),
      synced: this.isOnline,
    };
    
    await this.db.put('cards', cardWithMeta);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('card', 'update', card);
    }
  }

  // Data retrieval methods
  async getBoard(id: string): Promise<Board | null> {
    if (!this.db) return null;
    
    const board = await this.db.get('boards', id);
    return board ? this.stripMetadata(board) : null;
  }

  async getBoardsByUser(userId: string): Promise<Board[]> {
    if (!this.db) return [];
    
    const boards = await this.db.getAll('boards');
    return boards
      .filter(board => board.members.some(member => member.userId === userId))
      .map(board => this.stripMetadata(board));
  }

  async getListsByBoard(boardId: string): Promise<List[]> {
    if (!this.db) return [];
    
    const lists = await this.db.getAllFromIndex('lists', 'by-board', boardId);
    return lists.map(list => this.stripMetadata(list));
  }

  async getCardsByList(listId: string): Promise<Card[]> {
    if (!this.db) return [];
    
    const cards = await this.db.getAllFromIndex('cards', 'by-list', listId);
    return cards.map(card => this.stripMetadata(card));
  }

  async getCardsByBoard(boardId: string): Promise<Card[]> {
    if (!this.db) return [];
    
    const cards = await this.db.getAllFromIndex('cards', 'by-board', boardId);
    return cards.map(card => this.stripMetadata(card));
  }

  // Sync queue management
  private async addToSyncQueue(entity: string, action: string, data: any) {
    if (!this.db) return;
    
    const queueItem = {
      id: `${entity}-${action}-${data.id}-${Date.now()}`,
      action: `${entity}:${action}`,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    await this.db.put('syncQueue', queueItem);
  }

  async syncPendingChanges() {
    if (!this.db || this.syncInProgress || !this.isOnline) return;
    
    this.syncInProgress = true;
    
    try {
      const pendingItems = await this.db.getAll('syncQueue');
      
      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
          await this.db.delete('syncQueue', item.id);
        } catch (error) {
          console.error('Sync failed for item:', item, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove items that have failed too many times
          if (item.retryCount > 5) {
            await this.db.delete('syncQueue', item.id);
          } else {
            await this.db.put('syncQueue', item);
          }
        }
      }
      
      // Mark all local data as synced
      await this.markAllAsSynced();
      
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processSyncItem(item: any) {
    const [entity, action] = item.action.split(':');
    
    // Here you would call your actual Firebase sync methods
    // For now, we'll simulate the sync
    console.log(`Syncing ${entity}:${action}`, item.data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, you would:
    // - Call the appropriate Firebase service method
    // - Handle conflicts (local vs remote changes)
    // - Update local data with server response
  }

  private async markAllAsSynced() {
    if (!this.db) return;
    
    // Mark boards as synced
    const boards = await this.db.getAll('boards');
    for (const board of boards) {
      if (!board.synced) {
        board.synced = true;
        await this.db.put('boards', board);
      }
    }
    
    // Mark lists as synced
    const lists = await this.db.getAll('lists');
    for (const list of lists) {
      if (!list.synced) {
        list.synced = true;
        await this.db.put('lists', list);
      }
    }
    
    // Mark cards as synced
    const cards = await this.db.getAll('cards');
    for (const card of cards) {
      if (!card.synced) {
        card.synced = true;
        await this.db.put('cards', card);
      }
    }
  }

  private stripMetadata<T extends { lastModified?: number; synced?: boolean }>(item: T): Omit<T, 'lastModified' | 'synced'> {
    const { lastModified, synced, ...cleanItem } = item;
    return cleanItem;
  }

  // Periodic sync
  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  // Clear all offline data
  async clearOfflineData() {
    if (!this.db) return;
    
    const tx = this.db.transaction(['boards', 'lists', 'cards', 'syncQueue'], 'readwrite');
    await Promise.all([
      tx.objectStore('boards').clear(),
      tx.objectStore('lists').clear(),
      tx.objectStore('cards').clear(),
      tx.objectStore('syncQueue').clear(),
    ]);
  }

  // Get sync status
  async getSyncStatus() {
    if (!this.db) return { pending: 0, unsynced: 0, isOnline: this.isOnline };
    
    const pendingItems = await this.db.getAll('syncQueue');
    const boards = await this.db.getAll('boards');
    const lists = await this.db.getAll('lists');
    const cards = await this.db.getAll('cards');
    
    const unsyncedCount = [
      ...boards.filter(b => !b.synced),
      ...lists.filter(l => !l.synced),
      ...cards.filter(c => !c.synced),
    ].length;
    
    return {
      pending: pendingItems.length,
      unsynced: unsyncedCount,
      isOnline: this.isOnline,
    };
  }
}

export const offlineService = new OfflineService(); 