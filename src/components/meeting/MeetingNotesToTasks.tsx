'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Zap, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar, 
  AlertTriangle,
  Lightbulb,
  Plus,
  X,
  Edit3,
  Save,
  Trash2,
  Target,
  Brain,
  Sparkles,
  Users,
  MessageSquare,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { MeetingParserService } from '@/services/meetingParserService';
import { 
  MeetingNote, 
  ParsedTask, 
  MeetingAnalysis, 
  SmartSuggestion,
  TaskExtractionRule 
} from '@/types/meeting';
import { Board, List, Card, BoardMember } from '@/types';

interface MeetingNotesToTasksProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  lists: List[];
  onTasksCreated: (tasks: Card[]) => void;
}

export const MeetingNotesToTasks: React.FC<MeetingNotesToTasksProps> = ({
  isOpen,
  onClose,
  board,
  lists,
  onTasksCreated
}) => {
  const [meetingNote, setMeetingNote] = useState<MeetingNote>({
    id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    content: '',
    date: new Date(),
    attendees: [],
    boardId: board.id,
    createdBy: 'current-user', // Would come from auth
    tags: [],
    meetingType: 'general',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customRules, setCustomRules] = useState<TaskExtractionRule[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'tasks'>('input');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [meetingNote.content]);

  // Real-time processing with debounce
  useEffect(() => {
    if (meetingNote.content.length > 50) {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      processingTimeoutRef.current = setTimeout(() => {
        processNotes();
      }, 1000); // 1 second debounce
    }

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [meetingNote.content]);

  const processNotes = async () => {
    if (!meetingNote.content.trim()) return;

    setIsProcessing(true);
    try {
      const result = await MeetingParserService.parseMeetingNotes(
        meetingNote,
        board,
        customRules
      );
      setAnalysis(result);
      
      // Generate suggestions for tasks
      const allSuggestions: SmartSuggestion[] = [];
      result.extractedTasks.forEach(task => {
        const taskSuggestions = MeetingParserService.generateSmartSuggestions(
          task,
          board.members,
          result.extractedTasks
        );
        allSuggestions.push(...taskSuggestions);
      });
      setSuggestions(allSuggestions);

      // Auto-select high-confidence tasks
      const highConfidenceTasks = result.extractedTasks
        .filter(task => task.confidence >= 80)
        .map(task => task.id);
      setSelectedTasks(new Set(highConfidenceTasks));

      if (activeTab === 'input' && result.extractedTasks.length > 0) {
        setActiveTab('tasks');
      }
    } catch (error) {
      console.error('Error processing meeting notes:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleTaskEdit = (taskId: string, newText: string) => {
    if (!analysis) return;
    
    const updatedTasks = analysis.extractedTasks.map(task =>
      task.id === taskId ? { ...task, text: newText } : task
    );
    
    setAnalysis({
      ...analysis,
      extractedTasks: updatedTasks
    });
    setEditingTask(null);
  };

  const handleCreateTasks = () => {
    if (!analysis) return;

    const tasksToCreate = analysis.extractedTasks.filter(task =>
      selectedTasks.has(task.id)
    );

    const cards: Card[] = tasksToCreate.map((task, index) => ({
      id: `card-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
      title: task.text,
      description: `Generated from meeting: ${meetingNote.title}\n\nContext: ${task.context}`,
      listId: getTargetListId(task),
      boardId: board.id,
      position: index,
      createdBy: meetingNote.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Extended properties
      priority: task.priority,
      dueDate: task.dueDate,
      assignees: task.assignee ? [task.assignee] : undefined,
      estimatedHours: task.estimatedHours
    }));

    onTasksCreated(cards);
    onClose();
  };

  const getTargetListId = (task: ParsedTask): string => {
    // Smart list assignment based on task type and priority
    if (task.actionType === 'blocker' || task.priority === 'urgent') {
      return lists.find(l => l.listType === 'doing')?.id || lists[0]?.id || '';
    }
    
    if (task.actionType === 'question') {
      return lists.find(l => l.title.toLowerCase().includes('question'))?.id || 
             lists.find(l => l.listType === 'todo')?.id || lists[0]?.id || '';
    }
    
    return lists.find(l => l.listType === 'todo')?.id || lists[0]?.id || '';
  };

  const applySuggestion = (suggestion: SmartSuggestion) => {
    if (!analysis) return;

    const updatedTasks = analysis.extractedTasks.map(task => {
      if (suggestion.context === task.text) {
        switch (suggestion.type) {
          case 'assignee':
            return { ...task, assignee: suggestion.suggestion };
          case 'due_date':
            return { ...task, dueDate: new Date(suggestion.suggestion) };
          case 'priority':
            return { ...task, priority: suggestion.suggestion as ParsedTask['priority'] };
          default:
            return task;
        }
      }
      return task;
    });

    setAnalysis({
      ...analysis,
      extractedTasks: updatedTasks
    });

    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const getPriorityColor = (priority: ParsedTask['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionTypeIcon = (actionType: ParsedTask['actionType']) => {
    switch (actionType) {
      case 'todo': return <Target className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      case 'decision': return <CheckCircle className="h-4 w-4" />;
      case 'question': return <MessageSquare className="h-4 w-4" />;
      case 'blocker': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Force visible text for all meeting form inputs */
          .meeting-form input,
          .meeting-form textarea,
          .meeting-form select {
            color: #1f2937 !important;
            background-color: #ffffff !important;
          }
          
          .meeting-form input::placeholder,
          .meeting-form textarea::placeholder {
            color: #6b7280 !important;
            opacity: 1 !important;
          }
          
          /* Specific fix for meeting notes textarea */
          .meeting-notes-input {
            color: #1f2937 !important;
            background-color: #ffffff !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
          }
          
          .meeting-notes-input::placeholder {
            color: #6b7280 !important;
            opacity: 1 !important;
          }
        `
      }} />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Smart Meeting Notes to Tasks
                </h2>
                <p className="text-sm text-gray-600">
                  Transform your meeting notes into actionable tasks automatically
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isProcessing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: 'input', label: 'Meeting Notes', icon: Edit3 },
              { id: 'analysis', label: 'Analysis', icon: TrendingUp },
              { id: 'tasks', label: 'Generated Tasks', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'tasks' && analysis && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                    {analysis.extractedTasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'input' && (
              <div className="h-full flex">
                {/* Input Section */}
                <div className="flex-1 p-6 meeting-form">
                  <div className="space-y-4">
                    {/* Meeting Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meeting Title
                        </label>
                        <input
                          type="text"
                          value={meetingNote.title}
                          onChange={(e) => setMeetingNote(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Sprint Planning Meeting"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            color: '#1f2937', 
                            backgroundColor: '#ffffff',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meeting Type
                        </label>
                        <select
                          value={meetingNote.meetingType}
                          onChange={(e) => setMeetingNote(prev => ({ 
                            ...prev, 
                            meetingType: e.target.value as MeetingNote['meetingType'] 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ 
                            color: '#1f2937', 
                            backgroundColor: '#ffffff',
                            fontSize: '14px',
                          }}
                        >
                          <option value="general">General</option>
                          <option value="standup">Standup</option>
                          <option value="planning">Planning</option>
                          <option value="review">Review</option>
                          <option value="brainstorm">Brainstorm</option>
                        </select>
                      </div>
                    </div>

                    {/* Attendees */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attendees
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {board.members.map(member => (
                          <button
                            key={member.userId}
                            onClick={() => {
                              const isSelected = meetingNote.attendees.includes(member.displayName);
                              setMeetingNote(prev => ({
                                ...prev,
                                attendees: isSelected
                                  ? prev.attendees.filter(name => name !== member.displayName)
                                  : [...prev.attendees, member.displayName]
                              }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              meetingNote.attendees.includes(member.displayName)
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {member.displayName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Meeting Notes */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meeting Notes
                      </label>
                      <textarea
                        ref={textareaRef}
                        value={meetingNote.content}
                        onChange={(e) => setMeetingNote(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Paste your meeting notes here... 

Examples of what I can extract:
• 'John needs to update the documentation by Friday'
• 'TODO: Review the API design'
• 'Sarah will create wireframes for the new feature'
• 'We decided to use React for the frontend'
• 'Blocked by missing database credentials'
• 'Follow up with the client next week'"
                        className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none meeting-notes-input"
                        style={{ 
                          color: '#1f2937',
                          backgroundColor: '#ffffff',
                          fontSize: '14px',
                          lineHeight: '1.5',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                {analysis && (
                  <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Live Preview</h3>
                    
                    <div className="space-y-3">
                      {analysis.extractedTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-2">
                            {getActionTypeIcon(task.actionType)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">{task.text}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {Math.round(task.confidence)}% confidence
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {analysis.extractedTasks.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{analysis.extractedTasks.length - 3} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analysis' && analysis && (
              <div className="h-full overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary Stats */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{analysis.extractedTasks.length}</div>
                        <div className="text-sm text-gray-600">Tasks Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analysis.keyDecisions.length}</div>
                        <div className="text-sm text-gray-600">Decisions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{analysis.questions.length}</div>
                        <div className="text-sm text-gray-600">Questions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{analysis.blockers.length}</div>
                        <div className="text-sm text-gray-600">Blockers</div>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment & Urgency */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Insights</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Sentiment</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          analysis.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                          analysis.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {analysis.sentiment}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Urgency Level</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          analysis.urgencyLevel === 'high' ? 'bg-red-100 text-red-700' :
                          analysis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {analysis.urgencyLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Decisions */}
                  {analysis.keyDecisions.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Decisions</h3>
                      <div className="space-y-2">
                        {analysis.keyDecisions.map((decision, index) => (
                          <div key={`decision-${index}`} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{decision}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  {analysis.questions.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions & Clarifications</h3>
                      <div className="space-y-2">
                        {analysis.questions.map((question, index) => (
                          <div key={`question-${index}`} className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && analysis && (
              <div className="h-full flex">
                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generated Tasks ({analysis.extractedTasks.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedTasks.size} selected
                      </span>
                      <button
                        onClick={() => setSelectedTasks(new Set(analysis.extractedTasks.map(t => t.id)))}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {analysis.extractedTasks.map(task => (
                      <motion.div
                        key={task.id}
                        className={`bg-white p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedTasks.has(task.id)
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleTaskToggle(task.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            selectedTasks.has(task.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedTasks.has(task.id) && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {editingTask === task.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  defaultValue={task.text}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleTaskEdit(task.id, e.currentTarget.value);
                                    } else if (e.key === 'Escape') {
                                      setEditingTask(null);
                                    }
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-500 placeholder-visible"
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTask(null);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-gray-900 font-medium">{task.text}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTask(task.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                {getActionTypeIcon(task.actionType)}
                                <span className="text-xs text-gray-500 capitalize">
                                  {task.actionType.replace('_', ' ')}
                                </span>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>

                              <span className="text-xs text-gray-500">
                                {Math.round(task.confidence)}% confidence
                              </span>

                              {task.assignee && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">{task.assignee}</span>
                                </div>
                              )}

                              {task.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    {task.dueDate.toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-gray-500 mt-1 italic">
                              Context: "{task.context}"
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Suggestions Sidebar */}
                {suggestions.length > 0 && (
                  <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Smart Suggestions
                    </h3>
                    
                    <div className="space-y-3">
                      {suggestions.map(suggestion => (
                        <div key={suggestion.id} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 uppercase">
                              {suggestion.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {suggestion.confidence}%
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-900 mb-2">{suggestion.suggestion}</p>
                          <p className="text-xs text-gray-600 mb-3">{suggestion.reasoning}</p>
                          
                          <button
                            onClick={() => applySuggestion(suggestion)}
                            className="w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Apply Suggestion
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              {analysis && (
                <div className="text-sm text-gray-600">
                  Processed in {Math.round(Date.now() - analysis.processedAt.getTime())}ms
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCreateTasks}
                disabled={selectedTasks.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 