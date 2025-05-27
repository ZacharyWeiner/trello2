import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Settings, 
  Filter,
  Download,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target
} from 'lucide-react';
import { GanttTask, GanttTimeline, GanttViewSettings, GanttMilestone, CriticalPath } from '@/types/gantt';
import { GanttService } from '@/services/ganttService';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isWeekend } from 'date-fns';

interface GanttChartProps {
  timeline: GanttTimeline;
  onTaskUpdate?: (task: GanttTask) => void;
  onTaskClick?: (task: GanttTask) => void;
  onMilestoneClick?: (milestone: GanttMilestone) => void;
  className?: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  timeline,
  onTaskUpdate,
  onTaskClick,
  onMilestoneClick,
  className = ''
}) => {
  const [viewSettings, setViewSettings] = useState<GanttViewSettings>({
    timeScale: 'days',
    showWeekends: true,
    showDependencies: true,
    showProgress: true,
    showMilestones: true,
    showCriticalPath: false,
    groupBy: 'none',
    zoomLevel: 3
  });

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [criticalPath, setCriticalPath] = useState<CriticalPath | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline dimensions and dates
  const timelineDates = useMemo(() => {
    const start = startOfWeek(timeline.startDate);
    const end = endOfWeek(timeline.endDate);
    return eachDayOfInterval({ start, end });
  }, [timeline.startDate, timeline.endDate]);

  const dayWidth = useMemo(() => {
    const baseWidth = 40;
    return baseWidth * (viewSettings.zoomLevel / 3);
  }, [viewSettings.zoomLevel]);

  const totalWidth = timelineDates.length * dayWidth;

  // Group tasks based on settings
  const groupedTasks = useMemo(() => {
    let tasks = [...timeline.tasks];
    
    if (viewSettings.groupBy === 'assignee') {
      const groups = new Map<string, GanttTask[]>();
      tasks.forEach(task => {
        const assignee = task.assignedTo[0] || 'Unassigned';
        if (!groups.has(assignee)) groups.set(assignee, []);
        groups.get(assignee)!.push(task);
      });
      return Array.from(groups.entries()).map(([name, tasks]) => ({ name, tasks }));
    }
    
    if (viewSettings.groupBy === 'list') {
      const groups = new Map<string, GanttTask[]>();
      tasks.forEach(task => {
        if (!groups.has(task.listTitle)) groups.set(task.listTitle, []);
        groups.get(task.listTitle)!.push(task);
      });
      return Array.from(groups.entries()).map(([name, tasks]) => ({ name, tasks }));
    }
    
    if (viewSettings.groupBy === 'priority') {
      const priorityOrder = ['critical', 'high', 'medium', 'low'];
      const groups = new Map<string, GanttTask[]>();
      tasks.forEach(task => {
        if (!groups.has(task.priority)) groups.set(task.priority, []);
        groups.get(task.priority)!.push(task);
      });
      return priorityOrder
        .filter(priority => groups.has(priority))
        .map(priority => ({ name: priority, tasks: groups.get(priority)! }));
    }
    
    return [{ name: 'All Tasks', tasks }];
  }, [timeline.tasks, viewSettings.groupBy]);

  // Calculate critical path
  useEffect(() => {
    if (viewSettings.showCriticalPath) {
      // For now, we'll use existing dependencies from the dependency service
      // In a real implementation, you'd fetch actual dependencies
      const dependencies: any[] = []; // This would come from your dependency service
      const path = GanttService.calculateCriticalPath(timeline.tasks, dependencies);
      setCriticalPath(path);
    }
  }, [timeline.tasks, viewSettings.showCriticalPath]);

  // Detect conflicts
  useEffect(() => {
    const detectedConflicts = GanttService.detectConflicts(timeline.tasks);
    setConflicts(detectedConflicts);
  }, [timeline.tasks]);

  // Auto-play timeline
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentDate(prev => {
          const next = addDays(prev, 1);
          if (next > timeline.endDate) {
            setIsPlaying(false);
            return timeline.startDate;
          }
          return next;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, timeline.startDate, timeline.endDate]);

  // Get position for a date
  const getDatePosition = (date: Date): number => {
    const dayIndex = timelineDates.findIndex(d => 
      format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return dayIndex * dayWidth;
  };

  // Get task bar width
  const getTaskWidth = (task: GanttTask): number => {
    return Math.max(task.duration * dayWidth, 20); // Minimum 20px width
  };

  // Handle task drag
  const handleTaskDrag = (taskId: string, newStartDate: Date) => {
    if (onTaskUpdate) {
      const task = timeline.tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          startDate: newStartDate,
          endDate: addDays(newStartDate, task.duration)
        };
        onTaskUpdate(updatedTask);
      }
    }
  };

  // Render task bar
  const renderTaskBar = (task: GanttTask, groupIndex: number, taskIndex: number) => {
    const x = getDatePosition(task.startDate);
    const width = getTaskWidth(task);
    const y = (groupIndex * 60) + (taskIndex * 40) + 80; // Header offset + group spacing
    const isCritical = criticalPath?.taskIds.includes(task.id);
    const isSelected = selectedTask === task.id;
    const hasConflict = conflicts.some(c => c.taskIds.includes(task.id));

    return (
      <motion.g
        key={task.id}
        initial={{ opacity: 0, x: x - 20 }}
        animate={{ opacity: 1, x }}
        transition={{ duration: 0.3 }}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setSelectedTask(task.id);
          onTaskClick?.(task);
        }}
      >
        {/* Task bar background */}
        <rect
          x={0}
          y={y}
          width={width}
          height={30}
          rx={4}
          fill={isSelected ? '#3b82f6' : task.color}
          stroke={isCritical ? '#ef4444' : hasConflict ? '#f59e0b' : 'transparent'}
          strokeWidth={isCritical || hasConflict ? 2 : 0}
          opacity={0.8}
        />
        
        {/* Progress bar */}
        {viewSettings.showProgress && task.progress > 0 && (
          <rect
            x={0}
            y={y}
            width={(width * task.progress) / 100}
            height={30}
            rx={4}
            fill={task.status === 'completed' ? '#10b981' : '#3b82f6'}
            opacity={0.6}
          />
        )}
        
        {/* Task text */}
        <text
          x={8}
          y={y + 20}
          fill="white"
          fontSize="12"
          fontWeight="500"
          style={{ pointerEvents: 'none' }}
        >
          {task.title.length > 20 ? `${task.title.substring(0, 20)}...` : task.title}
        </text>
        
        {/* Status indicators */}
        {task.status === 'blocked' && (
          <circle cx={width - 15} cy={y + 15} r={6} fill="#ef4444" />
        )}
        {task.status === 'completed' && (
          <circle cx={width - 15} cy={y + 15} r={6} fill="#10b981" />
        )}
        
        {/* Assignee indicator */}
        {task.assignedTo.length > 0 && (
          <circle cx={width - 30} cy={y + 15} r={8} fill="#6b7280" opacity={0.7} />
        )}
      </motion.g>
    );
  };

  // Render milestone
  const renderMilestone = (milestone: GanttMilestone) => {
    const x = getDatePosition(milestone.date);
    
    return (
      <motion.g
        key={milestone.id}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ cursor: 'pointer' }}
        onClick={() => onMilestoneClick?.(milestone)}
      >
        {/* Milestone diamond */}
        <polygon
          points={`${x},20 ${x + 10},35 ${x},50 ${x - 10},35`}
          fill={milestone.completed ? '#10b981' : milestone.color}
          stroke="#ffffff"
          strokeWidth={2}
        />
        
        {/* Milestone line */}
        <line
          x1={x}
          y1={50}
          x2={x}
          y2={groupedTasks.length * 60 + 80}
          stroke={milestone.color}
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity={0.5}
        />
        
        {/* Milestone label */}
        <text
          x={x}
          y={15}
          textAnchor="middle"
          fill="#374151"
          fontSize="10"
          fontWeight="500"
        >
          {milestone.title}
        </text>
      </motion.g>
    );
  };

  // Render timeline header
  const renderTimelineHeader = () => {
    return (
      <g>
        {/* Background */}
        <rect x={0} y={0} width={totalWidth} height={60} fill="#f9fafb" />
        
        {/* Date labels */}
        {timelineDates.map((date, index) => {
          const x = index * dayWidth;
          const isWeekendDay = isWeekend(date);
          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isCurrentDate = format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
          
          return (
            <g key={index}>
              {/* Weekend background */}
              {isWeekendDay && viewSettings.showWeekends && (
                <rect
                  x={x}
                  y={0}
                  width={dayWidth}
                  height={groupedTasks.length * 60 + 80}
                  fill="#f3f4f6"
                  opacity={0.5}
                />
              )}
              
              {/* Today indicator */}
              {isToday && (
                <rect
                  x={x}
                  y={0}
                  width={dayWidth}
                  height={groupedTasks.length * 60 + 80}
                  fill="#3b82f6"
                  opacity={0.1}
                />
              )}
              
              {/* Current date indicator (for playback) */}
              {isCurrentDate && isPlaying && (
                <line
                  x1={x + dayWidth / 2}
                  y1={0}
                  x2={x + dayWidth / 2}
                  y2={groupedTasks.length * 60 + 80}
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              )}
              
              {/* Date text */}
              <text
                x={x + dayWidth / 2}
                y={20}
                textAnchor="middle"
                fill={isWeekendDay ? '#9ca3af' : '#374151'}
                fontSize="10"
                fontWeight={isToday ? '600' : '400'}
              >
                {format(date, 'MMM d')}
              </text>
              
              <text
                x={x + dayWidth / 2}
                y={35}
                textAnchor="middle"
                fill={isWeekendDay ? '#9ca3af' : '#6b7280'}
                fontSize="8"
              >
                {format(date, 'EEE')}
              </text>
              
              {/* Grid line */}
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={groupedTasks.length * 60 + 80}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className={`gantt-chart bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{timeline.title}</h3>
          
          {/* Timeline controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setCurrentDate(timeline.startDate)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Reset Timeline"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => setViewSettings(prev => ({ 
              ...prev, 
              zoomLevel: Math.max(1, prev.zoomLevel - 1) 
            }))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={viewSettings.zoomLevel <= 1}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round((viewSettings.zoomLevel / 5) * 100)}%
          </span>
          
          <button
            onClick={() => setViewSettings(prev => ({ 
              ...prev, 
              zoomLevel: Math.min(5, prev.zoomLevel + 1) 
            }))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={viewSettings.zoomLevel >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          
          {/* View settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target className="h-4 w-4" />
          <span>{timeline.tasks.length} Tasks</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4" />
          <span>{timeline.tasks.filter(t => t.status === 'completed').length} Completed</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{timeline.tasks.filter(t => t.status === 'in_progress').length} In Progress</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{timeline.milestones.length} Milestones</span>
        </div>
        
        {conflicts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{conflicts.length} Conflicts</span>
          </div>
        )}
      </div>

      {/* Main Chart Area */}
      <div className="relative overflow-auto" style={{ maxHeight: '600px' }}>
        <div className="flex">
          {/* Task List Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
            <div className="h-16 border-b border-gray-200 flex items-center px-4">
              <span className="text-sm font-medium text-gray-700">Tasks</span>
            </div>
            
            {groupedTasks.map((group, groupIndex) => (
              <div key={group.name}>
                {viewSettings.groupBy !== 'none' && (
                  <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      {group.name}
                    </span>
                  </div>
                )}
                
                {group.tasks.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    className={`px-4 py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-100 ${
                      selectedTask === task.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedTask(task.id);
                      onTaskClick?.(task);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="text-sm text-gray-900 truncate">
                        {task.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                      </span>
                      
                      {task.progress > 0 && (
                        <span className="text-xs text-blue-600">
                          {task.progress}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Timeline Chart */}
          <div className="flex-1 relative" ref={chartRef}>
            <svg
              width={totalWidth}
              height={groupedTasks.length * 60 + 80}
              className="block"
            >
              {/* Timeline header */}
              {renderTimelineHeader()}
              
              {/* Milestones */}
              {viewSettings.showMilestones && timeline.milestones.map(renderMilestone)}
              
              {/* Task bars */}
              {groupedTasks.map((group, groupIndex) =>
                group.tasks.map((task, taskIndex) =>
                  renderTaskBar(task, groupIndex, taskIndex)
                )
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}; 