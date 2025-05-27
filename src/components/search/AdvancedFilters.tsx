'use client';

import React, { useState, useEffect } from 'react';
import { SearchFilters, Label, User, UserProfile } from '@/types';
import { getUserProfile } from '@/services/userService';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Tag, 
  User as UserIcon, 
  X, 
  ChevronDown,
  Paperclip,
  MessageSquare,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableLabels?: Label[];
  availableUsers?: User[];
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  availableLabels = [],
  availableUsers = []
}) => {
  const { user } = useAuthContext();
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    loadUserProfiles();
  }, [availableUsers]);

  const loadUserProfiles = async () => {
    const profiles: Record<string, UserProfile> = {};
    for (const userId of availableUsers.map(u => u.id)) {
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          profiles[userId] = profile;
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
    setUserProfiles(profiles);
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleLabel = (labelId: string) => {
    const currentLabels = filters.labels || [];
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter(id => id !== labelId)
      : [...currentLabels, labelId];
    
    updateFilters({ labels: newLabels.length > 0 ? newLabels : undefined });
  };

  const toggleUser = (userId: string) => {
    const currentUsers = filters.assignees || [];
    const newUsers = currentUsers.includes(userId)
      ? currentUsers.filter(id => id !== userId)
      : [...currentUsers, userId];
    
    updateFilters({ assignees: newUsers.length > 0 ? newUsers : undefined });
  };

  const setDateRange = (field: 'dueDateRange' | 'createdDateRange' | 'updatedDateRange', start: string, end: string) => {
    if (!start && !end) {
      updateFilters({ [field]: undefined });
      return;
    }
    
    updateFilters({
      [field]: {
        start: new Date(start || new Date().toISOString().split('T')[0]),
        end: new Date(end || new Date().toISOString().split('T')[0])
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.labels?.length) count++;
    if (filters.assignees?.length) count++;
    if (filters.dueDateRange) count++;
    if (filters.createdDateRange) count++;
    if (filters.updatedDateRange) count++;
    if (filters.isOverdue) count++;
    if (filters.hasAttachments) count++;
    if (filters.hasComments) count++;
    if (filters.hasChecklists) count++;
    return count;
  };

  const selectedLabels = availableLabels.filter(label => filters.labels?.includes(label.id));
  const selectedUsers = availableUsers.filter(user => filters.assignees?.includes(user.id));

  return (
    <div className="space-y-4">
      {/* Filter Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Advanced Filters</h3>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear all ({getActiveFilterCount()})
          </button>
        )}
      </div>

      {/* Labels Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Labels</label>
        <div className="relative">
          <button
            onClick={() => setShowLabelSelector(!showLabelSelector)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {selectedLabels.length > 0 ? `${selectedLabels.length} selected` : 'Select labels'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          
          {showLabelSelector && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {availableLabels.length > 0 ? (
                availableLabels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <input
                      type="checkbox"
                      checked={filters.labels?.includes(label.id) || false}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm text-gray-700">{label.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No labels available</div>
              )}
            </div>
          )}
        </div>
        
        {/* Selected Labels */}
        {selectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full text-xs"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
                <button
                  onClick={() => toggleLabel(label.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Assignees Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Assignees</label>
        <div className="relative">
          <button
            onClick={() => setShowUserSelector(!showUserSelector)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : 'Select assignees'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          
          {showUserSelector && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <input
                      type="checkbox"
                      checked={filters.assignees?.includes(user.id) || false}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                    <span className="text-sm text-gray-700">
                      {user.displayName || user.email}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No users available</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Date Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Due Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Due Date Range</label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dueDateRange?.start.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange('dueDateRange', e.target.value, filters.dueDateRange?.end.toISOString().split('T')[0] || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.dueDateRange?.end.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange('dueDateRange', filters.dueDateRange?.start.toISOString().split('T')[0] || '', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Created Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Created Date Range</label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.createdDateRange?.start.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange('createdDateRange', e.target.value, filters.createdDateRange?.end.toISOString().split('T')[0] || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.createdDateRange?.end.toISOString().split('T')[0] || ''}
              onChange={(e) => setDateRange('createdDateRange', filters.createdDateRange?.start.toISOString().split('T')[0] || '', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Boolean Filters */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Card Properties</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.isOverdue || false}
              onChange={(e) => updateFilters({ isOverdue: e.target.checked || undefined })}
              className="rounded"
            />
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Overdue
          </label>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hasAttachments || false}
              onChange={(e) => updateFilters({ hasAttachments: e.target.checked || undefined })}
              className="rounded"
            />
            <Paperclip className="h-4 w-4 text-gray-500" />
            Has attachments
          </label>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hasComments || false}
              onChange={(e) => updateFilters({ hasComments: e.target.checked || undefined })}
              className="rounded"
            />
            <MessageSquare className="h-4 w-4 text-purple-500" />
            Has comments
          </label>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hasChecklists || false}
              onChange={(e) => updateFilters({ hasChecklists: e.target.checked || undefined })}
              className="rounded"
            />
            <CheckSquare className="h-4 w-4 text-green-500" />
            Has checklists
          </label>
        </div>
      </div>
    </div>
  );
}; 