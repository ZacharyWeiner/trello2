'use client';

import React, { useState } from 'react';
import { GanttChart } from '@/components/gantt/GanttChart';
import { GanttViewManager } from '@/components/gantt/GanttViewManager';
import { GanttService } from '@/services/ganttService';
import { GanttTimeline, GanttTask, GanttMilestone } from '@/types/gantt';
import { Board, List, Card } from '@/types';
import { Calendar, Play, RotateCcw, Settings } from 'lucide-react';

export default function GanttDemoPage() {
  const [showGanttManager, setShowGanttManager] = useState(false);

  // Sample board data
  const sampleBoard: Board = {
    id: 'demo-board',
    title: 'Website Redesign Project',
    description: 'Complete redesign of company website with modern UI/UX',
    background: {
      type: 'color',
      value: '#3b82f6'
    },
    backgroundColor: '#3b82f6',
    createdBy: 'system',
    members: [
      {
        userId: 'user1',
        email: 'alice@example.com',
        displayName: 'Alice Johnson',
        photoURL: '',
        role: 'admin',
        joinedAt: new Date(),
        invitedBy: 'system'
      },
      {
        userId: 'user2',
        email: 'bob@example.com',
        displayName: 'Bob Smith',
        photoURL: '',
        role: 'member',
        joinedAt: new Date(),
        invitedBy: 'user1'
      },
      {
        userId: 'user3',
        email: 'carol@example.com',
        displayName: 'Carol Davis',
        photoURL: '',
        role: 'member',
        joinedAt: new Date(),
        invitedBy: 'user1'
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  const sampleLists: List[] = [
    {
      id: 'list1',
      title: 'Planning',
      boardId: 'demo-board',
      position: 0,
      listType: 'todo',
      color: '#ef4444',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list2',
      title: 'Design',
      boardId: 'demo-board',
      position: 1,
      listType: 'doing',
      color: '#f97316',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list3',
      title: 'Development',
      boardId: 'demo-board',
      position: 2,
      listType: 'doing',
      color: '#3b82f6',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list4',
      title: 'Testing',
      boardId: 'demo-board',
      position: 3,
      listType: 'doing',
      color: '#8b5cf6',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list5',
      title: 'Completed',
      boardId: 'demo-board',
      position: 4,
      listType: 'done',
      color: '#10b981',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ];

  const sampleCards: Card[] = [
    // Planning Phase
    {
      id: 'card1',
      title: 'Project Requirements Analysis',
      description: 'Gather and analyze all project requirements, stakeholder needs, and technical constraints.',
      listId: 'list5', // Completed
      boardId: 'demo-board',
      position: 0,
      createdBy: 'user1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-05')
    },
    {
      id: 'card2',
      title: 'User Research & Personas',
      description: 'Conduct user research and create detailed user personas for the new website.',
      listId: 'list5', // Completed
      boardId: 'demo-board',
      position: 1,
      createdBy: 'user2',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-10')
    },

    // Design Phase
    {
      id: 'card3',
      title: 'Wireframes & Information Architecture',
      description: 'Create detailed wireframes and establish the information architecture for all pages.',
      listId: 'list2', // Design
      boardId: 'demo-board',
      position: 0,
      createdBy: 'user2',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date()
    },
    {
      id: 'card4',
      title: 'Visual Design & Branding',
      description: 'Develop the visual design language, color schemes, typography, and branding elements.',
      listId: 'list2', // Design
      boardId: 'demo-board',
      position: 1,
      createdBy: 'user2',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },

    // Development Phase
    {
      id: 'card5',
      title: 'Frontend Development Setup',
      description: 'Set up the development environment, build tools, and project structure.',
      listId: 'list3', // Development
      boardId: 'demo-board',
      position: 0,
      createdBy: 'user1',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(),
      priority: 'urgent',
      estimatedHours: 32,
      checklists: [
        {
          id: 'checklist1',
          title: 'Setup Tasks',
          items: [
            { id: 'item1', text: 'Next.js setup', completed: true, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item2', text: 'Tailwind CSS configuration', completed: true, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item3', text: 'Component structure', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item4', text: 'Build pipeline', completed: false, createdAt: new Date(), updatedAt: new Date() }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'card6',
      title: 'Homepage Implementation',
      description: 'Implement the homepage with all sections, animations, and responsive design.',
      listId: 'list3', // Development
      boardId: 'demo-board',
      position: 1,
      createdBy: 'user3',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date(),
      priority: 'high',
      estimatedHours: 80,
      checklists: [
        {
          id: 'checklist2',
          title: 'Homepage Sections',
          items: [
            { id: 'item5', text: 'Hero section', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item6', text: 'Features section', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item7', text: 'Testimonials', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item8', text: 'Footer', completed: false, createdAt: new Date(), updatedAt: new Date() }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'card7',
      title: 'Product Pages Development',
      description: 'Build dynamic product pages with filtering, search, and detailed views.',
      listId: 'list1', // Planning (not started)
      boardId: 'demo-board',
      position: 0,
      createdBy: 'user3',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      priority: 'medium',
      estimatedHours: 100,
      checklists: [
        {
          id: 'checklist3',
          title: 'Product Features',
          items: [
            { id: 'item9', text: 'Product listing page', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item10', text: 'Product detail page', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item11', text: 'Search functionality', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item12', text: 'Filter system', completed: false, createdAt: new Date(), updatedAt: new Date() }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },

    // Testing Phase
    {
      id: 'card8',
      title: 'Cross-browser Testing',
      description: 'Test the website across different browsers and devices for compatibility.',
      listId: 'list1', // Planning (not started)
      boardId: 'demo-board',
      position: 1,
      createdBy: 'user2',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date(),
      priority: 'medium',
      estimatedHours: 40,
      checklists: [
        {
          id: 'checklist4',
          title: 'Browser Testing',
          items: [
            { id: 'item13', text: 'Chrome testing', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item14', text: 'Firefox testing', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item15', text: 'Safari testing', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item16', text: 'Mobile testing', completed: false, createdAt: new Date(), updatedAt: new Date() }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'card9',
      title: 'Performance Optimization',
      description: 'Optimize website performance, loading times, and SEO.',
      listId: 'list1', // Planning (not started)
      boardId: 'demo-board',
      position: 2,
      createdBy: 'user1',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date(),
      priority: 'high',
      estimatedHours: 32,
      checklists: [
        {
          id: 'checklist5',
          title: 'Optimization Tasks',
          items: [
            { id: 'item17', text: 'Image optimization', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item18', text: 'Code splitting', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item19', text: 'SEO optimization', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item20', text: 'Performance audit', completed: false, createdAt: new Date(), updatedAt: new Date() }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'card10',
      title: 'Launch Preparation',
      description: 'Final preparations for website launch including deployment and monitoring setup.',
      listId: 'list1', // Planning (not started)
      boardId: 'demo-board',
      position: 3,
      createdBy: 'user1',
      createdAt: new Date('2024-02-25'),
      updatedAt: new Date(),
      priority: 'urgent',
      estimatedHours: 24,
      checklists: [
        {
          id: 'checklist6',
          title: 'Launch Checklist',
          items: [
            { id: 'item21', text: 'Production deployment', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item22', text: 'Domain setup', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item23', text: 'Analytics setup', completed: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'item24', text: 'Launch announcement', completed: false, createdAt: new Date(), updatedAt: new Date() }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  ];

  // Generate timeline from sample data
  const timeline = GanttService.convertBoardToGantt(sampleBoard, sampleLists, sampleCards);

  const handleTaskUpdate = (task: any) => {
    console.log('Task updated:', task);
  };

  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task);
  };

  const handleMilestoneClick = (milestone: any) => {
    console.log('Milestone clicked:', milestone);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Gantt Chart Demo
                </h1>
                <p className="text-sm text-gray-600">
                  Interactive project timeline visualization
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowGanttManager(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Open Full View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Project Overview: {sampleBoard.title}
          </h2>
          <p className="text-gray-600 mb-6">{sampleBoard.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{timeline.tasks.length}</div>
              <div className="text-sm text-blue-800">Total Tasks</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {timeline.tasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-green-800">Completed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {timeline.tasks.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-sm text-yellow-800">In Progress</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{timeline.milestones.length}</div>
              <div className="text-sm text-purple-800">Milestones</div>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <GanttChart
            timeline={timeline}
            onTaskUpdate={handleTaskUpdate}
            onTaskClick={handleTaskClick}
            onMilestoneClick={handleMilestoneClick}
          />
        </div>

        {/* Features List */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gantt Chart Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Interactive task bars with progress visualization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Milestone tracking with diamond indicators</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Timeline playback with date progression</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Zoom controls and view customization</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Task grouping by assignee, list, or priority</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Conflict detection and resource management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Export functionality for project documentation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Responsive design for mobile and desktop</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Gantt View Manager */}
      <GanttViewManager
        isOpen={showGanttManager}
        onClose={() => setShowGanttManager(false)}
        board={sampleBoard}
        lists={sampleLists}
        cards={sampleCards}
        onCardUpdate={(updatedCard) => {
          console.log('Card updated:', updatedCard);
        }}
      />
    </div>
  );
}