'use client';

import React, { useState, useEffect } from 'react';
import { Video, Link, Trash2, Copy, ExternalLink, Plus, Clock } from 'lucide-react';
import { Card, VideoCallLink } from '@/types';

interface VideoCallManagerProps {
  card: Card;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  currentUserId: string;
}

export const VideoCallManager: React.FC<VideoCallManagerProps> = ({
  card,
  onUpdateCard,
  currentUserId,
}) => {
  // Initialize videoLinks with proper date handling
  const initializeVideoLinks = (links: VideoCallLink[] | undefined): VideoCallLink[] => {
    if (!links) return [];
    
    return links.map(link => ({
      ...link,
      // Ensure createdAt is a valid Date
      createdAt: link.createdAt instanceof Date ? link.createdAt : new Date(link.createdAt)
    })).filter(link => {
      // Filter out links with invalid dates
      const date = new Date(link.createdAt);
      return !isNaN(date.getTime());
    });
  };

  const [videoLinks, setVideoLinks] = useState<VideoCallLink[]>(initializeVideoLinks(card.videoLinks));
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkType, setNewLinkType] = useState<VideoCallLink['type']>('other');

  useEffect(() => {
    setVideoLinks(initializeVideoLinks(card.videoLinks));
  }, [card.videoLinks]);

  const detectLinkType = (url: string): VideoCallLink['type'] => {
    if (url.includes('zoom.us') || url.includes('zoom.com')) return 'zoom';
    if (url.includes('meet.google.com')) return 'meet';
    if (url.includes('teams.microsoft.com')) return 'teams';
    return 'other';
  };

  const addVideoLink = () => {
    if (!newLink.trim()) return;

    const videoLink: VideoCallLink = {
      id: `video-${Date.now()}`,
      type: detectLinkType(newLink),
      url: newLink.trim(),
      title: newLinkTitle.trim() || undefined,
      createdAt: new Date(),
      createdBy: currentUserId,
    };

    const updatedLinks = [...videoLinks, videoLink];
    setVideoLinks(updatedLinks);
    onUpdateCard(card.id, { videoLinks: updatedLinks });

    // Reset form
    setNewLink('');
    setNewLinkTitle('');
    setShowAddLink(false);
  };

  const removeVideoLink = (linkId: string) => {
    const updatedLinks = videoLinks.filter(link => link.id !== linkId);
    setVideoLinks(updatedLinks);
    onUpdateCard(card.id, { videoLinks: updatedLinks });
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
  };

  const getLinkIcon = (type: VideoCallLink['type']) => {
    switch (type) {
      case 'zoom':
        return <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">Z</div>;
      case 'meet':
        return <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">M</div>;
      case 'teams':
        return <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">T</div>;
      default:
        return <Video className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (date: Date | string | any) => {
    try {
      let dateObj: Date;
      
      // Handle Firestore Timestamp objects
      if (date && typeof date === 'object' && 'toDate' in date) {
        dateObj = date.toDate();
      } else if (date && typeof date === 'object' && 'seconds' in date) {
        // Handle serialized Firestore timestamp
        dateObj = new Date(date.seconds * 1000);
      } else {
        dateObj = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, 'Date value:', date);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Calls
        </h3>
        <button
          onClick={() => setShowAddLink(true)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </button>
      </div>

      {/* Video Links List */}
      {videoLinks.length > 0 ? (
        <div className="space-y-2">
          {videoLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getLinkIcon(link.type)}
                <div className="flex-1 min-w-0">
                  {link.title && (
                    <div className="font-medium text-sm truncate">{link.title}</div>
                  )}
                  <div className="text-xs text-gray-500 truncate">{link.url}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(link.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyLink(link.url)}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                  title="Open meeting"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                {link.createdBy === currentUserId && (
                  <button
                    onClick={() => removeVideoLink(link.id)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Remove link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Video className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No video call links yet</p>
          <p className="text-xs mt-1">Add meeting links for quick access</p>
        </div>
      )}

      {/* Add Link Form */}
      {showAddLink && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title (optional)
            </label>
            <input
              type="text"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              placeholder="e.g., Weekly Standup"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="url"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://zoom.us/j/123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste your Zoom, Google Meet, Teams, or other video call link
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAddLink(false);
                setNewLink('');
                setNewLinkTitle('');
              }}
              className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addVideoLink}
              disabled={!newLink.trim()}
              className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300"
            >
              Add Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 