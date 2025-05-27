'use client';

import React, { useState } from 'react';
import { BoardTemplate, BoardBackground } from '@/types';
import { X, Search, Zap, Users, Target, Calendar, CheckSquare, Layers } from 'lucide-react';

interface BoardTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: BoardTemplate) => void;
}

// Built-in board templates
const BUILT_IN_TEMPLATES: Omit<BoardTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Kanban Board',
    description: 'A simple Kanban board for visualizing work and limiting work-in-progress',
    category: 'productivity',
    type: 'kanban',
    isBuiltIn: true,
    usageCount: 0,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    lists: [
      { title: 'Backlog', position: 0, listType: 'backlog' },
      { title: 'To Do', position: 1, listType: 'todo' },
      { title: 'In Progress', position: 2, listType: 'doing', wipLimit: 3 },
      { title: 'Review', position: 3, listType: 'review' },
      { title: 'Done', position: 4, listType: 'done' },
    ],
    labels: [
      { id: 'bug', name: 'Bug', color: '#ef4444' },
      { id: 'feature', name: 'Feature', color: '#10b981' },
      { id: 'improvement', name: 'Improvement', color: '#3b82f6' },
      { id: 'urgent', name: 'Urgent', color: '#f59e0b' },
    ],
    customFields: [],
    settings: {
      allowComments: true,
      allowVoting: false,
      cardAging: true,
      calendarView: true,
      timeTracking: false,
      customCardLayouts: false,
    },
    sampleCards: [
      {
        listIndex: 0, // Backlog
        cards: [
          {
            title: 'Welcome to your Kanban board!',
            description: 'This is a sample card to help you get started. You can edit or delete it.',
            position: 0,
            labels: [{ id: 'feature', name: 'Feature', color: '#10b981' }],
            createdBy: '',
          },
          {
            title: 'Add your first real task',
            description: 'Replace this sample card with your actual work items.',
            position: 1,
            labels: [{ id: 'improvement', name: 'Improvement', color: '#3b82f6' }],
            createdBy: '',
          },
        ],
      },
      {
        listIndex: 1, // To Do
        cards: [
          {
            title: 'Plan your workflow',
            description: 'Organize your tasks by priority and dependencies.',
            position: 0,
            labels: [{ id: 'feature', name: 'Feature', color: '#10b981' }],
            createdBy: '',
          },
        ],
      },
    ],
  },
  {
    name: 'Scrum Board',
    description: 'Agile Scrum board with sprint planning and story points',
    category: 'development',
    type: 'scrum',
    isBuiltIn: true,
    usageCount: 0,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    lists: [
      { title: 'Product Backlog', position: 0, listType: 'backlog' },
      { title: 'Sprint Backlog', position: 1, listType: 'todo' },
      { title: 'In Progress', position: 2, listType: 'doing', wipLimit: 5 },
      { title: 'Testing', position: 3, listType: 'review' },
      { title: 'Done', position: 4, listType: 'done' },
    ],
    labels: [
      { id: 'story', name: 'User Story', color: '#10b981' },
      { id: 'task', name: 'Task', color: '#3b82f6' },
      { id: 'bug', name: 'Bug', color: '#ef4444' },
      { id: 'epic', name: 'Epic', color: '#8b5cf6' },
    ],
    customFields: [
      {
        id: 'story-points',
        name: 'Story Points',
        type: 'number',
        required: false,
        position: 0,
        showOnCard: true,
      },
      {
        id: 'sprint',
        name: 'Sprint',
        type: 'dropdown',
        required: false,
        options: ['Sprint 1', 'Sprint 2', 'Sprint 3'],
        position: 1,
        showOnCard: true,
      },
    ],
    settings: {
      allowComments: true,
      allowVoting: true,
      cardAging: false,
      calendarView: true,
      timeTracking: true,
      customCardLayouts: true,
    },
    sampleCards: [
      {
        listIndex: 0, // Product Backlog
        cards: [
          {
            title: 'User can log in to the application',
            description: 'As a user, I want to log in so that I can access my personal dashboard.',
            position: 0,
            labels: [{ id: 'story', name: 'User Story', color: '#10b981' }],
            customFieldValues: [
              { fieldId: 'story-points', value: 5 },
            ],
            createdBy: '',
          },
          {
            title: 'Set up project infrastructure',
            description: 'Configure development environment, CI/CD pipeline, and deployment.',
            position: 1,
            labels: [{ id: 'task', name: 'Task', color: '#3b82f6' }],
            customFieldValues: [
              { fieldId: 'story-points', value: 8 },
            ],
            createdBy: '',
          },
        ],
      },
      {
        listIndex: 1, // Sprint Backlog
        cards: [
          {
            title: 'Design login page mockups',
            description: 'Create wireframes and visual designs for the login interface.',
            position: 0,
            labels: [{ id: 'task', name: 'Task', color: '#3b82f6' }],
            customFieldValues: [
              { fieldId: 'story-points', value: 3 },
              { fieldId: 'sprint', value: 'Sprint 1' },
            ],
            createdBy: '',
          },
        ],
      },
    ],
  },
  {
    name: 'Getting Things Done (GTD)',
    description: 'David Allen\'s GTD methodology for personal productivity',
    category: 'personal',
    type: 'gtd',
    isBuiltIn: true,
    usageCount: 0,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    lists: [
      { title: 'Inbox', position: 0, listType: 'backlog' },
      { title: 'Next Actions', position: 1, listType: 'todo' },
      { title: 'Waiting For', position: 2, listType: 'review' },
      { title: 'Projects', position: 3, listType: 'doing' },
      { title: 'Someday/Maybe', position: 4, listType: 'custom' },
      { title: 'Done', position: 5, listType: 'done' },
    ],
    labels: [
      { id: 'context-home', name: '@Home', color: '#10b981' },
      { id: 'context-office', name: '@Office', color: '#3b82f6' },
      { id: 'context-calls', name: '@Calls', color: '#f59e0b' },
      { id: 'context-errands', name: '@Errands', color: '#ef4444' },
    ],
    customFields: [
      {
        id: 'energy-level',
        name: 'Energy Level',
        type: 'dropdown',
        required: false,
        options: ['High', 'Medium', 'Low'],
        position: 0,
        showOnCard: true,
      },
      {
        id: 'time-required',
        name: 'Time Required',
        type: 'dropdown',
        required: false,
        options: ['< 15 min', '15-30 min', '30-60 min', '> 1 hour'],
        position: 1,
        showOnCard: true,
      },
    ],
    settings: {
      allowComments: true,
      allowVoting: false,
      cardAging: true,
      calendarView: true,
      timeTracking: false,
      customCardLayouts: false,
    },
    sampleCards: [
      {
        listIndex: 0, // Inbox
        cards: [
          {
            title: 'Process inbox items',
            description: 'Review and organize all captured items according to GTD methodology.',
            position: 0,
            labels: [{ id: 'context-office', name: '@Office', color: '#3b82f6' }],
            customFieldValues: [
              { fieldId: 'energy-level', value: 'Medium' },
              { fieldId: 'time-required', value: '30-60 min' },
            ],
            createdBy: '',
          },
        ],
      },
      {
        listIndex: 1, // Next Actions
        cards: [
          {
            title: 'Call dentist to schedule appointment',
            description: 'Schedule routine cleaning appointment.',
            position: 0,
            labels: [{ id: 'context-calls', name: '@Calls', color: '#f59e0b' }],
            customFieldValues: [
              { fieldId: 'energy-level', value: 'Low' },
              { fieldId: 'time-required', value: '< 15 min' },
            ],
            createdBy: '',
          },
          {
            title: 'Buy groceries for the week',
            description: 'Get items from the shopping list.',
            position: 1,
            labels: [{ id: 'context-errands', name: '@Errands', color: '#ef4444' }],
            customFieldValues: [
              { fieldId: 'energy-level', value: 'Medium' },
              { fieldId: 'time-required', value: '30-60 min' },
            ],
            createdBy: '',
          },
        ],
      },
    ],
  },
  {
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns with content calendar',
    category: 'marketing',
    type: 'custom',
    isBuiltIn: true,
    usageCount: 0,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    lists: [
      { title: 'Ideas', position: 0, listType: 'backlog' },
      { title: 'Planning', position: 1, listType: 'todo' },
      { title: 'In Production', position: 2, listType: 'doing' },
      { title: 'Review & Approval', position: 3, listType: 'review' },
      { title: 'Scheduled', position: 4, listType: 'custom' },
      { title: 'Published', position: 5, listType: 'done' },
    ],
    labels: [
      { id: 'social-media', name: 'Social Media', color: '#3b82f6' },
      { id: 'email', name: 'Email', color: '#10b981' },
      { id: 'blog', name: 'Blog', color: '#8b5cf6' },
      { id: 'video', name: 'Video', color: '#ef4444' },
    ],
    customFields: [
      {
        id: 'publish-date',
        name: 'Publish Date',
        type: 'date',
        required: false,
        position: 0,
        showOnCard: true,
      },
      {
        id: 'platform',
        name: 'Platform',
        type: 'dropdown',
        required: false,
        options: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'Blog'],
        position: 1,
        showOnCard: true,
      },
    ],
    settings: {
      allowComments: true,
      allowVoting: false,
      cardAging: false,
      calendarView: true,
      timeTracking: false,
      customCardLayouts: true,
    },
    sampleCards: [
      {
        listIndex: 0, // Ideas
        cards: [
          {
            title: 'Product launch announcement',
            description: 'Create content for announcing our new product across all channels.',
            position: 0,
            labels: [{ id: 'social-media', name: 'Social Media', color: '#3b82f6' }],
            createdBy: '',
          },
          {
            title: 'Customer success story blog post',
            description: 'Interview a happy customer and write a case study.',
            position: 1,
            labels: [{ id: 'blog', name: 'Blog', color: '#8b5cf6' }],
            createdBy: '',
          },
        ],
      },
      {
        listIndex: 1, // Planning
        cards: [
          {
            title: 'Q1 social media calendar',
            description: 'Plan and schedule social media posts for the first quarter.',
            position: 0,
            labels: [{ id: 'social-media', name: 'Social Media', color: '#3b82f6' }],
            customFieldValues: [
              { fieldId: 'platform', value: 'Facebook' },
            ],
            createdBy: '',
          },
        ],
      },
    ],
  },
  {
    name: 'Design Project',
    description: 'Manage design projects from concept to delivery',
    category: 'design',
    type: 'custom',
    isBuiltIn: true,
    usageCount: 0,
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    },
    lists: [
      { title: 'Brief', position: 0, listType: 'backlog' },
      { title: 'Research', position: 1, listType: 'todo' },
      { title: 'Concept', position: 2, listType: 'doing' },
      { title: 'Design', position: 3, listType: 'doing' },
      { title: 'Review', position: 4, listType: 'review' },
      { title: 'Delivered', position: 5, listType: 'done' },
    ],
    labels: [
      { id: 'ui-design', name: 'UI Design', color: '#3b82f6' },
      { id: 'ux-research', name: 'UX Research', color: '#10b981' },
      { id: 'branding', name: 'Branding', color: '#8b5cf6' },
      { id: 'illustration', name: 'Illustration', color: '#f59e0b' },
    ],
    customFields: [
      {
        id: 'client',
        name: 'Client',
        type: 'text',
        required: false,
        position: 0,
        showOnCard: true,
      },
      {
        id: 'design-type',
        name: 'Design Type',
        type: 'dropdown',
        required: false,
        options: ['Web Design', 'Mobile App', 'Logo', 'Print', 'Illustration'],
        position: 1,
        showOnCard: true,
      },
    ],
    settings: {
      allowComments: true,
      allowVoting: true,
      cardAging: false,
      calendarView: true,
      timeTracking: true,
      customCardLayouts: true,
    },
    sampleCards: [
      {
        listIndex: 0, // Brief
        cards: [
          {
            title: 'Client onboarding meeting',
            description: 'Initial meeting to understand project requirements and goals.',
            position: 0,
            labels: [{ id: 'ux-research', name: 'UX Research', color: '#10b981' }],
            customFieldValues: [
              { fieldId: 'client', value: 'Acme Corp' },
              { fieldId: 'design-type', value: 'Web Design' },
            ],
            createdBy: '',
          },
        ],
      },
      {
        listIndex: 1, // Research
        cards: [
          {
            title: 'Competitor analysis',
            description: 'Research and analyze competitor websites and design patterns.',
            position: 0,
            labels: [{ id: 'ux-research', name: 'UX Research', color: '#10b981' }],
            customFieldValues: [
              { fieldId: 'design-type', value: 'Web Design' },
            ],
            createdBy: '',
          },
          {
            title: 'User persona development',
            description: 'Create detailed user personas based on research data.',
            position: 1,
            labels: [{ id: 'ux-research', name: 'UX Research', color: '#10b981' }],
            createdBy: '',
          },
        ],
      },
    ],
  },
];

