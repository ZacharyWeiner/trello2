'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { BoardMember } from '@/types';
import { UserAvatar } from '@/components/users/UserAvatar';
import { AtSign } from 'lucide-react';

interface MentionSuggestion {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  placeholder?: string;
  boardMembers: BoardMember[];
  className?: string;
  rows?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder = "Write a comment...",
  boardMembers,
  className = "",
  rows = 3,
  disabled = false,
  autoFocus = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Convert board members to mention suggestions
  const mentionSuggestions: MentionSuggestion[] = boardMembers.map(member => ({
    id: member.userId,
    displayName: member.displayName || member.email,
    email: member.email,
    photoURL: member.photoURL,
  }));

  // Extract mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[2]); // The user ID is in the second capture group
    }
    
    return mentions;
  };

  // Handle text change
  const handleTextChange = (newValue: string) => {
    const mentions = extractMentions(newValue);
    onChange(newValue, mentions);

    // Check if we're typing a mention
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([^@\s]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      
      // Filter suggestions based on query
      const filteredSuggestions = mentionSuggestions.filter(suggestion =>
        suggestion.displayName.toLowerCase().includes(query) ||
        suggestion.email.toLowerCase().includes(query)
      );
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
      setSelectedSuggestionIndex(0);
      setCursorPosition(cursorPos);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setMentionQuery('');
    }
  };

  // Handle mention selection
  const selectMention = (suggestion: MentionSuggestion) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    // Find the start of the mention
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const textBeforeMention = value.substring(0, mentionStart);
    
    // Create the mention format: @[Display Name](userId)
    const mentionText = `@[${suggestion.displayName}](${suggestion.id})`;
    const newValue = textBeforeMention + mentionText + ' ' + textAfterCursor;
    
    handleTextChange(newValue);
    setShowSuggestions(false);
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newCursorPos = textBeforeMention.length + mentionText.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedSuggestionIndex]) {
          selectMention(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Render text with mentions highlighted
  const renderDisplayText = (text: string) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add mention as highlighted text
      parts.push(
        <span key={match.index} className="bg-blue-100 text-blue-800 px-1 rounded">
          @{match[1]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  };

  // Calculate suggestion position
  const getSuggestionPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { top: 0, left: 0 };

    // Use relative positioning instead of viewport coordinates
    return {
      top: '100%',
      left: 0,
    };
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${className}`}
        style={{ color: '#000000' }}
        rows={rows}
        disabled={disabled}
        autoFocus={autoFocus}
      />

      {/* Mention Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1"
          style={{
            top: getSuggestionPosition().top,
            left: getSuggestionPosition().left,
            minWidth: '250px',
          }}
        >
          <div className="p-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <AtSign className="h-3 w-3" />
              <span>Mention someone</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => selectMention(suggestion)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  index === selectedSuggestionIndex
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <UserAvatar user={suggestion} size="sm" showTooltip={false} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.displayName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {suggestion.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 