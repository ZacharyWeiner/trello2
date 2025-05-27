'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddListButtonProps {
  onAddList: (title: string) => void;
}

export const AddListButton: React.FC<AddListButtonProps> = ({ onAddList }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddList(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="ds-card rounded-lg p-2 w-80 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title..."
            className="ds-input w-full p-2 rounded mb-2"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="ds-button-primary px-3 py-1 rounded text-sm"
            >
              Add List
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="ds-button-ghost p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="ds-button-ghost rounded-lg p-4 w-80 flex-shrink-0 flex items-center justify-center space-x-2 transition-colors"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white'
      }}
    >
      <Plus className="h-5 w-5" />
      <span>Add another list</span>
    </button>
  );
}; 