'use client';

import React, { useState } from 'react';
import { X, Palette, Layout } from 'lucide-react';
import { BoardBackground, BoardTemplate } from '@/types';
import { BoardBackgroundSelector } from './BoardBackgroundSelector';
import { BoardTemplateSelector } from './BoardTemplateSelector';

interface CreateBoardModalProps {
  onClose: () => void;
  onCreate: (title: string, background?: BoardBackground, template?: BoardTemplate) => void;
}

const BOARD_COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632', '#89609e', '#cd5a91',
  '#4bbf6b', '#00aecc', '#838c91', '#026aa7', '#8f6a00', '#3d6b00',
  '#8b2635', '#5c4c9a', '#b3479d', '#2d8f47', '#0099cc', '#626f86'
];

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [selectedBackground, setSelectedBackground] = useState<BoardBackground>({
    type: 'color',
    value: BOARD_COLORS[0]
  });
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [creationStep, setCreationStep] = useState<'basic' | 'template' | 'background'>('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      console.log('🏗️ Creating board with:', {
        title: title.trim(),
        background: selectedBackground,
        template: selectedTemplate
      });
      onCreate(title.trim(), selectedBackground, selectedTemplate || undefined);
    }
  };

  const getBackgroundPreview = () => {
    switch (selectedBackground.type) {
      case 'color':
        return { backgroundColor: selectedBackground.value };
      case 'gradient':
        return { background: selectedBackground.value };
      case 'pattern':
        return { 
          backgroundColor: selectedBackground.value,
          backgroundImage: selectedBackground.pattern === 'dots' 
            ? 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'
            : selectedBackground.pattern === 'grid'
            ? 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)'
            : 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
          backgroundSize: '20px 20px'
        };
      case 'unsplash':
        return { 
          backgroundImage: `url(${selectedBackground.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: selectedBackground.value };
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create Board</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Board Preview */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Board Preview
              </label>
              <div 
                className="h-32 rounded-lg border border-gray-300 dark:border-gray-600 relative overflow-hidden"
                style={getBackgroundPreview()}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-semibold text-lg">
                    {title || 'Board Title'}
                  </h3>
                  {selectedTemplate && (
                    <p className="text-sm opacity-90">
                      {selectedTemplate.name} Template
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Board Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Board Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter board title..."
                required
                autoFocus
              />
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Board Template (Optional)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowTemplateSelector(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                           text-gray-700 dark:text-gray-300"
                >
                  <Layout className="h-4 w-4" />
                  {selectedTemplate ? selectedTemplate.name : 'Choose Template'}
                </button>
                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove Template
                  </button>
                )}
              </div>
              {selectedTemplate && (
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                    {selectedTemplate.name}
                  </p>
                  <p>{selectedTemplate.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <span>{selectedTemplate.lists.length} lists</span>
                    <span>{selectedTemplate.labels.length} labels</span>
                    <span>{selectedTemplate.customFields.length} custom fields</span>
                  </div>
                </div>
              )}
            </div>

            {/* Background Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Background
              </label>
              
              {/* Quick color selection */}
              <div className="flex items-center gap-2 mb-3">
                {BOARD_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedBackground({ type: 'color', value: color })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      selectedBackground.type === 'color' && selectedBackground.value === color
                        ? 'border-blue-500 scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setShowBackgroundSelector(true)}
                  className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 
                           hover:border-blue-500 transition-colors flex items-center justify-center
                           bg-gray-100 dark:bg-gray-700"
                >
                  <Palette className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Background info */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedBackground.type === 'color' && 'Solid color background'}
                {selectedBackground.type === 'gradient' && 'Gradient background'}
                {selectedBackground.type === 'pattern' && `Pattern background (${selectedBackground.pattern})`}
                {selectedBackground.type === 'unsplash' && (
                  <span>
                    Photo by {selectedBackground.unsplashCredit?.name} on{' '}
                    <a 
                      href="https://unsplash.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Unsplash
                    </a>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                         rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Board
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Background Selector Modal */}
      <BoardBackgroundSelector
        isOpen={showBackgroundSelector}
        onClose={() => setShowBackgroundSelector(false)}
        onSelect={(background) => {
          setSelectedBackground(background);
          setShowBackgroundSelector(false);
        }}
        currentBackground={selectedBackground}
      />

      {/* Template Selector Modal */}
      <BoardTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={(template) => {
          console.log('📋 Template selected:', template);
          setSelectedTemplate(template);
          // Also update background from template
          setSelectedBackground(template.background);
          setShowTemplateSelector(false);
        }}
      />
    </>
  );
}; 