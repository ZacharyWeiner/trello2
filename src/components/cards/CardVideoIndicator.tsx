'use client';

import React from 'react';
import { Video } from 'lucide-react';
import { VideoCallLink } from '@/types';

interface CardVideoIndicatorProps {
  videoLinks?: VideoCallLink[];
  className?: string;
}

export const CardVideoIndicator: React.FC<CardVideoIndicatorProps> = ({
  videoLinks = [],
  className = '',
}) => {
  if (!videoLinks || videoLinks.length === 0) return null;

  const getMeetingTypeLabel = (type: VideoCallLink['type']) => {
    switch (type) {
      case 'zoom': return 'Zoom';
      case 'meet': return 'Meet';
      case 'teams': return 'Teams';
      default: return 'Video';
    }
  };

  const getPrimaryMeeting = () => {
    // Prioritize by type: meet > zoom > teams > other
    const priority = ['meet', 'zoom', 'teams', 'other'];
    for (const type of priority) {
      const link = videoLinks.find(l => l.type === type);
      if (link) return link;
    }
    return videoLinks[0];
  };

  const primaryMeeting = getPrimaryMeeting();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium ${className}`}>
      <Video className="h-3 w-3" />
      <span>{getMeetingTypeLabel(primaryMeeting.type)}</span>
      {videoLinks.length > 1 && (
        <span className="text-purple-500">+{videoLinks.length - 1}</span>
      )}
    </div>
  );
}; 