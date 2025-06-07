import { 
  MeetingNote, 
  ParsedTask, 
  MeetingAnalysis, 
  TaskExtractionRule, 
  SmartSuggestion,
  ProcessingStats 
} from '@/types/meeting';
import { Board, BoardMember } from '@/types';

export class MeetingParserService {
  private static readonly ACTION_VERBS = [
    'create', 'build', 'develop', 'implement', 'design', 'write', 'update', 'fix', 'test',
    'review', 'analyze', 'research', 'investigate', 'contact', 'call', 'email', 'send',
    'schedule', 'plan', 'organize', 'prepare', 'finish', 'complete', 'deliver', 'deploy',
    'setup', 'configure', 'install', 'document', 'draft', 'outline', 'brainstorm',
    'discuss', 'meet', 'follow up', 'check', 'verify', 'validate', 'approve', 'reject'
  ];

  private static readonly PRIORITY_KEYWORDS = {
    urgent: ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'blocker'],
    high: ['important', 'priority', 'soon', 'deadline', 'must', 'required', 'essential'],
    medium: ['should', 'would like', 'prefer', 'consider', 'explore', 'investigate'],
    low: ['nice to have', 'eventually', 'when possible', 'low priority', 'optional']
  };

  private static readonly TIME_PATTERNS = {
    today: /\b(today|this afternoon|this morning|end of day|eod)\b/i,
    tomorrow: /\b(tomorrow|next day)\b/i,
    thisWeek: /\b(this week|by friday|end of week|eow)\b/i,
    nextWeek: /\b(next week|following week)\b/i,
    specific: /\b(by|due|deadline|before)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})\b/i
  };

  private static readonly ASSIGNEE_PATTERNS = [
    /\b([A-Z][a-z]+)\s+(will|should|needs to|has to|is going to|to)\s+/g,
    /\b(assign|assigned to|give to|hand off to)\s+([A-Z][a-z]+)\b/g,
    /\b([A-Z][a-z]+)\s+(owns|responsible for|taking care of)\b/g,
    /\b@([A-Za-z]+)\b/g // @mentions
  ];

  /**
   * Main parsing function - extracts tasks and analysis from meeting notes
   */
  static async parseMeetingNotes(
    note: MeetingNote, 
    board: Board,
    customRules: TaskExtractionRule[] = []
  ): Promise<MeetingAnalysis> {
    const startTime = Date.now();
    
    // Preprocess the text
    const processedText = this.preprocessText(note.content);
    
    // Extract sentences and analyze structure
    const sentences = this.extractSentences(processedText);
    const words = processedText.split(/\s+/).length;
    
    // Apply extraction rules
    const defaultRules = this.getDefaultExtractionRules();
    const allRules = [...defaultRules, ...customRules].filter(rule => rule.enabled);
    
    // Extract different types of content
    const extractedTasks = this.extractTasks(sentences, allRules, board.members);
    const keyDecisions = this.extractDecisions(sentences);
    const actionItems = this.extractActionItems(sentences);
    const questions = this.extractQuestions(sentences);
    const blockers = this.extractBlockers(sentences);
    const nextSteps = this.extractNextSteps(sentences);
    const attendeeActions = this.mapAttendeeActions(extractedTasks, note.attendees);
    
    // Generate summary and analysis
    const summary = this.generateSummary(note, extractedTasks, keyDecisions);
    const sentiment = this.analyzeSentiment(processedText);
    const urgencyLevel = this.determineUrgency(extractedTasks, blockers);
    
    const processingTime = Date.now() - startTime;
    
    return {
      id: `analysis-${note.id}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      meetingNoteId: note.id,
      extractedTasks,
      keyDecisions,
      actionItems,
      questions,
      blockers,
      nextSteps,
      attendeeActions,
      summary,
      sentiment,
      urgencyLevel,
      processedAt: new Date()
    };
  }

  /**
   * Extract tasks using pattern matching and NLP techniques
   */
  private static extractTasks(
    sentences: string[], 
    rules: TaskExtractionRule[],
    boardMembers: BoardMember[]
  ): ParsedTask[] {
    const tasks: ParsedTask[] = [];
    const memberNames = boardMembers.map(m => m.displayName.toLowerCase());
    
    sentences.forEach((sentence, index) => {
      // Apply each extraction rule
      rules.forEach(rule => {
        const matches = sentence.match(rule.pattern);
        if (matches) {
          const taskText = this.cleanTaskText(matches[0]);
          
          if (taskText.length > 10) { // Minimum task length
            const task: ParsedTask = {
              id: `task-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              text: taskText,
              context: sentence,
              confidence: this.calculateConfidence(sentence, rule, taskText),
              keywords: this.extractKeywords(sentence),
              actionType: rule.actionType,
              priority: this.determinePriority(sentence),
              assignee: this.extractAssignee(sentence, memberNames),
              dueDate: this.extractDueDate(sentence),
              estimatedHours: this.estimateHours(taskText),
              dependencies: this.extractDependencies(sentence, tasks)
            };
            
            // Only add if confidence is above threshold
            if (task.confidence >= 60) {
              tasks.push(task);
            }
          }
        }
      });
    });
    
    // Remove duplicates and merge similar tasks
    return this.deduplicateTasks(tasks);
  }

  /**
   * Get default extraction rules for common task patterns
   */
  private static getDefaultExtractionRules(): TaskExtractionRule[] {
    return [
      {
        id: 'action-verb-pattern',
        name: 'Action Verb Pattern',
        pattern: /\b(need to|should|must|will|going to|have to|let's|we'll)\s+(\w+(?:\s+\w+)*)/gi,
        priority: 8,
        actionType: 'todo',
        confidenceBoost: 20,
        examples: ['We need to update the documentation', 'John should review the code'],
        enabled: true
      },
      {
        id: 'todo-pattern',
        name: 'TODO Pattern',
        pattern: /\b(todo|to do|action item|ai):\s*(.+)/gi,
        priority: 10,
        actionType: 'todo',
        confidenceBoost: 30,
        examples: ['TODO: Fix the login bug', 'Action item: Schedule follow-up meeting'],
        enabled: true
      },
      {
        id: 'assignment-pattern',
        name: 'Assignment Pattern',
        pattern: /\b([A-Z][a-z]+)\s+(will|should|needs to|has to)\s+(.+)/gi,
        priority: 9,
        actionType: 'todo',
        confidenceBoost: 25,
        examples: ['Sarah will create the wireframes', 'Mike needs to test the feature'],
        enabled: true
      },
      {
        id: 'follow-up-pattern',
        name: 'Follow-up Pattern',
        pattern: /\b(follow up|follow-up|check back|circle back|touch base)\s+(.+)/gi,
        priority: 7,
        actionType: 'follow_up',
        confidenceBoost: 15,
        examples: ['Follow up with the client next week', 'Circle back on the proposal'],
        enabled: true
      },
      {
        id: 'decision-pattern',
        name: 'Decision Pattern',
        pattern: /\b(decided|decision|agreed|conclude|resolve)\s+(.+)/gi,
        priority: 6,
        actionType: 'decision',
        confidenceBoost: 10,
        examples: ['We decided to use React for the frontend', 'Agreed to postpone the launch'],
        enabled: true
      },
      {
        id: 'question-pattern',
        name: 'Question Pattern',
        pattern: /\b(question|ask|clarify|unclear|confirm)\s+(.+)/gi,
        priority: 5,
        actionType: 'question',
        confidenceBoost: 10,
        examples: ['Need to ask about the budget', 'Clarify the requirements with stakeholders'],
        enabled: true
      },
      {
        id: 'blocker-pattern',
        name: 'Blocker Pattern',
        pattern: /\b(blocked|blocker|stuck|issue|problem|can't proceed)\s+(.+)/gi,
        priority: 9,
        actionType: 'blocker',
        confidenceBoost: 25,
        examples: ['Blocked by missing API documentation', 'Issue with the deployment pipeline'],
        enabled: true
      }
    ];
  }

  /**
   * Calculate confidence score for a potential task
   */
  private static calculateConfidence(
    sentence: string, 
    rule: TaskExtractionRule, 
    taskText: string
  ): number {
    let confidence = 50; // Base confidence
    
    // Rule-specific boost
    confidence += rule.confidenceBoost;
    
    // Action verb boost
    const hasActionVerb = this.ACTION_VERBS.some(verb => 
      taskText.toLowerCase().includes(verb)
    );
    if (hasActionVerb) confidence += 15;
    
    // Length boost (longer tasks are often more specific)
    if (taskText.length > 30) confidence += 10;
    if (taskText.length > 50) confidence += 5;
    
    // Specificity boost
    if (this.hasSpecificDetails(taskText)) confidence += 10;
    
    // Time reference boost
    if (this.hasTimeReference(sentence)) confidence += 10;
    
    // Assignee boost
    if (this.hasAssignee(sentence)) confidence += 10;
    
    // Priority keyword boost
    if (this.hasPriorityKeywords(sentence)) confidence += 5;
    
    // Penalty for vague language
    if (this.hasVagueLanguage(taskText)) confidence -= 15;
    
    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Extract assignee from sentence
   */
  private static extractAssignee(sentence: string, memberNames: string[]): string | undefined {
    const lowerSentence = sentence.toLowerCase();
    
    // Check for @mentions first
    const mentionMatch = sentence.match(/@([A-Za-z]+)/);
    if (mentionMatch) {
      return mentionMatch[1];
    }
    
    // Check for name patterns
    for (const pattern of this.ASSIGNEE_PATTERNS) {
      const matches = Array.from(sentence.matchAll(pattern));
      for (const match of matches) {
        const potentialName = match[1] || match[2];
        if (potentialName && memberNames.includes(potentialName.toLowerCase())) {
          return potentialName;
        }
      }
    }
    
    // Check for direct name mentions
    for (const name of memberNames) {
      if (lowerSentence.includes(name)) {
        return name;
      }
    }
    
    return undefined;
  }

  /**
   * Determine priority based on keywords and context
   */
  private static determinePriority(sentence: string): ParsedTask['priority'] {
    const lowerSentence = sentence.toLowerCase();
    
    for (const [priority, keywords] of Object.entries(this.PRIORITY_KEYWORDS)) {
      if (keywords.some(keyword => lowerSentence.includes(keyword))) {
        return priority as ParsedTask['priority'];
      }
    }
    
    return 'medium'; // Default priority
  }

  /**
   * Extract due date from sentence
   */
  private static extractDueDate(sentence: string): Date | undefined {
    const now = new Date();
    
    for (const [timeframe, pattern] of Object.entries(this.TIME_PATTERNS)) {
      if (pattern.test(sentence)) {
        switch (timeframe) {
          case 'today':
            return now;
          case 'tomorrow':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
          case 'thisWeek':
            const daysUntilFriday = 5 - now.getDay();
            return new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
          case 'nextWeek':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          case 'specific':
            // Try to parse specific dates (simplified)
            const dateMatch = sentence.match(/\d{1,2}\/\d{1,2}/);
            if (dateMatch) {
              const [month, day] = dateMatch[0].split('/').map(Number);
              const year = now.getFullYear();
              return new Date(year, month - 1, day);
            }
            break;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Estimate hours for a task based on complexity indicators
   */
  private static estimateHours(taskText: string): number | undefined {
    const complexityIndicators = {
      simple: ['update', 'fix', 'review', 'check', 'send', 'call'],
      medium: ['create', 'build', 'design', 'implement', 'develop', 'write'],
      complex: ['research', 'analyze', 'investigate', 'architect', 'refactor']
    };
    
    const lowerText = taskText.toLowerCase();
    
    if (complexityIndicators.complex.some(word => lowerText.includes(word))) {
      return 8; // 1 day
    } else if (complexityIndicators.medium.some(word => lowerText.includes(word))) {
      return 4; // Half day
    } else if (complexityIndicators.simple.some(word => lowerText.includes(word))) {
      return 1; // 1 hour
    }
    
    return undefined;
  }

  /**
   * Extract keywords from sentence
   */
  private static extractKeywords(sentence: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
      'us', 'them'
    ]);
    
    return sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Top 5 keywords
  }

  /**
   * Extract decisions from meeting notes
   */
  private static extractDecisions(sentences: string[]): string[] {
    const decisionPatterns = [
      /\b(decided|decision|agreed|conclude|resolved|determined)\s+(.+)/gi,
      /\b(we will|we'll|going with|chose to|selected)\s+(.+)/gi
    ];
    
    const decisions: string[] = [];
    
    sentences.forEach(sentence => {
      decisionPatterns.forEach(pattern => {
        const matches = Array.from(sentence.matchAll(pattern));
        matches.forEach(match => {
          if (match[2] && match[2].length > 10) {
            decisions.push(match[2].trim());
          }
        });
      });
    });
    
    return decisions;
  }

  /**
   * Extract action items
   */
  private static extractActionItems(sentences: string[]): string[] {
    const actionPatterns = [
      /\b(action item|ai|next action|to do|todo):\s*(.+)/gi,
      /\b(need to|should|must|will)\s+(.+)/gi
    ];
    
    const actions: string[] = [];
    
    sentences.forEach(sentence => {
      actionPatterns.forEach(pattern => {
        const matches = Array.from(sentence.matchAll(pattern));
        matches.forEach(match => {
          const action = match[2] || match[1];
          if (action && action.length > 5) {
            actions.push(action.trim());
          }
        });
      });
    });
    
    return actions;
  }

  /**
   * Extract questions and clarifications needed
   */
  private static extractQuestions(sentences: string[]): string[] {
    const questionPatterns = [
      /\?[^?]*$/g, // Sentences ending with ?
      /\b(question|ask|clarify|unclear|not sure|confirm|verify)\s+(.+)/gi,
      /\b(what|how|when|where|why|who)\s+(.+)/gi
    ];
    
    const questions: string[] = [];
    
    sentences.forEach(sentence => {
      if (sentence.includes('?')) {
        questions.push(sentence.trim());
      } else {
        questionPatterns.slice(1).forEach(pattern => {
          const matches = Array.from(sentence.matchAll(pattern));
          matches.forEach(match => {
            if (match[2] && match[2].length > 5) {
              questions.push(match[0].trim());
            }
          });
        });
      }
    });
    
    return questions;
  }

  /**
   * Extract blockers and issues
   */
  private static extractBlockers(sentences: string[]): string[] {
    const blockerPatterns = [
      /\b(blocked|blocker|stuck|issue|problem|can't|cannot|unable)\s+(.+)/gi,
      /\b(waiting for|depends on|need|require)\s+(.+)/gi
    ];
    
    const blockers: string[] = [];
    
    sentences.forEach(sentence => {
      blockerPatterns.forEach(pattern => {
        const matches = Array.from(sentence.matchAll(pattern));
        matches.forEach(match => {
          if (match[2] && match[2].length > 5) {
            blockers.push(match[0].trim());
          }
        });
      });
    });
    
    return blockers;
  }

  /**
   * Extract next steps
   */
  private static extractNextSteps(sentences: string[]): string[] {
    const nextStepPatterns = [
      /\b(next step|next|following|then|after)\s+(.+)/gi,
      /\b(upcoming|future|later|eventually)\s+(.+)/gi
    ];
    
    const nextSteps: string[] = [];
    
    sentences.forEach(sentence => {
      nextStepPatterns.forEach(pattern => {
        const matches = Array.from(sentence.matchAll(pattern));
        matches.forEach(match => {
          if (match[2] && match[2].length > 10) {
            nextSteps.push(match[2].trim());
          }
        });
      });
    });
    
    return nextSteps;
  }

  /**
   * Map actions to specific attendees
   */
  private static mapAttendeeActions(tasks: ParsedTask[], attendees: string[]): Record<string, string[]> {
    const attendeeActions: Record<string, string[]> = {};
    
    attendees.forEach(attendee => {
      attendeeActions[attendee] = [];
    });
    
    tasks.forEach(task => {
      if (task.assignee && attendeeActions[task.assignee]) {
        attendeeActions[task.assignee].push(task.text);
      }
    });
    
    return attendeeActions;
  }

  /**
   * Generate a summary of the meeting
   */
  private static generateSummary(
    note: MeetingNote, 
    tasks: ParsedTask[], 
    decisions: string[]
  ): string {
    const taskCount = tasks.length;
    const decisionCount = decisions.length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
    
    let summary = `Meeting "${note.title}" with ${note.attendees.length} attendees. `;
    
    if (taskCount > 0) {
      summary += `Generated ${taskCount} action item${taskCount !== 1 ? 's' : ''}`;
      if (highPriorityTasks > 0) {
        summary += ` (${highPriorityTasks} high priority)`;
      }
      summary += '. ';
    }
    
    if (decisionCount > 0) {
      summary += `Made ${decisionCount} key decision${decisionCount !== 1 ? 's' : ''}. `;
    }
    
    return summary.trim();
  }

  /**
   * Analyze sentiment of the meeting
   */
  private static analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'success', 'progress', 'achieved', 'completed', 'resolved'];
    const negativeWords = ['problem', 'issue', 'blocked', 'delayed', 'failed', 'concern', 'worried', 'stuck'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount + 1) return 'positive';
    if (negativeCount > positiveCount + 1) return 'negative';
    return 'neutral';
  }

  /**
   * Determine overall urgency level
   */
  private static determineUrgency(tasks: ParsedTask[], blockers: string[]): 'low' | 'medium' | 'high' {
    const urgentTasks = tasks.filter(t => t.priority === 'urgent').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    
    if (urgentTasks > 0 || blockers.length > 2) return 'high';
    if (highPriorityTasks > 2 || blockers.length > 0) return 'medium';
    return 'low';
  }

  /**
   * Helper methods for confidence calculation
   */
  private static hasSpecificDetails(text: string): boolean {
    return /\b(by|before|after|using|with|for|in|on)\s+\w+/.test(text);
  }

  private static hasTimeReference(text: string): boolean {
    return Object.values(this.TIME_PATTERNS).some(pattern => pattern.test(text));
  }

  private static hasAssignee(text: string): boolean {
    return this.ASSIGNEE_PATTERNS.some(pattern => pattern.test(text));
  }

  private static hasPriorityKeywords(text: string): boolean {
    return Object.values(this.PRIORITY_KEYWORDS).flat().some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  private static hasVagueLanguage(text: string): boolean {
    const vagueWords = ['maybe', 'perhaps', 'possibly', 'might', 'could be', 'not sure'];
    return vagueWords.some(word => text.toLowerCase().includes(word));
  }

  /**
   * Preprocess text for better parsing
   */
  private static preprocessText(text: string): string {
    return text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract sentences from text
   */
  private static extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);
  }

  /**
   * Clean extracted task text
   */
  private static cleanTaskText(text: string): string {
    return text
      .replace(/^(need to|should|must|will|going to|have to|let's|we'll)\s+/i, '')
      .replace(/^(todo|to do|action item|ai):\s*/i, '')
      .trim();
  }

  /**
   * Remove duplicate and similar tasks
   */
  private static deduplicateTasks(tasks: ParsedTask[]): ParsedTask[] {
    const uniqueTasks: ParsedTask[] = [];
    
    tasks.forEach(task => {
      const isDuplicate = uniqueTasks.some(existing => 
        this.calculateSimilarity(task.text, existing.text) > 0.8
      );
      
      if (!isDuplicate) {
        uniqueTasks.push(task);
      }
    });
    
    return uniqueTasks.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate text similarity (simple Jaccard similarity)
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Extract dependencies between tasks
   */
  private static extractDependencies(sentence: string, existingTasks: ParsedTask[]): string[] {
    const dependencyPatterns = [
      /\b(after|once|when|depends on|requires|needs)\s+(.+)/gi,
      /\b(before we can|first we need|prerequisite)\s+(.+)/gi
    ];
    
    const dependencies: string[] = [];
    
    dependencyPatterns.forEach(pattern => {
      const matches = Array.from(sentence.matchAll(pattern));
      matches.forEach(match => {
        const dependencyText = match[2];
        // Try to match with existing tasks
        existingTasks.forEach(task => {
          if (this.calculateSimilarity(dependencyText, task.text) > 0.6) {
            dependencies.push(task.id);
          }
        });
      });
    });
    
    return dependencies;
  }

  /**
   * Generate smart suggestions for task enhancement
   */
  static generateSmartSuggestions(
    task: ParsedTask, 
    boardMembers: BoardMember[],
    existingTasks: ParsedTask[]
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    
    // Assignee suggestions
    if (!task.assignee) {
      const suggestedAssignee = this.suggestAssignee(task, boardMembers);
      if (suggestedAssignee) {
        suggestions.push({
          id: `assignee-${task.id}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'assignee',
          suggestion: suggestedAssignee.name,
          confidence: suggestedAssignee.confidence,
          reasoning: suggestedAssignee.reasoning,
          context: task.text
        });
      }
    }
    
    // Due date suggestions
    if (!task.dueDate) {
      const suggestedDueDate = this.suggestDueDate(task);
      if (suggestedDueDate) {
        suggestions.push({
          id: `due-date-${task.id}-${Math.random().toString(36).substr(2, 6)}`,
          type: 'due_date',
          suggestion: suggestedDueDate.date,
          confidence: suggestedDueDate.confidence,
          reasoning: suggestedDueDate.reasoning,
          context: task.text
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Suggest assignee based on task content and team expertise
   */
  private static suggestAssignee(
    task: ParsedTask, 
    boardMembers: BoardMember[]
  ): { name: string; confidence: number; reasoning: string } | null {
    // This is a simplified version - in practice, you'd want to track
    // member expertise, past assignments, workload, etc.
    
    const taskText = task.text.toLowerCase();
    const expertiseKeywords = {
      'frontend': ['ui', 'frontend', 'react', 'css', 'design', 'interface'],
      'backend': ['api', 'backend', 'server', 'database', 'endpoint'],
      'design': ['design', 'wireframe', 'mockup', 'prototype', 'ux', 'ui'],
      'testing': ['test', 'qa', 'quality', 'bug', 'verify', 'validate'],
      'devops': ['deploy', 'deployment', 'infrastructure', 'ci/cd', 'pipeline']
    };
    
    for (const [expertise, keywords] of Object.entries(expertiseKeywords)) {
      if (keywords.some(keyword => taskText.includes(keyword))) {
        // In a real implementation, you'd match this with member skills
        const member = boardMembers[0]; // Simplified
        return {
          name: member.displayName,
          confidence: 70,
          reasoning: `Task involves ${expertise} work`
        };
      }
    }
    
    return null;
  }

  /**
   * Suggest due date based on task priority and content
   */
  private static suggestDueDate(
    task: ParsedTask
  ): { date: string; confidence: number; reasoning: string } | null {
    const now = new Date();
    
    switch (task.priority) {
      case 'urgent':
        return {
          date: now.toISOString().split('T')[0], // Today
          confidence: 80,
          reasoning: 'Urgent priority suggests immediate attention'
        };
      case 'high':
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return {
          date: tomorrow.toISOString().split('T')[0],
          confidence: 70,
          reasoning: 'High priority suggests completion within 1-2 days'
        };
      case 'medium':
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return {
          date: nextWeek.toISOString().split('T')[0],
          confidence: 60,
          reasoning: 'Medium priority suggests completion within a week'
        };
      default:
        return null;
    }
  }
} 