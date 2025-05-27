'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchFilters, SearchResult, SavedSearch, QuickFilter, Label, User } from '@/types';
import { searchContent, getUserSavedSearches, saveSavedSearch, getDefaultQuickFilters } from '@/services/searchService';
import { useAuthContext } from '@/contexts/AuthContext';
import { AdvancedFilters } from './AdvancedFilters';
import { 
  Search, 
  X, 
  Filter, 
  Save, 
  Clock, 
  Star,
  Calendar,
  Tag,
  User as UserIcon,
  FileText,
  MessageSquare,
  Paperclip,
  AlertTriangle
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onResultClick
}) => {
  const { user } = useAuthContext();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [quickFilters] = useState<QuickFilter[]>(getDefaultQuickFilters());
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadSavedSearches();
      loadAvailableData();
      // Focus search input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (query.length > 0 || Object.keys(filters).length > 0) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, filters]);

  const loadSavedSearches = async () => {
    if (!user) return;
    try {
      const searches = await getUserSavedSearches(user.uid);
      setSavedSearches(searches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const loadAvailableData = async () => {
    // This is a simplified version - in a real app you'd want to load this more efficiently
    // For now, we'll load from the user's accessible boards
    try {
      // You could implement functions to get all labels and users from accessible boards
      // For now, we'll use empty arrays - this would be populated from your board data
      setAvailableLabels([]);
      setAvailableUsers([]);
    } catch (error) {
      console.error('Error loading available data:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        query: query.trim() || undefined
      };
      
      const searchResults = await searchContent(searchFilters);
      setResults(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (quickFilter: QuickFilter) => {
    if (activeQuickFilter === quickFilter.id) {
      // Deactivate filter
      setActiveQuickFilter(null);
      setFilters({});
    } else {
      // Activate filter
      setActiveQuickFilter(quickFilter.id);
      setFilters(quickFilter.filters);
    }
  };

  const handleSaveSearch = async () => {
    if (!user || (!query && Object.keys(filters).length === 0)) return;
    
    const name = prompt('Enter a name for this search:');
    if (!name) return;

    try {
      await saveSavedSearch({
        name,
        filters: { ...filters, query: query || undefined },
        userId: user.uid,
        isPublic: false
      });
      loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleSavedSearchClick = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.filters.query || '');
    setFilters(savedSearch.filters);
    setActiveQuickFilter(null);
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    setActiveQuickFilter(null);
    setResults([]);
  };

  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case 'board': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'card': return <Tag className="h-4 w-4 text-green-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search boards, cards, and comments..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg border transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleSaveSearch}
              disabled={!query && Object.keys(filters).length === 0}
              className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleQuickFilter(filter)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  activeQuickFilter === filter.id
                    ? `bg-${filter.color}-100 text-${filter.color}-700 border border-${filter.color}-200`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{filter.icon}</span>
                {filter.name}
              </button>
            ))}
            
            {(query || Object.keys(filters).length > 0) && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Advanced Filters Sidebar */}
          {showFilters && (
            <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableLabels={availableLabels}
                availableUsers={availableUsers}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Saved Searches */}
            {!query && Object.keys(filters).length === 0 && savedSearches.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Saved Searches
                </h3>
                <div className="space-y-2">
                  {savedSearches.slice(0, 5).map((savedSearch) => (
                    <button
                      key={savedSearch.id}
                      onClick={() => handleSavedSearchClick(savedSearch)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                    >
                      <div className="font-medium text-gray-900">{savedSearch.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {savedSearch.filters.query && `"${savedSearch.filters.query}"`}
                        {savedSearch.lastUsed && ` • Last used ${formatDate(savedSearch.lastUsed)}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {loading && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => onResultClick(result)}
                      className="w-full text-left p-4 rounded-lg hover:bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        {getResultIcon(result)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {result.type}
                            </span>
                          </div>
                          
                          {result.snippet && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.snippet}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{result.boardTitle}</span>
                            {result.listTitle && <span>• {result.listTitle}</span>}
                            <span>• {formatDate(result.updatedAt)}</span>
                            {result.labels && result.labels.length > 0 && (
                              <div className="flex gap-1">
                                {result.labels.slice(0, 3).map((label) => (
                                  <span
                                    key={label.id}
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                    title={label.name}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && (query || Object.keys(filters).length > 0) && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No results found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 