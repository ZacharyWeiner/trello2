'use client';

import React, { useState } from 'react';
import { MeetingNotesToTasks } from '@/components/meeting/MeetingNotesToTasks';
import { Brain, FileText, Zap, Target, Users, Clock, CheckCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { Board, List, Card } from '@/types';

export default function MeetingDemoPage() {
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Card[]>([]);

  // Sample board data
  const sampleBoard: Board = {
    id: 'demo-board',
    title: 'Product Development Team',
    description: 'Main product development board for our team',
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
      },
      {
        userId: 'user4',
        email: 'david@example.com',
        displayName: 'David Wilson',
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
      title: 'To Do',
      boardId: 'demo-board',
      position: 0,
      listType: 'todo',
      color: '#ef4444',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'list2',
      title: 'In Progress',
      boardId: 'demo-board',
      position: 1,
      listType: 'doing',
      color: '#f97316',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'list3',
      title: 'Review',
      boardId: 'demo-board',
      position: 2,
      listType: 'doing',
      color: '#8b5cf6',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'list4',
      title: 'Done',
      boardId: 'demo-board',
      position: 3,
      listType: 'done',
      color: '#10b981',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const sampleMeetingNotes = [
    {
      title: "Sprint Planning Meeting",
      type: "planning",
      content: `Sprint Planning Meeting - March 15, 2024

Attendees: Alice Johnson, Bob Smith, Carol Davis, David Wilson

Agenda:
1. Review last sprint
2. Plan upcoming sprint
3. Assign tasks

Discussion:
- Last sprint went well, completed 8 out of 10 story points
- Alice needs to finish the user authentication module by Friday
- Bob will start working on the payment integration next week
- Carol should review the API documentation and provide feedback
- David is blocked by missing database credentials from DevOps team
- TODO: Schedule follow-up meeting with stakeholders
- We decided to use Stripe for payment processing
- Need to clarify requirements for the mobile app with product team
- Sarah will create wireframes for the new dashboard
- URGENT: Fix the login bug that's affecting production users
- Follow up with the client about the contract renewal next Tuesday

Action Items:
- Alice: Complete authentication module (Due: Friday)
- Bob: Research payment integration options
- Carol: Review and approve API docs
- David: Contact DevOps for database access
- Team: Prepare demo for stakeholder meeting

Blockers:
- Database credentials still pending from DevOps
- Waiting for design approval from marketing team
- API rate limits causing issues in staging environment

Next Steps:
- Daily standups at 9 AM
- Demo preparation for Friday
- Code review session on Thursday`
    },
    {
      title: "Daily Standup",
      type: "standup",
      content: `Daily Standup - March 16, 2024

What we did yesterday:
- Alice: Worked on authentication module, 80% complete
- Bob: Researched payment gateways, Stripe looks promising
- Carol: Started API documentation review
- David: Still waiting for database credentials

What we're doing today:
- Alice will finish authentication testing
- Bob needs to create payment integration prototype
- Carol should complete API review by end of day
- David will follow up with DevOps team again

Blockers:
- David is still blocked by missing database access
- Carol found some issues in the API documentation that need clarification
- Production deployment is on hold until security review is complete

Questions:
- When will the security review be completed?
- Should we proceed with Stripe integration or wait for more options?
- Who can help David get the database credentials?

Decisions:
- We'll proceed with Stripe for now
- Alice will help David with the DevOps contact
- Carol will document the API issues for the backend team`
    },
    {
      title: "Product Review Meeting",
      type: "review",
      content: `Product Review Meeting - March 17, 2024

Attendees: Alice Johnson, Bob Smith, Carol Davis, Product Manager, QA Team

Review Items:
1. Authentication module demo
2. Payment integration progress
3. API documentation status
4. Bug reports and fixes

Feedback:
- Authentication module looks great, ready for production
- Payment integration needs more error handling
- API documentation is comprehensive but needs examples
- Found 3 critical bugs that need immediate attention

Action Items:
- Bob: Add error handling to payment flow (High priority)
- Carol: Add code examples to API docs
- Alice: Fix critical bugs in authentication
- QA Team: Prepare test cases for payment integration
- Product Manager: Schedule user acceptance testing

Critical Issues:
- Login timeout issue affecting 15% of users
- Payment form validation not working on mobile
- API returning 500 errors for large datasets

Decisions:
- Delay release by one week to fix critical issues
- Implement additional monitoring for payment flows
- Create automated tests for authentication module

Next Meeting: March 24, 2024`
    }
  ];

  const handleTasksCreated = (tasks: Card[]) => {
    setCreatedTasks(prev => [...prev, ...tasks]);
    console.log('Created tasks:', tasks);
  };

  const features = [
    {
      icon: Brain,
      title: "Smart Pattern Recognition",
      description: "Uses advanced NLP techniques to identify action items, decisions, and blockers from natural language"
    },
    {
      icon: Target,
      title: "Automatic Task Extraction",
      description: "Converts meeting notes into actionable tasks with priorities, assignees, and due dates"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Processes notes as you type with intelligent debouncing and live preview"
    },
    {
      icon: Users,
      title: "Smart Assignee Detection",
      description: "Automatically detects who should be assigned to each task based on context"
    },
    {
      icon: Clock,
      title: "Due Date Extraction",
      description: "Identifies time references and suggests appropriate due dates"
    },
    {
      icon: CheckCircle,
      title: "Confidence Scoring",
      description: "Each extracted task comes with a confidence score to help you review"
    }
  ];

  const extractionExamples = [
    {
      icon: Target,
      type: "Action Items",
      color: "blue",
      examples: [
        "Alice needs to update the documentation by Friday",
        "TODO: Review the API design",
        "Bob will create wireframes for the new feature",
        "We should schedule a follow-up meeting next week"
      ]
    },
    {
      icon: CheckCircle,
      type: "Decisions",
      color: "green",
      examples: [
        "We decided to use React for the frontend",
        "Agreed to postpone the launch until next month",
        "Team concluded that Stripe is the best payment option",
        "Resolved to implement automated testing"
      ]
    },
    {
      icon: MessageSquare,
      type: "Questions",
      color: "purple",
      examples: [
        "Who can help with the database setup?",
        "When will the security review be completed?",
        "Should we proceed with the current design?",
        "Need to clarify requirements with stakeholders"
      ]
    },
    {
      icon: AlertTriangle,
      type: "Blockers",
      color: "red",
      examples: [
        "Blocked by missing API documentation",
        "Waiting for approval from legal team",
        "Can't proceed without database credentials",
        "Issue with deployment pipeline is blocking release"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Smart Meeting Notes to Tasks
                </h1>
                <p className="text-sm text-gray-600">
                  Transform meeting notes into actionable tasks automatically
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMeetingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Brain className="h-4 w-4" />
              <span>Try It Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Never Miss an Action Item Again
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our smart parser uses advanced natural language processing to automatically extract 
            tasks, decisions, questions, and blockers from your meeting notes - no AI API required!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* What We Can Extract */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What We Can Extract From Your Notes
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {extractionExamples.map((category, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                    <category.icon className={`h-5 w-5 text-${category.color}-600`} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{category.type}</h4>
                </div>
                
                <div className="space-y-2">
                  {category.examples.map((example, exampleIndex) => (
                    <div key={exampleIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 italic">"{example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Meeting Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Try With Sample Meeting Notes
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sampleMeetingNotes.map((note, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{note.title}</h4>
                </div>
                
                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    note.type === 'planning' ? 'bg-blue-100 text-blue-700' :
                    note.type === 'standup' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {note.type}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                    {note.content.substring(0, 200)}...
                  </pre>
                </div>
                
                <button
                  onClick={() => {
                    // Pre-fill the modal with this sample note
                    setShowMeetingModal(true);
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try This Example
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Paste Notes",
                description: "Copy your meeting notes into the text area",
                icon: FileText
              },
              {
                step: "2",
                title: "Smart Analysis",
                description: "Our parser analyzes the text using NLP patterns",
                icon: Brain
              },
              {
                step: "3",
                title: "Extract Tasks",
                description: "Tasks are automatically identified and categorized",
                icon: Target
              },
              {
                step: "4",
                title: "Create Cards",
                description: "Selected tasks become cards in your board",
                icon: CheckCircle
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <div className="p-3 bg-white rounded-lg mb-3">
                  <step.icon className="h-8 w-8 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Created Tasks Display */}
        {createdTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Recently Created Tasks ({createdTasks.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {createdTasks.map((task, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {task.priority || 'medium'}
                    </span>
                    {task.assignees && task.assignees.length > 0 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {task.assignees[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meeting Notes Modal */}
      <MeetingNotesToTasks
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        board={sampleBoard}
        lists={sampleLists}
        onTasksCreated={handleTasksCreated}
      />
    </div>
  );
} 