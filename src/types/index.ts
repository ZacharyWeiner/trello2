export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  lastActive: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  compactMode: boolean;
  animationsEnabled: boolean;
}

export interface BoardMember {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  invitedBy: string;
}

export interface BoardInvitation {
  id: string;
  boardId: string;
  boardTitle: string;
  inviterEmail: string;
  inviterName: string;
  inviteeEmail: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  token: string;
}

// Board Background Types
export interface BoardBackground {
  type: 'color' | 'gradient' | 'pattern' | 'image' | 'unsplash';
  value: string;
  pattern?: 'dots' | 'grid' | 'diagonal';
  opacity?: number;
  unsplashId?: string;
  unsplashUrl?: string;
  unsplashCredit?: {
    name: string;
    username: string;
    profileUrl: string;
  };
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  background?: BoardBackground;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  members: BoardMember[];
  labels?: Label[];
  isTemplate?: boolean;
  templateCategory?: string;
  templateType?: 'kanban' | 'scrum' | 'gtd' | 'custom';
  customFields?: CustomField[];
  boardSettings?: BoardSettings;
}

export interface BoardSettings {
  allowComments: boolean;
  allowVoting: boolean;
  cardAging: boolean;
  calendarView: boolean;
  timeTracking: boolean;
  customCardLayouts: boolean;
}

// Board Template Types
export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'development' | 'marketing' | 'design' | 'personal';
  type: 'kanban' | 'scrum' | 'gtd' | 'custom';
  isBuiltIn: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  
  // Template structure
  background: BoardBackground;
  lists: Omit<List, 'id' | 'boardId' | 'createdAt' | 'updatedAt'>[];
  labels: Label[];
  customFields: CustomField[];
  settings: BoardSettings;
  
  // Sample cards (optional)
  sampleCards?: {
    listIndex: number;
    cards: Omit<Card, 'id' | 'listId' | 'boardId' | 'createdAt' | 'updatedAt' | 'createdBy'>[];
  }[];
}

// Custom Field Types
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'dropdown' | 'person' | 'url';
  required: boolean;
  options?: string[]; // For dropdown fields
  defaultValue?: any;
  position: number;
  showOnCard: boolean;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  listType?: 'backlog' | 'todo' | 'doing' | 'review' | 'done' | 'custom';
  wipLimit?: number;
  color?: string;
}

