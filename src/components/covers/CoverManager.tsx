'use client';

import React, { useState } from 'react';
import { Attachment } from '@/types';
import { Image, Palette, X } from 'lucide-react';

interface CoverManagerProps {
  currentCover?: string;
  attachments: Attachment[];
  onCoverChange: (cover: string | undefined) => void;
}

const COLOR_COVERS = [
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
  '#1F2937', // dark gray
  '#0F172A', // dark blue
];

export const CoverManager: React.FC<CoverManagerProps> = ({
  currentCover,
  attachments,
  onCoverChange,
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'colors'>('images');

  const imageAttachments = attachments.filter(attachment => 
    attachment.type.startsWith('image/')
  );

  const isCoverSet = Boolean(currentCover);
  const isColorCover = currentCover && COLOR_COVERS.includes(currentCover);
  const isImageCover = currentCover && !isColorCover;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center gap-2" style={{ color: '#000000' }}>
          <Image className="h-4 w-4" />
          Cover
        </h4>
        {isCoverSet && (
          <button
            onClick={() => onCoverChange(undefined)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>

      {/* Current Cover Preview */}
      {isCoverSet && (
        <div className="relative">
          {isColorCover ? (
            <div
              className="w-full h-32 rounded-lg"
              style={{ backgroundColor: currentCover }}
            />
          ) : isImageCover ? (
            <img
              src={currentCover}
              alt="Card cover"
              className="w-full h-32 object-cover rounded-lg"
            />
          ) : null}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
              Current Cover
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'images'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Images ({imageAttachments.length})
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'colors'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Colors
        </button>
      </div>

      {/* Content */}
      {activeTab === 'images' && (
        <div className="space-y-3">
          {imageAttachments.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {imageAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  onClick={() => onCoverChange(attachment.url)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    currentCover === attachment.url
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-20 object-cover"
                  />
                  {currentCover === attachment.url && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Selected
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Image className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No images available</p>
              <p className="text-xs text-gray-400 mt-1">
                Upload some images to use as covers
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="grid grid-cols-4 gap-3">
          {COLOR_COVERS.map((color) => (
            <button
              key={color}
              onClick={() => onCoverChange(color)}
              className={`aspect-video rounded-lg border-2 transition-all hover:scale-105 ${
                currentCover === color
                  ? 'border-gray-800 ring-2 ring-gray-300'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            >
              {currentCover === color && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    Selected
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!isCoverSet && (
        <div className="text-center py-6 text-gray-500">
          <Palette className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Choose a cover for this card</p>
          <p className="text-xs text-gray-400 mt-1">
            Select from uploaded images or colors above
          </p>
        </div>
      )}
    </div>
  );
}; 