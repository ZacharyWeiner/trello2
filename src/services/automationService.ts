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
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { BoardAutomation, AutomationRule, Card, List, Board, Label } from '@/types';
import { updateCard } from './boardService';

// Board Automation CRUD operations
export const createBoardAutomation = async (
  automation: Omit<BoardAutomation, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecuted'>
): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be authenticated to create automations');

  const docRef = await addDoc(collection(db, 'boardAutomations'), {
    ...automation,
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    executionCount: 0,
  });
  return docRef.id;
};

export const getBoardAutomations = async (boardId: string): Promise<BoardAutomation[]> => {
  const q = query(
    collection(db, 'boardAutomations'),
    where('boardId', '==', boardId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastExecuted: data.lastExecuted?.toDate(),
    } as BoardAutomation;
  });
};

export const updateBoardAutomation = async (
  automationId: string, 
  updates: Partial<BoardAutomation>
): Promise<void> => {
  const docRef = doc(db, 'boardAutomations', automationId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteBoardAutomation = async (automationId: string): Promise<void> => {
  const docRef = doc(db, 'boardAutomations', automationId);
  await deleteDoc(docRef);
};

// Automation execution
export const executeAutomationRules = async (
  card: Card,
  trigger: 'card_created' | 'card_moved' | 'label_added',
  context: {
    board: Board;
    lists: List[];
    previousListId?: string;
    newListId?: string;
    addedLabel?: Label;
  }
): Promise<void> => {
  try {
    console.log(`🤖 Executing automation rules for card: ${card.title}, trigger: ${trigger}`);
    
    // Get board automations
    const automations = await getBoardAutomations(card.boardId);
    
    for (const automation of automations) {
      for (const rule of automation.rules) {
        if (!rule.isActive) continue;
        
        // Check if rule matches the trigger
        if (!doesRuleMatchTrigger(rule, trigger, card, context)) continue;
        
        // Check conditions
        if (rule.conditions && !evaluateConditions(rule.conditions, card, context)) continue;
        
        // Execute the action
        await executeAutomationAction(rule, card, context);
        
        // Update execution count
        await updateBoardAutomation(automation.id, {
          executionCount: automation.executionCount + 1,
          lastExecuted: new Date()
        });
        
        console.log(`✅ Executed automation rule: ${rule.type} for card: ${card.title}`);
      }
    }
  } catch (error) {
    console.error('❌ Error executing automation rules:', error);
  }
};

const doesRuleMatchTrigger = (
  rule: AutomationRule,
  trigger: string,
  card: Card,
  context: any
): boolean => {
  if (rule.trigger.type !== trigger) return false;
  
  // Additional trigger-specific checks
  switch (trigger) {
    case 'card_moved':
      if (rule.trigger.listId && rule.trigger.listId !== context.newListId) return false;
      break;
    case 'label_added':
      if (rule.trigger.labelId && rule.trigger.labelId !== context.addedLabel?.id) return false;
      break;
  }
  
  return true;
};

const evaluateConditions = (
  conditions: any[],
  card: Card,
  context: any
): boolean => {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'list_name':
        const currentList = context.lists.find((l: List) => l.id === card.listId);
        return evaluateStringCondition(currentList?.title || '', condition.operator, condition.value);
      
      case 'label_present':
        return card.labels?.some(label => label.id === condition.value) || false;
      
      case 'member_assigned':
        return card.assignees?.includes(condition.value) || false;
      
      case 'title_contains':
        return evaluateStringCondition(card.title, condition.operator, condition.value);
      
      case 'description_contains':
        return evaluateStringCondition(card.description || '', condition.operator, condition.value);
      
      default:
        return true;
    }
  });
};

const evaluateStringCondition = (
  value: string,
  operator: string,
  target: string
): boolean => {
  const lowerValue = value.toLowerCase();
  const lowerTarget = target.toLowerCase();
  
  switch (operator) {
    case 'equals':
      return lowerValue === lowerTarget;
    case 'contains':
      return lowerValue.includes(lowerTarget);
    case 'starts_with':
      return lowerValue.startsWith(lowerTarget);
    case 'ends_with':
      return lowerValue.endsWith(lowerTarget);
    case 'not_equals':
      return lowerValue !== lowerTarget;
    default:
      return false;
  }
};

