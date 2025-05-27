'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, BoardMember } from '@/types';
import { UserAvatar } from './UserAvatar';
import { Search, X, Check, Plus } from 'lucide-react';

interface UserSelectorProps {
  availableUsers: (UserProfile | BoardMember)[];
  selectedUsers: string[]; // User IDs
  onSelectionChange: (userIds: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  showAddButton?: boolean;
  onAddUser?: () => void;
  className?: string;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  availableUsers,
  selectedUsers,
  onSelectionChange,
  placeholder = "Assign members...",
  maxSelections,
  showAddButton = false,
  onAddUser,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter users based on search term
  const filteredUsers = availableUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = 'displayName' in user ? user.displayName : '';
    const email = user.email;
    
    return (
      displayName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower)
    );
  });

  // Get selected user objects
  const selectedUserObjects = availableUsers.filter(user => 
    selectedUsers.includes('userId' in user ? user.userId : user.id)
  );

  const handleUserToggle = (userId: string) => {
    const isSelected = selectedUsers.includes(userId);
    
    if (isSelected) {
      // Remove user
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    } else {
      // Add user (check max selections)
      if (!maxSelections || selectedUsers.length < maxSelections) {
        onSelectionChange([...selectedUsers, userId]);
      }
    }
  };

  const handleRemoveUser = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectionChange(selectedUsers.filter(id => id !== userId));
  };

  const getUserId = (user: UserProfile | BoardMember): string => {
    return 'userId' in user ? user.userId : user.id;
  };

  const getUserDisplayName = (user: UserProfile | BoardMember): string => {
    return user.displayName || user.email;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Users Display */}
      {selectedUserObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUserObjects.map((user) => {
            const userId = getUserId(user);
            const displayName = getUserDisplayName(user);
            
            return (
              <div
                key={userId}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                <UserAvatar user={user} size="xs" showTooltip={false} />
                <span className="max-w-24 truncate">{displayName}</span>
                <button
                  onClick={(e) => handleRemoveUser(userId, e)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input/Trigger */}
      <div
        className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent"
        />
        {showAddButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddUser?.();
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Invite new member"
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            <div className="py-1">
              {filteredUsers.map((user) => {
                const userId = getUserId(user);
                const displayName = getUserDisplayName(user);
                const isSelected = selectedUsers.includes(userId);
                const isDisabled = !isSelected && maxSelections && selectedUsers.length >= maxSelections;

                return (
                  <div
                    key={userId}
                    onClick={() => !isDisabled && handleUserToggle(userId)}
                    className={`
                      flex items-center gap-3 px-3 py-2 cursor-pointer
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                      ${isSelected ? 'bg-blue-50' : ''}
                    `}
                  >
                    <UserAvatar user={user} size="sm" showTooltip={false} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {displayName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {user.email}
                      </div>
                      {'role' in user && (
                        <div className="text-xs text-gray-400 capitalize">
                          {user.role}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-gray-500">
              {searchTerm ? 'No users found' : 'No users available'}
            </div>
          )}

          {/* Add user option */}
          {showAddButton && searchTerm && (
            <div className="border-t border-gray-200">
              <button
                onClick={() => {
                  onAddUser?.();
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 text-blue-600"
              >
                <Plus className="h-4 w-4" />
                <span>Invite "{searchTerm}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simplified version for single user selection
interface SingleUserSelectorProps {
  availableUsers: (UserProfile | BoardMember)[];
  selectedUserId?: string;
  onSelectionChange: (userId: string | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

export const SingleUserSelector: React.FC<SingleUserSelectorProps> = ({
  availableUsers,
  selectedUserId,
  onSelectionChange,
  placeholder = "Select user...",
  allowClear = true,
  className = ''
}) => {
  return (
    <UserSelector
      availableUsers={availableUsers}
      selectedUsers={selectedUserId ? [selectedUserId] : []}
      onSelectionChange={(userIds) => onSelectionChange(userIds[0])}
      placeholder={placeholder}
      maxSelections={1}
      className={className}
    />
  );
}; 