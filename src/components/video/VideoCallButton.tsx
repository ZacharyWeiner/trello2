'use client';

import React, { useState } from 'react';
import { Video, Users, ExternalLink, Calendar } from 'lucide-react';
import { Card } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';

interface VideoCallButtonProps {
  card: Card;
  boardTitle: string;
  className?: string;
}

export const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  card,
  boardTitle,
  className = '',
}) => {
  const { user } = useAuthContext();
  const [showOptions, setShowOptions] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [showLinkModal, setShowLinkModal] = useState(false);

  const generateMeetingTitle = () => {
    return `${boardTitle} - ${card.title}`;
  };

  const generateMeetingDescription = () => {
    return `Video call for card: ${card.title}\n\nDescription: ${card.description || 'No description'}`;
  };

  const startGoogleMeet = () => {
    // Google Meet instant meeting URL
    const meetUrl = 'https://meet.google.com/new';
    window.open(meetUrl, '_blank');
    setShowOptions(false);
  };

  const scheduleGoogleMeet = () => {
    // Google Calendar event creation URL with Meet
    const title = encodeURIComponent(generateMeetingTitle());
    const details = encodeURIComponent(generateMeetingDescription());
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&add=${user?.email || ''}&conferenceType=meet`;
    window.open(calendarUrl, '_blank');
    setShowOptions(false);
  };

  const startZoomMeeting = () => {
    // Zoom Web SDK would be integrated here
    // For now, we'll show a modal to paste Zoom link
    setShowLinkModal(true);
    setShowOptions(false);
  };

  const handleSaveMeetingLink = () => {
    if (meetingLink.trim()) {
      // You can save this link to the card or open it
      window.open(meetingLink, '_blank');
      setMeetingLink('');
      setShowLinkModal(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`flex items-center gap-2 px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ${className}`}
        >
          <Video className="h-4 w-4" />
          <span>Video Call</span>
        </button>

        {showOptions && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Start Video Call
              </div>
              
              {/* Google Meet Options */}
              <div className="border-b border-gray-100 pb-2 mb-2">
                <button
                  onClick={startGoogleMeet}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Video className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Google Meet</div>
                    <div className="text-xs text-gray-500">Start instant meeting</div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                </button>
                
                <button
                  onClick={scheduleGoogleMeet}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">Schedule Meet</div>
                    <div className="text-xs text-gray-500">Create calendar event</div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                </button>
              </div>

              {/* Zoom Options */}
              <button
                onClick={startZoomMeeting}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Video className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Zoom</div>
                  <div className="text-xs text-gray-500">Add meeting link</div>
                </div>
                <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {showOptions && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
        )}
      </div>

      {/* Meeting Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add Video Meeting Link</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/j/123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste your Zoom, Teams, or other video call link
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setMeetingLink('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeetingLink}
                  disabled={!meetingLink.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Open Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 