import { Metadata } from 'next';
import { BoardWithStoryMode } from '@/components/boards/BoardWithStoryMode';
import { Board, List, Card } from '@/types';

export const metadata: Metadata = {
  title: 'Board with Story Mode - GIF Integration Demo | Trello Clone',
  description: 'See how Story Mode and GIF features integrate into a real project board with actual data and interactive elements.',
  keywords: ['board', 'story mode', 'gif integration', 'project management', 'interactive'],
};

export default function BoardStoryDemoPage() {
  // Sample board data that represents a real project
  const sampleBoard = {
    id: 'board-123',
    title: 'Website Redesign Project',
    description: 'Complete redesign of company website with modern UI/UX',
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-29T13:00:00Z',
    members: [
      {
        userId: 'user-1',
        displayName: 'Sarah Chen',
        role: 'Project Manager'
      },
      {
        userId: 'user-2', 
        displayName: 'Mike Rodriguez',
        role: 'Lead Designer'
      },
      {
        userId: 'user-3',
        displayName: 'Alex Kim',
        role: 'Frontend Developer'
      },
      {
        userId: 'user-4',
        displayName: 'Emma Thompson',
        role: 'UX Researcher'
      }
    ]
  };

  const sampleLists = [
    {
      id: 'list-1',
      title: 'Research & Planning',
      listType: 'done' as const,
      position: 1
    },
    {
      id: 'list-2', 
      title: 'Design Phase',
      listType: 'doing' as const,
      position: 2
    },
    {
      id: 'list-3',
      title: 'Development',
      listType: 'todo' as const,
      position: 3
    },
    {
      id: 'list-4',
      title: 'Testing & Launch',
      listType: 'todo' as const,
      position: 4
    }
  ];

  const sampleCards = [
    // Completed tasks (Research & Planning)
    {
      id: 'card-1',
      title: 'User Research & Interviews',
      description: 'Conduct interviews with 20 users to understand pain points',
      listId: 'list-1',
      position: 1,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-15T17:30:00Z'
    },
    {
      id: 'card-2', 
      title: 'Competitive Analysis',
      description: 'Analyze 5 competitor websites for best practices',
      listId: 'list-1',
      position: 2,
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-18T14:20:00Z'
    },
    {
      id: 'card-3',
      title: 'Information Architecture',
      description: 'Create site map and navigation structure',
      listId: 'list-1',
      position: 3,
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-22T16:45:00Z'
    },

    // In Progress tasks (Design Phase)
    {
      id: 'card-4',
      title: 'Wireframe Creation',
      description: 'Design low-fidelity wireframes for all key pages',
      listId: 'list-2',
      position: 1,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-25T12:30:00Z'
    },
    {
      id: 'card-5',
      title: 'Visual Design System',
      description: 'Create color palette, typography, and component library',
      listId: 'list-2',
      position: 2,
      createdAt: '2024-01-22T10:30:00Z',
      updatedAt: '2024-01-26T15:15:00Z'
    },

    // Todo tasks (Development)
    {
      id: 'card-6',
      title: 'Frontend Development Setup',
      description: 'Set up React project with TypeScript and Tailwind',
      listId: 'list-3',
      position: 1,
      createdAt: '2024-01-25T14:00:00Z',
      updatedAt: '2024-01-25T14:00:00Z'
    },
    {
      id: 'card-7',
      title: 'Homepage Implementation',
      description: 'Build responsive homepage with hero section and features',
      listId: 'list-3',
      position: 2,
      createdAt: '2024-01-26T09:00:00Z',
      updatedAt: '2024-01-26T09:00:00Z'
    },
    {
      id: 'card-8',
      title: 'Contact Form Integration',
      description: 'Implement contact form with validation and email sending',
      listId: 'list-3',
      position: 3,
      createdAt: '2024-01-27T11:00:00Z',
      updatedAt: '2024-01-27T11:00:00Z'
    },

    // Future tasks (Testing & Launch)
    {
      id: 'card-9',
      title: 'Cross-browser Testing',
      description: 'Test website across different browsers and devices',
      listId: 'list-4',
      position: 1,
      createdAt: '2024-01-28T10:00:00Z',
      updatedAt: '2024-01-28T10:00:00Z'
    },
    {
      id: 'card-10',
      title: 'Performance Optimization',
      description: 'Optimize images, code splitting, and loading times',
      listId: 'list-4',
      position: 2,
      createdAt: '2024-01-29T13:00:00Z',
      updatedAt: '2024-01-29T13:00:00Z'
    }
  ];

  return (
    <BoardWithStoryMode
      board={sampleBoard as unknown as Board}
      lists={sampleLists as unknown as List[]}
      cards={sampleCards as unknown as Card[]}
      userId="user-1"
    />
  );
} 