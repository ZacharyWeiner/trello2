'use client';

import React from 'react';
import { BoardMember } from '@/types';

interface MentionDisplayProps {
  text: string;
  boardMembers: BoardMember[];
  className?: string;
}

export const MentionDisplay: React.FC<MentionDisplayProps> = ({
  text,
  boardMembers,
  className = "",
}) => {
  // Create a map of user IDs to member info for quick lookup
  const memberMap = new Map(
    boardMembers.map(member => [member.userId, member])
  );

  // Parse mentions and render with highlighting
  const renderTextWithMentions = (text: string) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      const displayName = match[1];
      const userId = match[2];
      const member = memberMap.get(userId);
      
      // Add mention as highlighted text with tooltip
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors"
          title={member ? `${member.displayName} (${member.email})` : displayName}
        >
          @{displayName}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {renderTextWithMentions(text)}
    </div>
  );
}; 