export interface Card {
  id: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  position: number;
  dueDate?: Date;
  labels?: Label[];
  assignees?: string[];
  cover?: string;
  coverImage?: string;
  attachments?: Attachment[];
  comments?: Comment[];
  checklists?: Checklist[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: CardDependency[];
  blockedBy?: CardDependency[];
  customFieldValues?: CustomFieldValue[];
  layout?: CardLayout;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints?: number;
  votes?: CardVote[];
  polls?: CardPoll[];
  priorityScore?: number;
  watchers?: string[];
  archived?: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  originalListId?: string; // Store original list for restoration
  videoLinks?: VideoCallLink[];
}

export interface VideoCallLink {
  id: string;
  type: 'zoom' | 'meet' | 'teams' | 'other';
  url: string;
  title?: string;
  createdAt: Date;
  createdBy: string;
}

// Enhanced dependency interface
export interface CardDependency {
  cardId: string;
  cardTitle: string;
  boardId: string;
  boardTitle: string;
  listId: string;
  listTitle: string;
  type: 'blocks' | 'blocked_by' | 'related';
  createdBy: string;
  createdAt: Date;
  reason?: string; // Optional reason for the dependency
}

// Card Voting/Polling Types
export interface CardVote {
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto?: string;
  voteType: 'priority' | 'approval' | 'effort' | 'custom';
  value: number; // 1-5 for priority/effort, 1 for approval, custom range for custom
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardPoll {
  id: string;
  title: string;
  description?: string;
  type: 'priority' | 'approval' | 'effort' | 'custom';
  options?: PollOption[]; // For custom polls
  allowComments: boolean;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'closed' | 'draft';
  votes: CardVote[];
  results?: PollResults;
}

export interface PollOption {
  id: string;
  text: string;
  color?: string;
  icon?: string;
}

export interface PollResults {
  totalVotes: number;
  averageScore?: number; // For numeric votes
  distribution: { [key: string]: number }; // Vote count per option/value
  topVoters: string[]; // User IDs of most active voters
  lastUpdated: Date;
}

// Custom Card Layout Types
export interface CardLayout {
  type: 'default' | 'compact' | 'detailed' | 'kanban' | 'scrum';
  showFields: {
    description: boolean;
    dueDate: boolean;
    assignees: boolean;
    labels: boolean;
    attachments: boolean;
    comments: boolean;
    checklists: boolean;
    customFields: boolean;
    priority: boolean;
    storyPoints: boolean;
  };
  fieldOrder: string[];
}

export interface CustomFieldValue {
  fieldId: string;
  value: any;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  mentions?: string[];
  reactions?: CommentReaction[];
  type?: 'text' | 'gif' | 'voice';
  gifUrl?: string;
  voiceNote?: VoiceNote;
  edited?: boolean;
}

export interface CommentReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: Date;
}

export interface VoiceNote {
  id: string;
  url: string;
  duration: number; // in seconds
  waveform?: number[]; // Audio waveform data for visualization
  transcription?: string; // Optional AI transcription
  uploadedAt: Date;
}

export interface RealtimePresence {
  userId: string;
  boardId: string;
  cardId?: string;
  cursor?: { x: number; y: number };
  lastSeen: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'card_assigned' | 'card_due' | 'comment_mention' | 'board_invitation' | 'card_moved';
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: Date;
}

export interface SearchFilters {
  query?: string;
  labels?: string[];
  assignees?: string[];
  dueDateRange?: { start: Date; end: Date };
  boards?: string[];
  lists?: string[];
  hasAttachments?: boolean;
  isOverdue?: boolean;
  hasComments?: boolean;
  hasChecklists?: boolean;
  createdBy?: string[];
  createdDateRange?: { start: Date; end: Date };
  updatedDateRange?: { start: Date; end: Date };
  cardStatus?: 'all' | 'with_due_date' | 'no_due_date' | 'completed_checklists' | 'incomplete_checklists';
}

export interface SearchResult {
  type: 'board' | 'card' | 'comment';
  id: string;
  title: string;
  description?: string;
  boardId: string;
  boardTitle: string;
  listId?: string;
  listTitle?: string;
  cardId?: string;
  relevanceScore: number;
  matchedFields: string[];
  snippet?: string;
  labels?: Label[];
  dueDate?: Date;
  assignees?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  useCount: number;
  lastUsed?: Date;
}

export interface QuickFilter {
  id: string;
  name: string;
  icon: string;
  filters: Partial<SearchFilters>;
  color: string;
}

// Real-time collaboration types
export interface UserPresence {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  lastSeen: Date;
  isOnline: boolean;
  currentBoard?: string;
  currentCard?: string;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface BoardPresence {
  boardId: string;
  users: UserPresence[];
  lastUpdated: Date;
}

export interface CardActivity {
  cardId: string;
  userId: string;
  action: 'viewing' | 'editing' | 'commenting';
  timestamp: Date;
}

export interface RealtimeUpdate {
  type: 'board' | 'list' | 'card' | 'presence';
  action: 'created' | 'updated' | 'deleted' | 'moved';
  data: any;
  userId: string;
  timestamp: Date;
}

// Card Templates & Automation
export interface CardTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  isBuiltIn: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  
  // Template content
  title: string;
  cardDescription?: string;
  labels?: Label[];
  assignees?: string[];
  checklists?: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>[];
  cover?: string;
  estimatedHours?: number;
  
  // Automation rules
  automationRules?: AutomationRule[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isBuiltIn: boolean;
  sortOrder: number;
}

export interface AutomationRule {
  id: string;
  type: 'due_date' | 'assign_labels' | 'assign_members' | 'move_to_list' | 'add_checklist';
  trigger: AutomationTrigger;
  action: AutomationAction;
  isActive: boolean;
  conditions?: AutomationCondition[];
}

export interface AutomationTrigger {
  type: 'card_created' | 'card_moved' | 'due_date_approaching' | 'checklist_completed' | 'label_added';
  listId?: string; // For list-specific triggers
  labelId?: string; // For label-specific triggers
  daysBeforeDue?: number; // For due date triggers
}

export interface AutomationAction {
  type: 'set_due_date' | 'add_labels' | 'assign_members' | 'move_to_list' | 'add_checklist' | 'send_notification';
  
  // Due date actions
  dueDateOffset?: {
    type: 'days' | 'weeks' | 'months';
    value: number;
    from: 'creation' | 'current_date' | 'list_entry';
  };
  
  // Label/member actions
  labelIds?: string[];
  memberIds?: string[];
  
  // List movement
  targetListId?: string;
  
  // Checklist actions
  checklistTemplate?: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>;
  
