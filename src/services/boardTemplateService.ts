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
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { BoardTemplate, Board, List, BoardBackground, BoardMember } from '@/types';
import { createBoard, createList, createCard } from './boardService';

// Create a board from a template
export const createBoardFromTemplate = async (
  template: BoardTemplate,
  title: string,
  customBackground?: BoardBackground
): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to create boards');

  try {
    console.log('🏗️ Creating board from template:', template.name);

    // Use custom background or template background
    const background = customBackground || template.background;
    
    // Create the board with template settings
    const boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      description: `Created from ${template.name} template`,
      createdBy: currentUser.uid,
      members: [{
        userId: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || currentUser.email || 'User',
        photoURL: currentUser.photoURL || undefined,
        role: 'admin' as const,
        joinedAt: new Date(),
        invitedBy: currentUser.uid,
      }],
      labels: template.labels,
      templateType: template.type,
      customFields: template.customFields,
      boardSettings: template.settings,
      // Handle background based on type
      ...(background.type === 'color' && { backgroundColor: background.value }),
      ...(background.type === 'gradient' && { backgroundColor: background.value }),
      ...(background.type === 'pattern' && { backgroundColor: background.value }),
      ...(background.type === 'unsplash' && { backgroundImage: background.value }),
      background,
    };

    // Create the board
    const boardId = await createBoard(boardData);
    console.log('✅ Board created:', boardId);

    // Create lists from template and store their IDs
    const createdListIds: string[] = [];
    for (const listTemplate of template.lists) {
      const listData: any = {
        boardId,
        title: listTemplate.title,
        position: listTemplate.position,
        listType: listTemplate.listType,
        wipLimit: listTemplate.wipLimit,
        color: listTemplate.color,
      };
      
      // Filter out undefined values to avoid Firestore errors
      const cleanListData = Object.fromEntries(
        Object.entries(listData).filter(([_, value]) => value !== undefined)
      );
      
      const listId = await createList(cleanListData as any);
      createdListIds.push(listId);
      console.log('✅ List created:', listTemplate.title, listId);
    }

    // Create sample cards if template has them
    if (template.sampleCards && template.sampleCards.length > 0) {
      console.log('📝 Creating sample cards...');
      
      for (const sampleCardGroup of template.sampleCards) {
        const { listIndex, cards } = sampleCardGroup;
        
        // Make sure the list index is valid
        if (listIndex >= 0 && listIndex < createdListIds.length) {
          const targetListId = createdListIds[listIndex];
          
          for (const cardTemplate of cards) {
            try {
              const cardData: any = {
                boardId,
                listId: targetListId,
                title: cardTemplate.title,
                description: cardTemplate.description,
                position: cardTemplate.position,
                labels: cardTemplate.labels,
                customFieldValues: cardTemplate.customFieldValues,
                createdBy: currentUser.uid,
              };
              
              // Filter out undefined values to avoid Firestore errors
              const cleanCardData = Object.fromEntries(
                Object.entries(cardData).filter(([_, value]) => value !== undefined)
              );
              
              const cardId = await createCard(cleanCardData as any);
              console.log('✅ Sample card created:', cardTemplate.title, cardId);
            } catch (error) {
              console.error('❌ Error creating sample card:', cardTemplate.title, error);
              // Continue with other cards even if one fails
            }
          }
        } else {
          console.warn('⚠️ Invalid list index for sample cards:', listIndex);
        }
      }
    }

    console.log('🎉 Board creation from template completed');
    return boardId;
  } catch (error) {
    console.error('❌ Error creating board from template:', error);
    throw error;
  }
};

// Get all available board templates
export const getBoardTemplates = async (): Promise<BoardTemplate[]> => {
  try {
    const q = query(
      collection(db, 'boardTemplates'),
      where('isBuiltIn', '==', true),
      orderBy('usageCount', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BoardTemplate;
    });
  } catch (error) {
    console.error('Error fetching board templates:', error);
    return [];
  }
};

// Get templates by category
export const getBoardTemplatesByCategory = async (category: string): Promise<BoardTemplate[]> => {
  try {
    const q = query(
      collection(db, 'boardTemplates'),
      where('category', '==', category),
      where('isBuiltIn', '==', true),
      orderBy('usageCount', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as BoardTemplate;
    });
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    return [];
  }
};

// Create a custom board template
export const createBoardTemplate = async (
  template: Omit<BoardTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to create templates');

  try {
    const docRef = await addDoc(collection(db, 'boardTemplates'), {
      ...template,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating board template:', error);
    throw error;
  }
};

// Update template usage count
export const incrementTemplateUsage = async (templateId: string): Promise<void> => {
  try {
    const templateRef = doc(db, 'boardTemplates', templateId);
    const templateDoc = await getDoc(templateRef);
    
    if (templateDoc.exists()) {
      const currentUsage = templateDoc.data().usageCount || 0;
      await updateDoc(templateRef, {
        usageCount: currentUsage + 1,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating template usage:', error);
  }
};

// Apply board background
export const applyBoardBackground = (background: BoardBackground): React.CSSProperties => {
  switch (background.type) {
    case 'color':
      return { backgroundColor: background.value };
    
    case 'gradient':
      return { background: background.value };
    
    case 'pattern':
      const patternStyles: React.CSSProperties = {
        backgroundColor: background.value,
      };
      
      switch (background.pattern) {
        case 'dots':
          patternStyles.backgroundImage = 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)';
          patternStyles.backgroundSize = '20px 20px';
          break;
        case 'grid':
          patternStyles.backgroundImage = 
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)';
          patternStyles.backgroundSize = '20px 20px';
          break;
        case 'diagonal':
          patternStyles.backgroundImage = 
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)';
          break;
      }
      
      return patternStyles;
    
    case 'unsplash':
    case 'image':
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    
    default:
      return { backgroundColor: '#0079bf' };
  }
};

// Get CSS class for board background
export const getBoardBackgroundClass = (background: BoardBackground): string => {
  if (background.type === 'pattern') {
    return `board-pattern-${background.pattern}`;
  }
  return '';
}; 