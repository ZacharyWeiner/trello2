import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Settings, Download, Maximize, Minimize } from 'lucide-react';
import { GanttChart } from './GanttChart';
import { GanttService } from '@/services/ganttService';
import { GanttTask, GanttTimeline, GanttMilestone } from '@/types/gantt';
import { Board, List, Card } from '@/types';

interface GanttViewManagerProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  lists: List[];
  cards: Card[];
  onCardUpdate?: (card: Card) => void;
}

export const GanttViewManager: React.FC<GanttViewManagerProps> = ({
  isOpen,
  onClose,
  board,
  lists,
  cards,
  onCardUpdate
}) => {
  const [timeline, setTimeline] = useState<GanttTimeline | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);

  // Generate timeline from board data
  useEffect(() => {
    if (isOpen && board && lists && cards) {
      setIsLoading(true);
      try {
        const ganttTimeline = GanttService.convertBoardToGantt(board, lists, cards);
        setTimeline(ganttTimeline);
      } catch (error) {
        console.error('Error generating Gantt timeline:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen, board, lists, cards]);

  // Handle task updates
  const handleTaskUpdate = (updatedTask: GanttTask) => {
    if (!timeline) return;

    // Update the timeline
    const updatedTimeline = {
      ...timeline,
      tasks: timeline.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    };
    setTimeline(updatedTimeline);

    // Update the original card if callback provided
    if (onCardUpdate) {
      const originalCard = cards.find(card => card.id === updatedTask.cardId);
      if (originalCard) {
        const updatedCard = {
          ...originalCard,
          // Map Gantt task properties back to card properties
          // This would depend on your card data structure
        };
        onCardUpdate(updatedCard);
      }
    }
  };

  // Handle task click
  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task);
  };

  // Handle milestone click
  const handleMilestoneClick = (milestone: GanttMilestone) => {
    console.log('Milestone clicked:', milestone);
    // You could open a milestone details modal here
  };

  // Export timeline
  const handleExport = () => {
    if (!timeline) return;

    const exportData = {
      timeline,
      exportDate: new Date().toISOString(),
      boardInfo: {
        id: board.id,
        title: board.title
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.title}-gantt-timeline.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          isFullscreen ? 'p-0' : 'p-4'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <motion.div
          className={`bg-white rounded-lg shadow-2xl overflow-hidden ${
            isFullscreen ? 'w-full h-full' : 'w-full max-w-7xl h-5/6'
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Gantt Timeline: {board.title}
                </h2>
                <p className="text-sm text-gray-600">
                  Visual project timeline with dependencies and milestones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Export button */}
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Export Timeline"
              >
                <Download className="h-5 w-5 text-gray-600" />
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5 text-gray-600" />
                ) : (
                  <Maximize className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Close Gantt View"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Generating Timeline
                  </h3>
                  <p className="text-gray-600">
                    Converting your board data into a visual timeline...
                  </p>
                </div>
              </div>
            ) : timeline ? (
              <div className="h-full flex">
                {/* Main Gantt Chart */}
                <div className="flex-1">
                  <GanttChart
                    timeline={timeline}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskClick={handleTaskClick}
                    onMilestoneClick={handleMilestoneClick}
                    className="h-full"
                  />
                </div>

                {/* Task Details Sidebar */}
                {selectedTask && (
                  <motion.div
                    className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto"
                    initial={{ x: 320 }}
                    animate={{ x: 0 }}
                    exit={{ x: 320 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Task Details
                        </h3>
                        <button
                          onClick={() => setSelectedTask(null)}
                          className="p-1 rounded hover:bg-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Task Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <div className="text-sm text-gray-900">{selectedTask.title}</div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <div className="text-sm text-gray-900">
                              {selectedTask.startDate.toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <div className="text-sm text-gray-900">
                              {selectedTask.endDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <div className="text-sm text-gray-900">
                            {selectedTask.duration} day{selectedTask.duration !== 1 ? 's' : ''}
                          </div>
                        </div>

                        {/* Progress */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Progress
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${selectedTask.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {selectedTask.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedTask.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            selectedTask.status === 'blocked' ? 'bg-red-100 text-red-800' :
                            selectedTask.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedTask.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Priority */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                          </label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedTask.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            selectedTask.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {selectedTask.priority}
                          </span>
                        </div>

                        {/* Assigned To */}
                        {selectedTask.assignedTo.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Assigned To
                            </label>
                            <div className="space-y-1">
                              {selectedTask.assignedTo.map((assignee, index) => (
                                <div key={index} className="text-sm text-gray-900">
                                  {assignee}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* List */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            List
                          </label>
                          <div className="text-sm text-gray-900">{selectedTask.listTitle}</div>
                        </div>

                        {/* Dependencies */}
                        {selectedTask.dependencies.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Dependencies
                            </label>
                            <div className="text-sm text-gray-600">
                              {selectedTask.dependencies.length} task{selectedTask.dependencies.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        )}

                        {/* Estimated vs Actual Hours */}
                        {(selectedTask.estimatedHours || selectedTask.actualHours) && (
                          <div className="grid grid-cols-2 gap-4">
                            {selectedTask.estimatedHours && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Estimated Hours
                                </label>
                                <div className="text-sm text-gray-900">
                                  {selectedTask.estimatedHours}h
                                </div>
                              </div>
                            )}
                            {selectedTask.actualHours && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Actual Hours
                                </label>
                                <div className="text-sm text-gray-900">
                                  {selectedTask.actualHours}h
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Timeline Data
                  </h3>
                  <p className="text-gray-600">
                    Unable to generate timeline from current board data.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 