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
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CardTemplate, TemplateCategory, AutomationRule, Card, Label, Checklist } from '@/types';

// Built-in template categories
export const BUILT_IN_CATEGORIES: TemplateCategory[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Templates for software development tasks',
    icon: '💻',
    color: '#3B82F6',
    isBuiltIn: true,
    sortOrder: 1
  },
  {
    id: 'design',
    name: 'Design',
    description: 'Templates for design and creative work',
    icon: '🎨',
    color: '#8B5CF6',
    isBuiltIn: true,
    sortOrder: 2
  },
  {
    id: 'meetings',
    name: 'Meetings',
    description: 'Templates for meeting planning and notes',
    icon: '📅',
    color: '#10B981',
    isBuiltIn: true,
    sortOrder: 3
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Templates for customer support and issues',
    icon: '🎧',
    color: '#F59E0B',
    isBuiltIn: true,
    sortOrder: 4
  },
  {
    id: 'general',
    name: 'General',
    description: 'General purpose templates',
    icon: '📋',
    color: '#6B7280',
    isBuiltIn: true,
    sortOrder: 5
  }
];

// Built-in templates
export const BUILT_IN_TEMPLATES: Omit<CardTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    name: 'Bug Report',
    description: 'Template for reporting software bugs',
    category: 'development',
    isBuiltIn: true,
    usageCount: 0,
    title: '🐛 Bug: [Brief Description]',
    cardDescription: `## Bug Description
Describe the bug clearly and concisely.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 22]
- OS: [e.g. iOS, Windows]

## Additional Context
Add any other context about the problem here.`,
    labels: [
      { id: 'bug', name: 'Bug', color: '#EF4444' },
      { id: 'needs-investigation', name: 'Needs Investigation', color: '#F59E0B' }
    ],
    checklists: [
      {
        title: 'Bug Triage',
        items: [
          { id: '1', text: 'Reproduce the bug', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '2', text: 'Identify root cause', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '3', text: 'Estimate fix complexity', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '4', text: 'Assign to developer', completed: false, createdAt: new Date(), updatedAt: new Date() }
        ]
      }
    ],
    automationRules: [
      {
        id: 'auto-due-date',
        type: 'due_date',
        trigger: { type: 'card_created' },
        action: {
          type: 'set_due_date',
          dueDateOffset: { type: 'days', value: 7, from: 'creation' }
        },
        isActive: true
      }
    ]
  },
  {
    name: 'Feature Request',
    description: 'Template for new feature requests',
    category: 'development',
    isBuiltIn: true,
    usageCount: 0,
    title: '✨ Feature: [Feature Name]',
    cardDescription: `## Feature Summary
Brief description of the feature request.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe your proposed solution.

## User Stories
- As a [user type], I want [goal] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Considerations
Any technical notes or constraints.

## Priority
- [ ] High
- [ ] Medium
- [ ] Low`,
    labels: [
      { id: 'feature', name: 'Feature', color: '#10B981' },
      { id: 'enhancement', name: 'Enhancement', color: '#3B82F6' }
    ],
    checklists: [
      {
        title: 'Feature Development',
        items: [
          { id: '1', text: 'Requirements gathering', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '2', text: 'Technical design', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '3', text: 'Implementation', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '4', text: 'Testing', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '5', text: 'Documentation', completed: false, createdAt: new Date(), updatedAt: new Date() }
        ]
      }
    ],
    automationRules: [
      {
        id: 'auto-due-date',
        type: 'due_date',
        trigger: { type: 'card_created' },
        action: {
          type: 'set_due_date',
          dueDateOffset: { type: 'weeks', value: 2, from: 'creation' }
        },
        isActive: true
      }
    ]
  },
  {
    name: 'Meeting Notes',
    description: 'Template for meeting planning and notes',
    category: 'meetings',
    isBuiltIn: true,
    usageCount: 0,
    title: '📅 Meeting: [Meeting Title]',
    cardDescription: `## Meeting Details
- **Date:** [Date]
- **Time:** [Time]
- **Duration:** [Duration]
- **Location/Link:** [Location or video link]

## Attendees
- [Name 1]
- [Name 2]
- [Name 3]

## Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion Notes
[Notes from the meeting discussion]

## Action Items
- [ ] [Action item 1] - Assigned to: [Name]
- [ ] [Action item 2] - Assigned to: [Name]
- [ ] [Action item 3] - Assigned to: [Name]

## Next Steps
[What happens next]

## Next Meeting
- **Date:** [Date]
- **Topics:** [Topics to discuss]`,
    labels: [
      { id: 'meeting', name: 'Meeting', color: '#8B5CF6' },
      { id: 'planning', name: 'Planning', color: '#06B6D4' }
    ],
    checklists: [
      {
        title: 'Meeting Preparation',
        items: [
          { id: '1', text: 'Send calendar invite', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '2', text: 'Prepare agenda', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '3', text: 'Share pre-read materials', completed: false, createdAt: new Date(), updatedAt: new Date() }
        ]
      }
    ]
  },
  {
    name: 'Design Review',
    description: 'Template for design review process',
    category: 'design',
    isBuiltIn: true,
    usageCount: 0,
    title: '🎨 Design Review: [Design Name]',
    cardDescription: `## Design Overview
Brief description of the design being reviewed.

## Design Goals
- Goal 1
- Goal 2
- Goal 3

## Target Audience
Who is this design for?

## Design Files
- [Link to Figma/Sketch file]
- [Link to prototype]

## Review Criteria
- [ ] Usability
- [ ] Accessibility
- [ ] Brand consistency
- [ ] Technical feasibility
- [ ] Performance considerations

## Feedback
### Positive Feedback
- [What works well]

### Areas for Improvement
- [What could be improved]

## Next Steps
- [ ] Address feedback
- [ ] Update design
- [ ] Final approval`,
    labels: [
      { id: 'design', name: 'Design', color: '#EC4899' },
      { id: 'review', name: 'Review', color: '#F59E0B' }
    ],
    checklists: [
      {
        title: 'Review Process',
        items: [
          { id: '1', text: 'Stakeholder review', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '2', text: 'Accessibility check', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '3', text: 'Technical review', completed: false, createdAt: new Date(), updatedAt: new Date() },
          { id: '4', text: 'Final approval', completed: false, createdAt: new Date(), updatedAt: new Date() }
        ]
      }
    ]
  }
];

