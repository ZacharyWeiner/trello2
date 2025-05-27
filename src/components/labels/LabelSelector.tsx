'use client';

import React, { useState } from 'react';
import { Label } from '@/types';
import { Plus, X, Check, Tag } from 'lucide-react';

interface LabelSelectorProps {
  selectedLabels: Label[];
  availableLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
  onCreateLabel: (name: string, color: string) => void;
}

const PREDEFINED_COLORS = [
  '#10B981', // green
  '#3B82F6', // blue  
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#EC4899', // pink
  '#6B7280', // gray
];

export const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabels,
  availableLabels,
  onLabelsChange,
  onCreateLabel,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);

  const isLabelSelected = (label: Label) => {
    return selectedLabels.some(selected => selected.id === label.id);
  };

  const toggleLabel = (label: Label) => {
    if (isLabelSelected(label)) {
      onLabelsChange(selectedLabels.filter(selected => selected.id !== label.id));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      onCreateLabel(newLabelName.trim(), selectedColor);
      setNewLabelName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Labels
      </h4>
      
      {/* Existing Labels */}
      <div className="space-y-2">
        {availableLabels.map((label) => (
          <div
            key={label.id}
            onClick={() => toggleLabel(label)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
          >
            <div
              className="w-8 h-4 rounded"
              style={{ backgroundColor: label.color }}
            />
            <span className="flex-1 text-sm text-gray-900">{label.name}</span>
            {isLabelSelected(label) && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </div>
        ))}
      </div>

      {/* Create New Label */}
      {isCreating ? (
        <div className="border border-gray-200 rounded-lg p-3 space-y-3">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Label name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ color: '#000000' }}
            autoFocus
          />
          
          {/* Color Picker */}
          <div className="space-y-2">
            <span className="text-sm text-gray-600">Choose a color:</span>
            <div className="flex gap-2 flex-wrap">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div
              className="w-8 h-4 rounded"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm text-gray-900">
              {newLabelName || 'Preview'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim()}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewLabelName('');
                setSelectedColor(PREDEFINED_COLORS[0]);
              }}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300"
        >
          <Plus className="h-4 w-4" />
          Create a new label
        </button>
      )}
    </div>
  );
}; 