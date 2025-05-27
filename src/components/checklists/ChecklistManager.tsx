'use client';

import React, { useState } from 'react';
import { Checklist, ChecklistItem } from '@/types';
import { Plus, X, Check, Square, CheckSquare, List, Trash2 } from 'lucide-react';

interface ChecklistManagerProps {
  checklists: Checklist[];
  onChecklistsChange: (checklists: Checklist[]) => void;
}

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({
  checklists,
  onChecklistsChange,
}) => {
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<{ [checklistId: string]: string }>({});

  const createChecklist = () => {
    if (newChecklistTitle.trim()) {
      const newChecklist: Checklist = {
        id: `checklist-${Date.now()}`,
        title: newChecklistTitle.trim(),
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onChecklistsChange([...checklists, newChecklist]);
      setNewChecklistTitle('');
      setIsCreatingChecklist(false);
    }
  };

  const deleteChecklist = (checklistId: string) => {
    onChecklistsChange(checklists.filter(checklist => checklist.id !== checklistId));
  };

  const addItemToChecklist = (checklistId: string) => {
    const itemText = newItemTexts[checklistId]?.trim();
    if (!itemText) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: itemText,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: [...checklist.items, newItem],
          updatedAt: new Date(),
        };
      }
      return checklist;
    });

    onChecklistsChange(updatedChecklists);
    setNewItemTexts({ ...newItemTexts, [checklistId]: '' });
  };

  const toggleItemCompleted = (checklistId: string, itemId: string) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = (checklist.items || []).map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              completed: !item.completed,
              updatedAt: new Date(),
            };
          }
          return item;
        });
        return {
          ...checklist,
          items: updatedItems,
          updatedAt: new Date(),
        };
      }
      return checklist;
    });

    onChecklistsChange(updatedChecklists);
  };

  const deleteItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          items: (checklist.items || []).filter(item => item.id !== itemId),
          updatedAt: new Date(),
        };
      }
      return checklist;
    });

    onChecklistsChange(updatedChecklists);
  };

  const getChecklistProgress = (checklist: Checklist) => {
    if ((checklist.items || []).length === 0) return 0;
    const completedItems = (checklist.items || []).filter(item => item.completed).length;
    return Math.round((completedItems / (checklist.items || []).length) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center gap-2" style={{ color: '#000000' }}>
          <List className="h-4 w-4" />
          Checklists
        </h4>
      </div>

      {/* Existing Checklists */}
      {checklists.map((checklist) => {
        const progress = getChecklistProgress(checklist);
        return (
          <div key={checklist.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            {/* Checklist Header */}
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-gray-900" style={{ color: '#000000' }}>
                {checklist.title}
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{progress}%</span>
                <button
                  onClick={() => deleteChecklist(checklist.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {(checklist.items || []).length > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2">
              {(checklist.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleItemCompleted(checklist.id, item.id)}
                    className="flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-900'
                    }`}
                    style={!item.completed ? { color: '#000000' } : {}}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteItem(checklist.id, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemTexts[checklist.id] || ''}
                onChange={(e) => setNewItemTexts({ 
                  ...newItemTexts, 
                  [checklist.id]: e.target.value 
                })}
                placeholder="Add an item"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: '#000000' }}
                onKeyPress={(e) => e.key === 'Enter' && addItemToChecklist(checklist.id)}
              />
              <button
                onClick={() => addItemToChecklist(checklist.id)}
                disabled={!newItemTexts[checklist.id]?.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
            </div>
          </div>
        );
      })}

      {/* Create New Checklist */}
      {isCreatingChecklist ? (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <input
            type="text"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="Checklist title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ color: '#000000' }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={createChecklist}
              disabled={!newChecklistTitle.trim()}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              Create Checklist
            </button>
            <button
              onClick={() => {
                setIsCreatingChecklist(false);
                setNewChecklistTitle('');
              }}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreatingChecklist(true)}
          className="w-full flex items-center gap-2 p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300"
        >
          <Plus className="h-4 w-4" />
          Add a checklist
        </button>
      )}
    </div>
  );
}; 