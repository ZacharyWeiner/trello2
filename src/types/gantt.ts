// Gantt Chart Types
export interface GanttTask {
  id: string;
  cardId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  progress: number; // 0-100
  dependencies: string[]; // Array of task IDs this task depends on
  assignedTo: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  listId: string;
  listTitle: string;
  color: string;
  milestone: boolean;
  parentTaskId?: string; // For subtasks
  estimatedHours?: number;
  actualHours?: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'on_hold';
}

export interface GanttMilestone {
  id: string;
  title: string;
  date: Date;
  description?: string;
  color: string;
  completed: boolean;
  linkedTaskIds: string[];
}

export interface GanttTimeline {
  id: string;
  boardId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  tasks: GanttTask[];
  milestones: GanttMilestone[];
  workingDays: number[]; // 0-6, Sunday-Saturday
  holidays: Date[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GanttViewSettings {
  timeScale: 'days' | 'weeks' | 'months' | 'quarters';
  showWeekends: boolean;
  showDependencies: boolean;
  showProgress: boolean;
  showMilestones: boolean;
  showCriticalPath: boolean;
  groupBy: 'none' | 'assignee' | 'list' | 'priority';
  zoomLevel: number; // 1-5
}

export interface GanttDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number; // days
}

export interface CriticalPath {
  taskIds: string[];
  totalDuration: number;
  startDate: Date;
  endDate: Date;
}

export interface GanttConflict {
  id: string;
  type: 'resource_overallocation' | 'dependency_violation' | 'date_conflict';
  taskIds: string[];
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
} 