'use client';

import React, { useState, useRef } from 'react';
import { Attachment } from '@/types';
import { Plus, Download, Trash2, Paperclip, Upload, X } from 'lucide-react';
import { uploadFile, deleteFile, formatFileSize, getFileIcon, isImageFile, UploadProgress } from '@/services/storageService';
import { useAuthContext } from '@/contexts/AuthContext';

interface AttachmentManagerProps {
  attachments: Attachment[];
  cardId: string;
  currentUserId: string;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onSetCover?: (attachment: Attachment) => void;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  cardId,
  currentUserId,
  onAttachmentsChange,
  onSetCover,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current user from auth context
  const { user } = useAuthContext();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    console.log('🗂️ Starting file upload:', {
      filesCount: files.length,
      cardId,
      currentUserId,
      user: user?.uid
    });

    // Clear any previous errors
    setUploadError(null);
    
    // Check authentication
    if (!user) {
      setUploadError('You must be logged in to upload files');
      return;
    }

    setIsUploading(true);
    const newAttachments: Attachment[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log('📎 Processing file:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        console.log('📤 Starting upload for:', file.name);
        
        const attachment = await uploadFile(
          file,
          `cards/${cardId}/attachments`,
          (progress) => {
            console.log('📊 Upload progress:', progress);
            setUploadProgress(progress);
          }
        );
        
        // Update with actual user ID
        attachment.uploadedBy = user.uid;
        newAttachments.push(attachment);
        
        console.log('✅ Upload completed:', attachment);
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
        console.log('💾 Attachments updated, total count:', attachments.length + newAttachments.length);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        setUploadError(`Upload failed: ${error.message}`);
      } else {
        setUploadError('Upload failed. Please check your internet connection and try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (!confirm(`Are you sure you want to delete ${attachment.name}?`)) return;

    try {
      await deleteFile(attachment.url);
      onAttachmentsChange(attachments.filter(a => a.id !== attachment.id));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center gap-2" style={{ color: '#000000' }}>
          <Paperclip className="h-4 w-4" />
          Attachments ({attachments.length})
        </h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <X className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-900 font-medium">Upload Failed</span>
          </div>
          <p className="text-sm text-red-700">{uploadError}</p>
          <button
            onClick={() => setUploadError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-900">Uploading... {Math.round(uploadProgress.progress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-blue-700">
            {formatFileSize(uploadProgress.bytesTransferred)} of {formatFileSize(uploadProgress.totalBytes)}
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Debug: User ID: {user?.uid || 'Not logged in'} | Card ID: {cardId}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-gray-500">
          Maximum file size: 10MB
        </p>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 group">
              <div className="flex items-start gap-3">
                {/* File Icon or Image Preview */}
                {isImageFile(attachment.type) ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center text-2xl">
                    {getFileIcon(attachment.type)}
                  </div>
                )}

                {/* File Details */}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate" style={{ color: '#000000' }}>
                    {attachment.name}
                  </h5>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(attachment.size)} • {formatDate(attachment.uploadedAt)}
                  </p>
                  {isImageFile(attachment.type) && onSetCover && (
                    <button
                      onClick={() => onSetCover(attachment)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Set as cover
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAttachment(attachment)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500">
          <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No attachments yet. Upload some files!</p>
        </div>
      )}
    </div>
  );
}; 