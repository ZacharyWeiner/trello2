'use client';

import React, { useState } from 'react';
import { VideoCallButton } from '@/components/video/VideoCallButton';
import { VideoCallManager } from '@/components/video/VideoCallManager';
import { Card, VideoCallLink } from '@/types';
import { Video, Users, Calendar, ExternalLink, Info } from 'lucide-react';

export default function TestVideoCallsPage() {
  // Sample card data
  const [sampleCard, setSampleCard] = useState<Card>({
    id: 'test-card-1',
    listId: 'test-list-1',
    boardId: 'test-board-1',
    title: 'Weekly Team Standup',
    description: 'Regular team sync meeting to discuss progress and blockers',
    position: 0,
    createdBy: 'test-user',
    createdAt: new Date(),
    updatedAt: new Date(),
    videoLinks: [
      {
        id: 'link-1',
        type: 'meet',
        url: 'https://meet.google.com/abc-defg-hij',
        title: 'Recurring Team Meeting',
        createdAt: new Date('2024-01-15'),
        createdBy: 'test-user',
      },
      {
        id: 'link-2',
        type: 'zoom',
        url: 'https://zoom.us/j/123456789',
        title: 'Backup Zoom Room',
        createdAt: new Date('2024-01-10'),
        createdBy: 'test-user',
      },
    ],
  });

  const handleUpdateCard = (cardId: string, updates: Partial<Card>) => {
    console.log('Updating card:', cardId, updates);
    setSampleCard(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Video Call Integration Test</h1>
      
      {/* Feature Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Video Call Features</h2>
            <ul className="space-y-1 text-blue-800">
              <li>• Quick access to Google Meet (instant meetings & scheduled)</li>
              <li>• Support for Zoom, Teams, and custom video links</li>
              <li>• Save multiple meeting links per card</li>
              <li>• Auto-detect meeting platform from URL</li>
              <li>• Copy meeting links to clipboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Video Call Button Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="h-5 w-5" />
            Quick Video Call Button
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              This button appears in the card header for quick access to start or join video calls.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-3">Try the button:</p>
              <VideoCallButton 
                card={sampleCard}
                boardTitle="Project Management"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Clicking "Google Meet" will open a new Meet session. 
                "Schedule Meet" will open Google Calendar with pre-filled details.
              </p>
            </div>
          </div>
        </div>

        {/* Video Call Manager Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Video Call Manager
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Manage saved video call links for a card. These links persist and can be reused.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <VideoCallManager
                card={sampleCard}
                onUpdateCard={handleUpdateCard}
                currentUserId="test-user"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Integration Examples */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Platform Integration Examples</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium">Google Meet</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Instant meetings</li>
              <li>• Calendar integration</li>
              <li>• No account needed for guests</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-blue-600 font-bold">Z</div>
              </div>
              <h3 className="font-medium">Zoom</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Meeting links</li>
              <li>• Personal meeting rooms</li>
              <li>• Scheduled meetings</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-purple-600 font-bold">T</div>
              </div>
              <h3 className="font-medium">Microsoft Teams</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Teams meetings</li>
              <li>• Channel meetings</li>
              <li>• Guest access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current State */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Card State</h2>
        <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-sm">
          {JSON.stringify(
            {
              cardId: sampleCard.id,
              title: sampleCard.title,
              videoLinks: sampleCard.videoLinks?.map(link => ({
                id: link.id,
                type: link.type,
                title: link.title,
                url: link.url,
              })),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
} 