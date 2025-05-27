'use client';

import React, { useState } from 'react';
import { Search, Command } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { SearchResult } from '@/types';
import { useRouter } from 'next/navigation';

interface GlobalSearchBarProps {
  className?: string;
  showModal?: boolean; // Option to show modal vs navigate to page
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ 
  className = '', 
  showModal = false 
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchClick = () => {
    if (showModal) {
      setIsSearchModalOpen(true);
    } else {
      router.push('/search');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      handleSearchClick();
    }
    
    // Enter to search
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showModal) {
      router.push('/search');
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsSearchModalOpen(false);
    
    // Navigate based on result type
    switch (result.type) {
      case 'board':
        router.push(`/boards/${result.boardId}`);
        break;
      case 'card':
        router.push(`/boards/${result.boardId}?card=${result.cardId}`);
        break;
      case 'comment':
        router.push(`/boards/${result.boardId}?card=${result.cardId}&comment=${result.id}`);
        break;
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <div
          onClick={handleSearchClick}
          className="w-full flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
        >
          <Search className="h-4 w-4 text-gray-500" />
          {showModal ? (
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              placeholder="Search boards, cards..."
              className="flex-1 bg-transparent text-gray-700 placeholder-gray-500 outline-none"
            />
          ) : (
            <span className="text-gray-500 flex-1">Search boards, cards...</span>
          )}
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {showModal && (
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onResultClick={handleResultClick}
        />
      )}
    </>
  );
}; 