export const BoardTemplateSelector: React.FC<BoardTemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: Layers },
    { id: 'productivity', name: 'Productivity', icon: Target },
    { id: 'development', name: 'Development', icon: Zap },
    { id: 'marketing', name: 'Marketing', icon: Users },
    { id: 'design', name: 'Design', icon: Layers },
    { id: 'personal', name: 'Personal', icon: CheckSquare },
  ];

  const filteredTemplates = BUILT_IN_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'kanban':
        return <Layers className="h-6 w-6" />;
      case 'scrum':
        return <Zap className="h-6 w-6" />;
      case 'gtd':
        return <CheckSquare className="h-6 w-6" />;
      default:
        return <Target className="h-6 w-6" />;
    }
  };

  const handleTemplateSelect = (template: Omit<BoardTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    const fullTemplate: BoardTemplate = {
      ...template,
      id: `template-${template.type}-${Date.now()}`,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onSelect(fullTemplate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Choose a Template
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Start with a pre-built template to get up and running quickly
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categories */}
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 
                           hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Template Preview */}
                  <div 
                    className="h-32 rounded-t-lg relative overflow-hidden"
                    style={{ background: template.background.value }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all" />
                    <div className="absolute top-3 left-3 text-white">
                      {getTemplateIcon(template.type)}
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
                        {template.lists.length} lists
                      </span>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {template.name}
                      </h3>
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {template.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.labels.slice(0, 3).map((label) => (
                        <span
                          key={label.id}
                          className="text-xs px-2 py-1 rounded text-white"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </span>
                      ))}
                      {template.labels.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{template.labels.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{template.customFields.length} custom fields</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {template.settings.calendarView ? 'Calendar' : 'Board only'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 