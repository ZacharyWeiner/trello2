'use client';

import React, { useState } from 'react';
import { CardDetailsModal } from '@/components/cards/CardDetailsModal';
import { Card, BoardMember } from '@/types';

export default function TestModalPage() {
  const [count, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Create test board members
  const testBoardMembers: BoardMember[] = [
    {
      userId: 'test-user-1',
      email: 'john@example.com',
      displayName: 'John Doe',
      photoURL: '',
      role: 'admin',
      joinedAt: new Date(),
      invitedBy: 'test-user-1'
    },
    {
      userId: 'test-user-2',
      email: 'jane@example.com',
      displayName: 'Jane Smith',
      photoURL: '',
      role: 'member',
      joinedAt: new Date(),
      invitedBy: 'test-user-1'
    },
    {
      userId: 'test-user-3',
      email: 'bob@example.com',
      displayName: 'Bob Wilson',
      photoURL: '',
      role: 'viewer',
      joinedAt: new Date(),
      invitedBy: 'test-user-1'
    }
  ];

  // Create a test card with sample data
  const testCard: Card = {
    id: 'test-card-1',
    listId: 'test-list-1',
    boardId: 'test-board-1',
    title: 'Test Card Title',
    description: 'This is a test card description to verify the modal functionality.',
    position: 0,
    dueDate: undefined, // Start with no due date
    createdBy: 'test-user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [card, setCard] = useState<Card>(testCard);

  const handleOpenModal = () => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleUpdateCard = (cardId: string, updates: Partial<Card>) => {
    console.log('Updating card:', cardId, updates);
    setCard(prevCard => ({ ...prevCard, ...updates }));
    // Update the selectedCard as well to reflect changes in modal
    if (selectedCard) {
      setSelectedCard(prevCard => ({ ...prevCard!, ...updates }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Card Modal Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Functionality Test</h2>
          <p className="mb-4">Count: {count}</p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors mr-4"
          >
            Click Me to Test React State
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Card State</h2>
          <div className="space-y-2 text-sm mb-4">
            <div><strong>Title:</strong> {card.title}</div>
            <div><strong>Description:</strong> {card.description || 'No description'}</div>
            <div><strong>Due Date:</strong> {card.dueDate ? new Date(card.dueDate).toLocaleDateString() : 'No due date'}</div>
            <div><strong>Created:</strong> {card.createdAt.toLocaleDateString()}</div>
          </div>
          
          <button
            onClick={handleOpenModal}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Open Card Details Modal
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Open Card Details Modal" button</li>
            <li>Try editing the title by clicking on it</li>
            <li>Add or edit the description</li>
            <li>Set a due date using the date picker</li>
            <li>Try setting different dates (past, present, future)</li>
            <li>Use the "Clear" button to remove the due date</li>
            <li>Try @mentions in comments (type @ to see suggestions)</li>
            <li>Close the modal and see the updated card state above</li>
          </ol>
        </div>

        {selectedCard && (
          <CardDetailsModal
            card={selectedCard}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onUpdateCard={handleUpdateCard}
            currentUserId="test-user-id"
            availableLabels={[]}
            onCreateLabel={() => {}}
            boardMembers={testBoardMembers}
            boardTitle="Test Board"
          />
        )}
      </div>
    </div>
  );
} 