  // Notification actions
  notificationMessage?: string;
  notifyMembers?: string[];
}

export interface AutomationCondition {
  type: 'list_name' | 'label_present' | 'member_assigned' | 'title_contains' | 'description_contains';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'not_equals';
  value: string;
}

export interface BoardAutomation {
  id: string;
  boardId: string;
  name: string;
  description?: string;
  rules: AutomationRule[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
  lastExecuted?: Date;
}

// Achievement System Types
export interface Achievement {
  id: string;
  type: 'badge' | 'streak' | 'milestone';
  category: 'productivity' | 'collaboration' | 'consistency' | 'quality';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: 'task_completion' | 'card_interaction' | 'streak' | 'team_activity' | 'custom';
  metric: string;
  target: number;
  timeframe?: 'day' | 'week' | 'month' | 'all_time';
  conditions?: Record<string, any>;
}

export interface UserAchievements {
  userId: string;
  totalPoints: number;
  level: number;
  badges: Badge[];
  streaks: Streak[];
  milestones: Milestone[];
  stats: UserStats;
  lastUpdated: Date;
}

export interface Badge {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  isNew?: boolean;
}

export interface Streak {
  type: 'daily_tasks' | 'weekly_contribution' | 'review_streak' | 'early_bird';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  startDate: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  completedAt?: Date;
  reward: string;
}

export interface UserStats {
  tasksCompleted: number;
  tasksCompletedToday: number;
  cardsCreated: number;
  cardsHelped: number;
  commentsPosted: number;
  checklistsCompleted: number;
  averageCompletionTime: number;
  earlyCompletions: number;
  collaborationScore: number;
  consistencyScore: number;
  onTimeCompletions: number;
  perfectCards: number;
  organizedCards: number;
  detailedCards: number;
  uniqueMentions: number;
  mentionsCount: number;
}

export interface LeaderboardEntry {
  userId: string;
  userEmail: string;
  userName: string;
  userPhoto?: string;
  rank: number;
  score: number;
  change: number; // Position change from last period
  achievements: number;
  level: number;
  stats: {
    tasksThisPeriod: number;
    streakDays: number;
    collaborationPoints: number;
  };
}

export interface Leaderboard {
  id: string;
  boardId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  metric: 'productivity' | 'collaboration' | 'consistency' | 'overall';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface AchievementNotification {
  id: string;
  userId: string;
  achievement: Achievement;
  unlockedAt: Date;
  seen: boolean;
  celebrated: boolean;
}

// Progress Visualization Types
export interface ProgressData {
  id: string;
  name: string;
  current: number;
  target: number;
  color: string;
  category: 'tasks' | 'lists' | 'boards' | 'team' | 'custom';
  icon?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  milestones?: ProgressMilestone[];
}

export interface ProgressMilestone {
  id: string;
  name: string;
  value: number;
  reached: boolean;
  reachedAt?: Date;
  color: string;
  icon?: string;
}

export interface TeamProgressRace {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  participants: TeamRaceParticipant[];
  category: 'tasks_completed' | 'cards_created' | 'comments_posted' | 'custom';
  target: number;
  isActive: boolean;
  theme: ProgressTheme;
}

export interface TeamRaceParticipant {
  userId: string;
  userName: string;
  userPhoto?: string;
  currentProgress: number;
  position: number;
  color: string;
  avatar?: string; // Fun avatar for the race
}

export interface BurndownChart {
  id: string;
  boardId: string;
  sprintName: string;
  startDate: Date;
  endDate: Date;
  totalWork: number;
  dailyData: BurndownDataPoint[];
  theme: BurndownTheme;
  isActive: boolean;
}

export interface BurndownDataPoint {
  date: Date;
  remainingWork: number;
  idealRemaining: number;
  completedWork: number;
  scope: number; // Track scope changes
}

export interface ProgressTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  animations: {
    duration: number;
    easing: string;
    effects: ('bounce' | 'pulse' | 'glow' | 'shake')[];
  };
  icons: {
    progress: string;
    milestone: string;
    celebration: string;
  };
  sounds?: {
    milestone: string;
    completion: string;
    levelUp: string;
  };
}

export interface BurndownTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    ideal: string;
    actual: string;
    scope: string;
    background: string;
    grid: string;
  };
  style: 'classic' | 'modern' | 'playful' | 'minimal';
  animations: boolean;
  particles?: {
    enabled: boolean;
    type: 'stars' | 'confetti' | 'bubbles' | 'fire';
    density: number;
  };
}

export interface ProgressVisualizationSettings {
  defaultTheme: string;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  showMilestones: boolean;
  showTeamRaces: boolean;
  compactMode: boolean;
} 