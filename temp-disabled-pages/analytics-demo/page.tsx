'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { BusinessIntelligenceDashboard } from '@/components/analytics/BusinessIntelligenceDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Brain, 
  Lightbulb, 
  Shield, 
  Zap,
  Eye,
  Activity,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { Board, List, Card } from '@/types';

export default function AnalyticsDemoPage() {
  const [showDashboard, setShowDashboard] = useState(false);

  // Sample board data with comprehensive analytics scenarios
  const sampleBoard: Board = {
    id: 'analytics-demo-board',
    title: 'Product Development Analytics',
    description: 'Comprehensive analytics demo for product development team',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    backgroundColor: '#667eea',
    createdBy: 'system',
    members: [
      {
        userId: 'user1',
        email: 'alice@company.com',
        displayName: 'Alice Johnson',
        photoURL: '',
        role: 'admin',
        joinedAt: new Date('2024-01-01'),
        invitedBy: 'system'
      },
      {
        userId: 'user2',
        email: 'bob@company.com',
        displayName: 'Bob Smith',
        photoURL: '',
        role: 'member',
        joinedAt: new Date('2024-01-01'),
        invitedBy: 'user1'
      },
      {
        userId: 'user3',
        email: 'carol@company.com',
        displayName: 'Carol Davis',
        photoURL: '',
        role: 'member',
        joinedAt: new Date('2024-01-01'),
        invitedBy: 'user1'
      },
      {
        userId: 'user4',
        email: 'david@company.com',
        displayName: 'David Wilson',
        photoURL: '',
        role: 'member',
        joinedAt: new Date('2024-01-01'),
        invitedBy: 'user1'
      },
      {
        userId: 'user5',
        email: 'eva@company.com',
        displayName: 'Eva Martinez',
        photoURL: '',
        role: 'member',
        joinedAt: new Date('2024-01-01'),
        invitedBy: 'user1'
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  const sampleLists: List[] = [
    {
      id: 'list1',
      title: 'Backlog',
      boardId: sampleBoard.id,
      position: 0,
      listType: 'todo',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list2',
      title: 'In Progress',
      boardId: sampleBoard.id,
      position: 1,
      listType: 'doing',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list3',
      title: 'Code Review',
      boardId: sampleBoard.id,
      position: 2,
      listType: 'review',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list4',
      title: 'Testing',
      boardId: sampleBoard.id,
      position: 3,
      listType: 'review',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'list5',
      title: 'Done',
      boardId: sampleBoard.id,
      position: 4,
      listType: 'done',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ];

  // Generate comprehensive sample cards for analytics
  const generateSampleCards = (): Card[] => {
    const cards: Card[] = [];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const cardTypes = [
      'Feature: User Authentication',
      'Bug: Login form validation',
      'Feature: Dashboard redesign',
      'Bug: Payment processing error',
      'Feature: Mobile responsiveness',
      'Task: Database optimization',
      'Feature: Search functionality',
      'Bug: Memory leak in API',
      'Feature: Email notifications',
      'Task: Security audit',
      'Feature: Dark mode support',
      'Bug: Cross-browser compatibility',
      'Feature: Analytics integration',
      'Task: Performance testing',
      'Feature: User onboarding',
      'Bug: Data validation issues',
      'Feature: Export functionality',
      'Task: Code refactoring',
      'Feature: Social media integration',
      'Bug: UI rendering issues'
    ];

    // Create cards distributed across lists and time periods
    cardTypes.forEach((title, index) => {
      const listIndex = index % sampleLists.length;
      const userId = sampleBoard.members[index % sampleBoard.members.length].userId;
      const createdDaysAgo = Math.floor(Math.random() * 60) + 1; // 1-60 days ago
      const updatedDaysAgo = Math.floor(Math.random() * createdDaysAgo); // Updated after creation
      
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - createdDaysAgo);
      
      const updatedAt = new Date();
      updatedAt.setDate(updatedAt.getDate() - updatedDaysAgo);

      // Add due dates for some cards (some overdue for analytics)
      let dueDate: Date | undefined;
      if (Math.random() > 0.5) {
        dueDate = new Date();
        const dueDaysFromNow = Math.floor(Math.random() * 20) - 10; // -10 to +10 days
        dueDate.setDate(dueDate.getDate() + dueDaysFromNow);
      }

      cards.push({
        id: `card-${index + 1}`,
        title,
        description: `Detailed description for ${title}. This card includes comprehensive information about the task requirements, acceptance criteria, and implementation details.`,
        listId: sampleLists[listIndex].id,
        boardId: sampleBoard.id,
        position: index,
        createdBy: userId,
        assignees: Math.random() > 0.3 ? [userId] : undefined, // 70% chance of assignment
        priority: priorities[Math.floor(Math.random() * priorities.length)] as any,
        dueDate,
        labels: Math.random() > 0.5 ? [
          { id: 'label1', name: 'frontend', color: '#3b82f6' },
          { id: 'label2', name: 'backend', color: '#10b981' },
          { id: 'label3', name: 'urgent', color: '#ef4444' },
          { id: 'label4', name: 'blocked', color: '#f59e0b' }
        ].slice(0, Math.floor(Math.random() * 3) + 1) : undefined,
        estimatedHours: Math.floor(Math.random() * 40) + 1,
        createdAt,
        updatedAt
      });
    });

    return cards;
  };

  const sampleCards = generateSampleCards();

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: 'Comprehensive Metrics',
      description: 'Track key performance indicators including completion rates, velocity, team productivity, and project health scores.',
      highlights: ['Task completion rates', 'Team velocity tracking', 'Quality metrics', 'Engagement scores']
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: 'Advanced Charts & Visualizations',
      description: 'Interactive charts including burndown, velocity trends, workload distribution, and cycle time analysis.',
      highlights: ['Burndown charts', 'Velocity trends', 'Workload distribution', 'Cycle time analysis']
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: 'Team Analytics',
      description: 'Individual team member productivity metrics, burnout risk assessment, and collaboration scores.',
      highlights: ['Individual productivity', 'Burnout risk detection', 'Collaboration metrics', 'Streak tracking']
    },
    {
      icon: <Brain className="h-8 w-8 text-indigo-600" />,
      title: 'Predictive Analytics',
      description: 'AI-powered predictions for project completion, resource needs, and risk assessment.',
      highlights: ['Completion predictions', 'Resource planning', 'Risk assessment', 'Skill gap analysis']
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-600" />,
      title: 'AI-Powered Insights',
      description: 'Automated insights and recommendations based on project data and team performance patterns.',
      highlights: ['Automated insights', 'Performance recommendations', 'Trend analysis', 'Actionable suggestions']
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: 'Project Health Monitoring',
      description: 'Real-time project health assessment with risk factors identification and mitigation recommendations.',
      highlights: ['Health scoring', 'Risk identification', 'Mitigation strategies', 'Early warning system']
    }
  ];

  const analyticsCapabilities = [
    {
      category: 'Productivity Metrics',
      items: [
        'Task completion rates and trends',
        'Team velocity and throughput',
        'Individual productivity scores',
        'Work distribution analysis'
      ]
    },
    {
      category: 'Performance Analytics',
      items: [
        'Cycle time and lead time tracking',
        'Bottleneck identification',
        'Quality metrics and defect rates',
        'Efficiency measurements'
      ]
    },
    {
      category: 'Team Insights',
      items: [
        'Burnout risk assessment',
        'Collaboration patterns',
        'Skill utilization analysis',
        'Engagement tracking'
      ]
    },
    {
      category: 'Predictive Intelligence',
      items: [
        'Project completion forecasting',
        'Resource demand prediction',
        'Risk probability assessment',
        'Capacity planning recommendations'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-2xl shadow-lg">
                <BarChart3 className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Business Intelligence
              <span className="block text-3xl text-blue-600 mt-2">Advanced Analytics & Reporting</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your project data into actionable insights with comprehensive analytics, 
              predictive intelligence, and AI-powered recommendations for optimal team performance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowDashboard(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-3"
              >
                <Eye className="h-5 w-5" />
                View Live Dashboard
              </button>
              
              <button className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Analytics Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive business intelligence tools designed to optimize team performance and project outcomes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              
              <ul className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Capabilities */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics Capabilities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive metrics and insights across all aspects of your project management workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {analyticsCapabilities.map((capability, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{capability.category}</h3>
                <ul className="space-y-3">
                  {capability.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Data Overview */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Demo Data Overview</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our demo includes comprehensive sample data to showcase all analytics features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{sampleCards.length}</div>
            <div className="text-gray-600">Sample Tasks</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{sampleBoard.members.length}</div>
            <div className="text-gray-600">Team Members</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{sampleLists.length}</div>
            <div className="text-gray-600">Workflow Lists</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">60</div>
            <div className="text-gray-600">Days of Data</div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Explore?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Click the button below to open the interactive Business Intelligence dashboard 
            and explore all the analytics features with our comprehensive sample data.
          </p>
          
          <button
            onClick={() => setShowDashboard(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-3 mx-auto"
          >
            <BarChart3 className="h-5 w-5" />
            Open Analytics Dashboard
          </button>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Business Intelligence Matters</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Data-driven insights that transform how teams work and deliver projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Improve Performance</h3>
              <p className="text-gray-600">
                Identify bottlenecks, optimize workflows, and increase team productivity with data-driven insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Predict Outcomes</h3>
              <p className="text-gray-600">
                Forecast project completion dates, resource needs, and potential risks before they impact delivery.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Make Better Decisions</h3>
              <p className="text-gray-600">
                Get actionable recommendations and insights that help you make informed decisions quickly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Intelligence Dashboard Modal */}
      <BusinessIntelligenceDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        board={sampleBoard}
        lists={sampleLists}
        cards={sampleCards}
      />
    </div>
  );
} 