const executeAutomationAction = async (
  rule: AutomationRule,
  card: Card,
  context: any
): Promise<void> => {
  const updates: Partial<Card> = {};
  
  switch (rule.action.type) {
    case 'set_due_date':
      if (rule.action.dueDateOffset) {
        const offset = rule.action.dueDateOffset;
        let baseDate = new Date();
        
        if (offset.from === 'list_entry' && context.newListId) {
          baseDate = new Date(); // Use current time as list entry time
        }
        
        switch (offset.type) {
          case 'days':
            updates.dueDate = new Date(baseDate.getTime() + offset.value * 24 * 60 * 60 * 1000);
            break;
          case 'weeks':
            updates.dueDate = new Date(baseDate.getTime() + offset.value * 7 * 24 * 60 * 60 * 1000);
            break;
          case 'months':
            updates.dueDate = new Date(baseDate);
            updates.dueDate.setMonth(updates.dueDate.getMonth() + offset.value);
            break;
        }
      }
      break;
    
    case 'add_labels':
      if (rule.action.labelIds) {
        const currentLabels = card.labels || [];
        const newLabels = rule.action.labelIds
          .map(labelId => context.board.labels?.find((l: Label) => l.id === labelId))
          .filter(Boolean);
        
        updates.labels = [...currentLabels, ...newLabels].filter((label, index, self) => 
          index === self.findIndex(l => l.id === label.id)
        );
      }
      break;
    
    case 'assign_members':
      if (rule.action.memberIds) {
        const currentAssignees = card.assignees || [];
        updates.assignees = [...new Set([...currentAssignees, ...rule.action.memberIds])];
      }
      break;
    
    case 'move_to_list':
      if (rule.action.targetListId && rule.action.targetListId !== card.listId) {
        updates.listId = rule.action.targetListId;
        // Note: This would require additional logic to update position
      }
      break;
    
    case 'add_checklist':
      if (rule.action.checklistTemplate) {
        const currentChecklists = card.checklists || [];
        const newChecklist = {
          ...rule.action.checklistTemplate,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
          items: rule.action.checklistTemplate.items.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        };
        updates.checklists = [...currentChecklists, newChecklist];
      }
      break;
  }
  
  // Apply updates if any
  if (Object.keys(updates).length > 0) {
    await updateCard(card.id, updates);
    console.log(`🔄 Applied automation updates to card ${card.title}:`, updates);
  }
};

// List-based automation rules
export const createListAutomationRules = (
  listId: string,
  listName: string
): AutomationRule[] => {
  const rules: AutomationRule[] = [];
  
  // Auto-assign labels based on list name
  if (listName.toLowerCase().includes('bug') || listName.toLowerCase().includes('issue')) {
    rules.push({
      id: `auto-bug-label-${listId}`,
      type: 'assign_labels',
      trigger: { type: 'card_moved', listId },
      action: {
        type: 'add_labels',
        labelIds: ['bug'] // This would need to be mapped to actual label IDs
      },
      isActive: true
    });
  }
  
  if (listName.toLowerCase().includes('done') || listName.toLowerCase().includes('complete')) {
    rules.push({
      id: `auto-done-${listId}`,
      type: 'assign_labels',
      trigger: { type: 'card_moved', listId },
      action: {
        type: 'add_labels',
        labelIds: ['completed']
      },
      isActive: true
    });
  }
  
  if (listName.toLowerCase().includes('review') || listName.toLowerCase().includes('testing')) {
    rules.push({
      id: `auto-review-due-date-${listId}`,
      type: 'due_date',
      trigger: { type: 'card_moved', listId },
      action: {
        type: 'set_due_date',
        dueDateOffset: { type: 'days', value: 3, from: 'list_entry' }
      },
      isActive: true
    });
  }
  
  return rules;
};

// Built-in automation templates
export const BUILT_IN_AUTOMATION_TEMPLATES = [
  {
    name: 'Bug Workflow',
    description: 'Automatically manage bug reports with labels and due dates',
    rules: [
      {
        id: 'bug-auto-label',
        type: 'assign_labels' as const,
        trigger: { type: 'card_created' as const },
        action: {
          type: 'add_labels' as const,
          labelIds: ['bug', 'needs-triage']
        },
        isActive: true,
        conditions: [
          {
            type: 'title_contains' as const,
            operator: 'contains' as const,
            value: 'bug'
          }
        ]
      },
      {
        id: 'bug-due-date',
        type: 'due_date' as const,
        trigger: { type: 'label_added' as const, labelId: 'critical' },
        action: {
          type: 'set_due_date' as const,
          dueDateOffset: { type: 'days', value: 1, from: 'current_date' }
        },
        isActive: true
      }
    ]
  },
  {
    name: 'Feature Development',
    description: 'Automate feature development workflow',
    rules: [
      {
        id: 'feature-checklist',
        type: 'add_checklist' as const,
        trigger: { type: 'card_created' as const },
        action: {
          type: 'add_checklist' as const,
          checklistTemplate: {
            title: 'Development Checklist',
            items: [
              { id: '1', text: 'Requirements review', completed: false, createdAt: new Date(), updatedAt: new Date() },
              { id: '2', text: 'Technical design', completed: false, createdAt: new Date(), updatedAt: new Date() },
              { id: '3', text: 'Implementation', completed: false, createdAt: new Date(), updatedAt: new Date() },
              { id: '4', text: 'Code review', completed: false, createdAt: new Date(), updatedAt: new Date() },
              { id: '5', text: 'Testing', completed: false, createdAt: new Date(), updatedAt: new Date() }
            ]
          }
        },
        isActive: true,
        conditions: [
          {
            type: 'title_contains' as const,
            operator: 'contains' as const,
            value: 'feature'
          }
        ]
      }
    ]
  },
  {
    name: 'Sprint Planning',
    description: 'Automate sprint planning tasks',
    rules: [
      {
        id: 'sprint-due-date',
        type: 'due_date' as const,
        trigger: { type: 'card_moved' as const },
        action: {
          type: 'set_due_date' as const,
          dueDateOffset: { type: 'weeks', value: 2, from: 'list_entry' }
        },
        isActive: true,
        conditions: [
          {
            type: 'list_name' as const,
            operator: 'contains' as const,
            value: 'sprint'
          }
        ]
      }
    ]
  }
]; 