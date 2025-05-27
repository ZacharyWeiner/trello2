// Meeting Notes Types
export interface MeetingNote {
  id: string;
  title: string;
  content: string;
  date: Date;
  attendees: string[];
  boardId: string;
  createdBy: string;
  tags: string[];
  duration?: number; // in minutes
  meetingType: 'standup' | 'planning' | 'review' | 'brainstorm' | 'general';
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedTask {
  id: string;
  text: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  context: string; // Original sentence/paragraph where task was found
  confidence: number; // 0-100, how confident we are this is a task
  keywords: string[];
  actionType: 'todo' | 'follow_up' | 'decision' | 'question' | 'blocker';
  estimatedHours?: number;
  dependencies?: string[];
}

export interface MeetingAnalysis {
  id: string;
  meetingNoteId: string;
  extractedTasks: ParsedTask[];
  keyDecisions: string[];
  actionItems: string[];
  questions: string[];
  blockers: string[];
  nextSteps: string[];
  attendeeActions: Record<string, string[]>; // attendee -> actions
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgencyLevel: 'low' | 'medium' | 'high';
  processedAt: Date;
}

export interface TaskExtractionRule {
  id: string;
  name: string;
  pattern: RegExp;
  priority: number; // Higher = more important
  actionType: ParsedTask['actionType'];
  confidenceBoost: number;
  examples: string[];
  enabled: boolean;
}

export interface MeetingTemplate {
  id: string;
  name: string;
  description: string;
  structure: string[];
  defaultTags: string[];
  extractionRules: string[]; // Rule IDs
  meetingType: MeetingNote['meetingType'];
}

export interface SmartSuggestion {
  id: string;
  type: 'assignee' | 'due_date' | 'priority' | 'list' | 'tags';
  suggestion: string;
  confidence: number;
  reasoning: string;
  context: string;
}

export interface ProcessingStats {
  totalWords: number;
  totalSentences: number;
  tasksFound: number;
  decisionsFound: number;
  questionsFound: number;
  blockersFound: number;
  processingTime: number; // milliseconds
  confidenceAverage: number;
} 