// Template CRUD operations
export const createTemplate = async (template: Omit<CardTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to create templates');

  const docRef = await addDoc(collection(db, 'cardTemplates'), {
    ...template,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getTemplate = async (templateId: string): Promise<CardTemplate | null> => {
  const docRef = doc(db, 'cardTemplates', templateId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as CardTemplate;
  }
  
  return null;
};

export const getUserTemplates = async (userId: string): Promise<CardTemplate[]> => {
  const q = query(
    collection(db, 'cardTemplates'),
    where('createdBy', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as CardTemplate;
  });
};

export const getTemplatesByCategory = async (category: string): Promise<CardTemplate[]> => {
  // For built-in templates, return from memory
  if (category && BUILT_IN_CATEGORIES.some(cat => cat.id === category)) {
    return BUILT_IN_TEMPLATES
      .filter(template => template.category === category)
      .map((template, index) => ({
        ...template,
        id: `builtin-${category}-${index}`,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
  }

  // For custom templates, query Firebase
  const q = query(
    collection(db, 'cardTemplates'),
    where('category', '==', category),
    where('isBuiltIn', '==', false),
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
    } as CardTemplate;
  });
};

export const getAllTemplates = async (): Promise<CardTemplate[]> => {
  // Get built-in templates
  const builtInTemplates = BUILT_IN_TEMPLATES.map((template, index) => ({
    ...template,
    id: `builtin-${template.category}-${index}`,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Get custom templates
  const q = query(
    collection(db, 'cardTemplates'),
    where('isBuiltIn', '==', false),
    orderBy('usageCount', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const customTemplates = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as CardTemplate;
  });

  return [...builtInTemplates, ...customTemplates];
};

export const updateTemplate = async (templateId: string, updates: Partial<CardTemplate>): Promise<void> => {
  if (templateId.startsWith('builtin-')) {
    throw new Error('Cannot update built-in templates');
  }

  const docRef = doc(db, 'cardTemplates', templateId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
  if (templateId.startsWith('builtin-')) {
    throw new Error('Cannot delete built-in templates');
  }

  const docRef = doc(db, 'cardTemplates', templateId);
  await deleteDoc(docRef);
};

export const incrementTemplateUsage = async (templateId: string): Promise<void> => {
  if (templateId.startsWith('builtin-')) {
    // For built-in templates, we could track usage in a separate collection
    // For now, we'll just skip this
    return;
  }

  const template = await getTemplate(templateId);
  if (template) {
    await updateTemplate(templateId, {
      usageCount: (template.usageCount || 0) + 1
    });
  }
};

// Apply template to create a new card
export const applyTemplate = async (
  template: CardTemplate,
  listId: string,
  boardId: string,
  position: number,
  customizations?: {
    title?: string;
    assignees?: string[];
    dueDate?: Date;
  }
): Promise<Partial<Card>> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to apply templates');

  // Increment usage count
  await incrementTemplateUsage(template.id);

  // Generate new IDs for checklists and items
  const processedChecklists: Checklist[] = (template.checklists || []).map(checklist => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: checklist.title,
            items: (checklist.items || []).map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Calculate due date based on automation rules
  let calculatedDueDate = customizations?.dueDate;
  if (!calculatedDueDate && template.automationRules) {
    const dueDateRule = template.automationRules.find(rule => 
      rule.type === 'due_date' && 
      rule.trigger.type === 'card_created' &&
      rule.isActive
    );
    
    if (dueDateRule?.action.dueDateOffset) {
      const offset = dueDateRule.action.dueDateOffset;
      const baseDate = new Date();
      
      switch (offset.type) {
        case 'days':
          calculatedDueDate = new Date(baseDate.getTime() + offset.value * 24 * 60 * 60 * 1000);
          break;
        case 'weeks':
          calculatedDueDate = new Date(baseDate.getTime() + offset.value * 7 * 24 * 60 * 60 * 1000);
          break;
        case 'months':
          calculatedDueDate = new Date(baseDate);
          calculatedDueDate.setMonth(calculatedDueDate.getMonth() + offset.value);
          break;
      }
    }
  }

  // Build the card data, filtering out undefined values
  const cardData: Partial<Card> = {
    listId,
    boardId,
    title: customizations?.title || template.title,
    description: template.cardDescription,
    position,
    labels: template.labels || [],
    assignees: customizations?.assignees || template.assignees || [],
    checklists: processedChecklists,
    createdBy: currentUser.uid,
  };

  // Only add optional fields if they have values
  if (template.cover) {
    cardData.cover = template.cover;
  }
  
  if (template.estimatedHours !== undefined) {
    cardData.estimatedHours = template.estimatedHours;
  }
  
  if (calculatedDueDate) {
    cardData.dueDate = calculatedDueDate;
  }

  return cardData;
}; 