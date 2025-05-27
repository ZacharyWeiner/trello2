'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Board, Card, BoardBackground, BoardTemplate, SearchResult, SearchFilters } from '@/types';
import { getUserBoards, createBoard } from '@/services/boardService';
import { createBoardFromTemplate } from '@/services/boardTemplateService';
import { searchContent } from '@/services/searchService';
import { Search, ArrowLeft, FileText, Users, Calendar, MessageSquare, Tag } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MobileLayout, useResponsive } from '@/components/mobile/MobileLayout';
import { CreateBoardModal } from '@/components/boards/CreateBoardModal';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'board' | 'card' | 'comment'>('all');

  // Responsive hook for mobile detection
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchType, user]);

  const performSearch = async () => {
    if (!user || !searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const filters: SearchFilters = {
        query: searchQuery.trim()
      };

      const { searchContent: searchService } = await import('@/services/searchService');
      const results = await searchService(filters, 50);
      
      // Filter by type if not 'all'
      const filteredResults = searchType === 'all' 
        ? results 
        : results.filter(result => result.type === searchType);
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };
    
  const handleCreateBoard = async (title: string, background?: BoardBackground, template?: BoardTemplate) => {
    if (!user) return;

    try {
      let boardId: string;
      
      if (template) {
        // Create board from template
        boardId = await createBoardFromTemplate(template, title, background);
      } else {
        // Create regular board
        boardId = await createBoard({
          title,
          backgroundColor: background?.value || '#0079bf',
          background,
          createdBy: user.uid,
        });
      }
      
      // Navigate to the new board
      router.push(`/boards/${boardId}`);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleResultClick = (result: SearchResult) => {
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

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'board':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'card':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'board':
        return 'Board';
      case 'card':
        return 'Card';
      case 'comment':
        return 'Comment';
      default:
        return 'Result';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const searchContent = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Search</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search boards, cards, and comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
              autoFocus
              />
            </div>
            
          {/* Search Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All Results', icon: Search },
              { key: 'board', label: 'Boards', icon: FileText },
              { key: 'card', label: 'Cards', icon: Calendar },
              { key: 'comment', label: 'Comments', icon: MessageSquare }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSearchType(key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shadow-sm ${
                  searchType === key
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4 pb-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
          </div>
        ) : searchQuery.trim() ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Search Results ({searchResults.length})
              </h2>
              {searchResults.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {searchType === 'all' ? 'all types' : searchType}
                </div>
              )}
            </div>
            
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border">
                            {getResultTypeLabel(result.type)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            in {result.boardTitle}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {result.title}
                        </h3>
                        
                        {result.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {result.snippet || result.description}
                      </p>
                    )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {result.labels && result.labels.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span>{result.labels.length} labels</span>
                  </div>
                          )}
                          {result.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due {formatDate(result.dueDate)}</span>
              </div>
            )}
                          <span>Updated {formatDate(result.updatedAt)}</span>
                        </div>
                        
                        {result.matchedFields && result.matchedFields.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {result.matchedFields.map((field) => (
                              <span
                                key={field}
                                className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-700 font-medium"
                              >
                                ✓ {field}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                </div>
              </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try searching with different keywords or check your spelling
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Search your workspace</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Find boards, cards, and comments across all your projects
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {['project names', 'task titles', 'team members', 'due dates'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      {isMobile || isTablet ? (
        <MobileLayout
          showBottomNav={true}
          currentPath="/search"
          onCreateBoard={() => setShowCreateModal(true)}
          onSearch={() => {}} // Already on search page
          onNotifications={() => router.push('/notifications')}
          onProfile={() => router.push('/profile')}
        >
          {searchContent}
        </MobileLayout>
      ) : (
        searchContent
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </ProtectedRoute>
  );
} 