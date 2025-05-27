import { 
  GanttTask, 
  GanttTimeline, 
  GanttMilestone, 
  GanttDependency, 
  CriticalPath, 
  GanttConflict 
} from '@/types/gantt';
import { Card, List, Board } from '@/types';
import { addDays, differenceInDays, isWeekend, format } from 'date-fns';

export class GanttService {
  /**
   * Convert board data to Gantt timeline
   */
  static convertBoardToGantt(
    board: Board, 
    lists: List[], 
    cards: Card[]
  ): GanttTimeline {
    const tasks: GanttTask[] = cards.map(card => this.convertCardToGanttTask(card, lists));
    const milestones = this.extractMilestones(tasks, lists);
    
    const allDates = tasks.flatMap(task => [task.startDate, task.endDate]);
    const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    return {
      id: `gantt-${board.id}`,
      boardId: board.id,
      title: `${board.title} Timeline`,
      startDate,
      endDate,
      tasks,
      milestones,
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      holidays: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Convert individual card to Gantt task
   */
  private static convertCardToGanttTask(card: Card, lists: List[]): GanttTask {
    const list = lists.find(l => l.id === card.listId);
    const cardData = card as any; // Type assertion for extended properties
    
    // Estimate dates if not provided
    const startDate = cardData.startDate ? new Date(cardData.startDate) : new Date();
    const estimatedDuration = this.estimateTaskDuration(card);
    const endDate = cardData.endDate ? new Date(cardData.endDate) : addDays(startDate, estimatedDuration);
    
    // Calculate progress based on checklist completion or list position
    const progress = this.calculateTaskProgress(card, list);
    
    return {
      id: `task-${card.id}`,
      cardId: card.id,
      title: card.title,
      startDate,
      endDate,
      duration: differenceInDays(endDate, startDate) || 1,
      progress,
      dependencies: cardData.dependencies || [],
      assignedTo: cardData.assignedTo ? [cardData.assignedTo] : [],
      priority: cardData.priority || 'medium',
      listId: card.listId,
      listTitle: list?.title || 'Unknown',
      color: this.getTaskColor(card, list),
      milestone: cardData.milestone || false,
      estimatedHours: cardData.estimatedHours,
      actualHours: cardData.actualHours,
      status: this.getTaskStatus(card, list)
    };
  }

  /**
   * Estimate task duration based on card complexity
   */
  private static estimateTaskDuration(card: Card): number {
    const cardData = card as any;
    
    // If estimated hours provided, convert to days (8 hours = 1 day)
    if (cardData.estimatedHours) {
      return Math.ceil(cardData.estimatedHours / 8);
    }
    
    // Estimate based on description length and checklist items
    const descriptionLength = card.description?.length || 0;
    const checklistItems = cardData.checklist?.length || 0;
    
    let baseDuration = 1; // Default 1 day
    
    if (descriptionLength > 500) baseDuration += 2;
    else if (descriptionLength > 200) baseDuration += 1;
    
    if (checklistItems > 10) baseDuration += 3;
    else if (checklistItems > 5) baseDuration += 2;
    else if (checklistItems > 0) baseDuration += 1;
    
    // Priority adjustment
    if (cardData.priority === 'high') baseDuration += 1;
    if (cardData.priority === 'critical') baseDuration += 2;
    
    return Math.min(baseDuration, 14); // Cap at 2 weeks
  }

  /**
   * Calculate task progress
   */
  private static calculateTaskProgress(card: Card, list?: List): number {
    const cardData = card as any;
    
    // If checklist exists, use completion percentage
    if (cardData.checklist && cardData.checklist.length > 0) {
      const completed = cardData.checklist.filter((item: any) => item.completed).length;
      return Math.round((completed / cardData.checklist.length) * 100);
    }
    
    // Otherwise, use list-based progress
    if (list?.listType === 'done') return 100;
    if (list?.listType === 'doing') return 50;
    return 0;
  }

  /**
   * Get task color based on priority and list
   */
  private static getTaskColor(card: Card, list?: List): string {
    const cardData = card as any;
    
    if (cardData.priority === 'critical') return '#ef4444'; // Red
    if (cardData.priority === 'high') return '#f97316'; // Orange
    if (cardData.priority === 'medium') return '#3b82f6'; // Blue
    if (cardData.priority === 'low') return '#10b981'; // Green
    
    // Default to list color or blue
    return list?.color || '#3b82f6';
  }

  /**
   * Get task status
   */
  private static getTaskStatus(card: Card, list?: List): GanttTask['status'] {
    if (list?.listType === 'done') return 'completed';
    if (list?.listType === 'doing') return 'in_progress';
    
    const cardData = card as any;
    if (cardData.blocked) return 'blocked';
    if (cardData.onHold) return 'on_hold';
    
    return 'not_started';
  }

  /**
   * Extract milestones from tasks and lists
   */
  private static extractMilestones(tasks: GanttTask[], lists: List[]): GanttMilestone[] {
    const milestones: GanttMilestone[] = [];
    
    // Create milestones for list completions
    lists.forEach(list => {
      const listTasks = tasks.filter(task => task.listId === list.id);
      if (listTasks.length > 0) {
        const latestEndDate = new Date(Math.max(...listTasks.map(task => task.endDate.getTime())));
        
        milestones.push({
          id: `milestone-${list.id}`,
          title: `${list.title} Complete`,
          date: latestEndDate,
          description: `Completion of all tasks in ${list.title}`,
          color: list.color || '#8b5cf6',
          completed: list.listType === 'done',
          linkedTaskIds: listTasks.map(task => task.id)
        });
      }
    });
    
    // Add task-specific milestones
    tasks.filter(task => task.milestone).forEach(task => {
      milestones.push({
        id: `milestone-task-${task.id}`,
        title: task.title,
        date: task.endDate,
        description: `Milestone: ${task.title}`,
        color: task.color,
        completed: task.progress === 100,
        linkedTaskIds: [task.id]
      });
    });
    
    return milestones;
  }

  /**
   * Calculate critical path
   */
  static calculateCriticalPath(tasks: GanttTask[], dependencies: GanttDependency[]): CriticalPath {
    // Simplified critical path calculation
    // In a real implementation, you'd use a more sophisticated algorithm
    
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const dependencyMap = new Map<string, string[]>();
    
    // Build dependency map
    dependencies.forEach(dep => {
      if (!dependencyMap.has(dep.toTaskId)) {
        dependencyMap.set(dep.toTaskId, []);
      }
      dependencyMap.get(dep.toTaskId)!.push(dep.fromTaskId);
    });
    
    // Find longest path (simplified)
    let longestPath: string[] = [];
    let maxDuration = 0;
    
    tasks.forEach(task => {
      const path = this.findLongestPathFromTask(task.id, taskMap, dependencyMap);
      const pathDuration = path.reduce((sum, taskId) => {
        const t = taskMap.get(taskId);
        return sum + (t?.duration || 0);
      }, 0);
      
      if (pathDuration > maxDuration) {
        maxDuration = pathDuration;
        longestPath = path;
      }
    });
    
    const criticalTasks = longestPath.map(id => taskMap.get(id)!).filter(Boolean);
    const startDate = new Date(Math.min(...criticalTasks.map(t => t.startDate.getTime())));
    const endDate = new Date(Math.max(...criticalTasks.map(t => t.endDate.getTime())));
    
    return {
      taskIds: longestPath,
      totalDuration: maxDuration,
      startDate,
      endDate
    };
  }

  /**
   * Find longest path from a task (recursive)
   */
  private static findLongestPathFromTask(
    taskId: string,
    taskMap: Map<string, GanttTask>,
    dependencyMap: Map<string, string[]>,
    visited: Set<string> = new Set()
  ): string[] {
    if (visited.has(taskId)) return []; // Avoid cycles
    
    visited.add(taskId);
    const dependencies = dependencyMap.get(taskId) || [];
    
    if (dependencies.length === 0) {
      return [taskId];
    }
    
    let longestPath: string[] = [];
    dependencies.forEach(depId => {
      const path = this.findLongestPathFromTask(depId, taskMap, dependencyMap, new Set(visited));
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    });
    
    return [...longestPath, taskId];
  }

  /**
   * Detect scheduling conflicts
   */
  static detectConflicts(tasks: GanttTask[]): GanttConflict[] {
    const conflicts: GanttConflict[] = [];
    
    // Resource overallocation detection
    const assigneeWorkload = new Map<string, { date: Date; hours: number }[]>();
    
    tasks.forEach(task => {
      task.assignedTo.forEach(assignee => {
        if (!assigneeWorkload.has(assignee)) {
          assigneeWorkload.set(assignee, []);
        }
        
        // Distribute task hours across duration
        const dailyHours = (task.estimatedHours || task.duration * 8) / task.duration;
        const workload = assigneeWorkload.get(assignee)!;
        
        for (let d = new Date(task.startDate); d <= task.endDate; d = addDays(d, 1)) {
          if (!isWeekend(d)) {
            workload.push({ date: new Date(d), hours: dailyHours });
          }
        }
      });
    });
    
    // Check for overallocation (more than 8 hours per day)
    assigneeWorkload.forEach((workload, assignee) => {
      const dailyTotals = new Map<string, number>();
      
      workload.forEach(({ date, hours }) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        dailyTotals.set(dateKey, (dailyTotals.get(dateKey) || 0) + hours);
      });
      
      const overallocatedDays = Array.from(dailyTotals.entries())
        .filter(([_, hours]) => hours > 8);
      
      if (overallocatedDays.length > 0) {
        const affectedTasks = tasks.filter(task => 
          task.assignedTo.includes(assignee) &&
          overallocatedDays.some(([dateKey]) => {
            const date = new Date(dateKey);
            return date >= task.startDate && date <= task.endDate;
          })
        );
        
        conflicts.push({
          id: `overallocation-${assignee}`,
          type: 'resource_overallocation',
          taskIds: affectedTasks.map(t => t.id),
          description: `${assignee} is overallocated on ${overallocatedDays.length} days`,
          severity: overallocatedDays.length > 5 ? 'high' : 'medium',
          suggestions: [
            'Redistribute tasks across team members',
            'Extend task deadlines',
            'Reduce task scope'
          ]
        });
      }
    });
    
    return conflicts;
  }

  /**
   * Auto-schedule tasks based on dependencies and resources
   */
  static autoScheduleTasks(
    tasks: GanttTask[], 
    dependencies: GanttDependency[],
    startDate: Date = new Date()
  ): GanttTask[] {
    const scheduledTasks = [...tasks];
    const dependencyMap = new Map<string, GanttDependency[]>();
    
    // Build dependency map
    dependencies.forEach(dep => {
      if (!dependencyMap.has(dep.toTaskId)) {
        dependencyMap.set(dep.toTaskId, []);
      }
      dependencyMap.get(dep.toTaskId)!.push(dep);
    });
    
    // Topological sort for scheduling order
    const visited = new Set<string>();
    const scheduled = new Set<string>();
    
    const scheduleTask = (taskId: string): void => {
      if (scheduled.has(taskId)) return;
      
      const task = scheduledTasks.find(t => t.id === taskId);
      if (!task) return;
      
      const taskDependencies = dependencyMap.get(taskId) || [];
      
      // Schedule all dependencies first
      taskDependencies.forEach(dep => {
        if (!scheduled.has(dep.fromTaskId)) {
          scheduleTask(dep.fromTaskId);
        }
      });
      
      // Calculate earliest start date based on dependencies
      let earliestStart = startDate;
      
      taskDependencies.forEach(dep => {
        const depTask = scheduledTasks.find(t => t.id === dep.fromTaskId);
        if (depTask) {
          const depEndDate = addDays(depTask.endDate, dep.lag);
          if (depEndDate > earliestStart) {
            earliestStart = depEndDate;
          }
        }
      });
      
      // Update task dates
      task.startDate = earliestStart;
      task.endDate = addDays(earliestStart, task.duration);
      
      scheduled.add(taskId);
    };
    
    // Schedule all tasks
    scheduledTasks.forEach(task => scheduleTask(task.id));
    
    return scheduledTasks;
  }
} 