'use client';

import React, { useState } from 'react';
import { Board } from '@/types';
import { deleteBoard } from '@/services/boardService';
import { X, Trash2, AlertTriangle, Settings, Palette, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  onBoardUpdate: (board: Board) => void;
  onBoardDelete?: () => void;
}

export const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({
  isOpen,
  onClose,
  board,
  onBoardUpdate,
  onBoardDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'danger'>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteBoard = async () => {
    if (deleteConfirmText !== board.title) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBoard(board.id);
      
      // Call the onBoardDelete callback if provided
      if (onBoardDelete) {
        onBoardDelete();
      } else {
        // Default behavior: redirect to boards page
        router.push('/boards');
      }
      
      onClose();
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Board Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="h-4 w-4" />
            General
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'danger'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Board Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Board Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Board Title
                    </label>
                    <input
                      type="text"
                      value={board.title}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Board title editing coming soon
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={board.description || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Board description editing coming soon
                    </p>
                  </div>
                </div>
              </div>

              {/* Board Stats */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Board Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Members
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {board.members.length}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Created
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {board.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
                      Delete Board
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Once you delete a board, there is no going back. This will permanently delete:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1 mb-4">
                      <li>All lists and cards in this board</li>
                      <li>All comments and attachments</li>
                      <li>All board member access</li>
                      <li>All automation rules</li>
                    </ul>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 
                                 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Board
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                            Type the board name "{board.title}" to confirm deletion:
                          </label>
                          <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                     focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder={board.title}
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteBoard}
                            disabled={deleteConfirmText !== board.title || isDeleting}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                                     flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            {isDeleting ? 'Deleting...' : 'Delete Board Forever'}
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteConfirmText('');
                            }}
                            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 
                                     px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 
                                     transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 