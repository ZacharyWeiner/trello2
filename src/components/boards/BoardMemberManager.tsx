'use client';

import React, { useState } from 'react';
import { BoardMember, BoardInvitation } from '@/types';
import { UserAvatar, UserAvatarStack } from '@/components/users/UserAvatar';
import { UserSelector } from '@/components/users/UserSelector';
import { EmailTestModal } from './EmailTestModal';
import { Users, Mail, Crown, Eye, UserPlus, MoreVertical, Trash2 } from 'lucide-react';
import { 
  addBoardMember, 
  removeBoardMember, 
  updateBoardMemberRole,
  getBoardMembers 
} from '@/services/boardService';
import { 
  createBoardInvitation, 
  getBoardInvitations,
  searchUsers 
} from '@/services/userService';

interface BoardMemberManagerProps {
  boardId: string;
  boardTitle: string;
  members: BoardMember[];
  currentUserId: string;
  currentUserRole: 'admin' | 'member' | 'viewer';
  onMembersChange: (members: BoardMember[]) => void;
  className?: string;
}

export const BoardMemberManager: React.FC<BoardMemberManagerProps> = ({
  boardId,
  boardTitle,
  members,
  currentUserId,
  currentUserRole,
  onMembersChange,
  className = ''
}) => {
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMemberActions, setShowMemberActions] = useState<string | null>(null);
  const [showEmailTest, setShowEmailTest] = useState(false);

  const canManageMembers = currentUserRole === 'admin';
  const canInviteMembers = currentUserRole === 'admin' || currentUserRole === 'member';

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Check if user is already a member
      const existingMember = members.find(m => m.email.toLowerCase() === inviteEmail.toLowerCase());
      if (existingMember) {
        setError('User is already a member of this board');
        return;
      }

      // Create invitation
      await createBoardInvitation(boardId, boardTitle, inviteEmail, inviteRole);
      
      // Reset form
      setInviteEmail('');
      setInviteRole('member');
      setIsInviting(false);
      
      // TODO: Show success message and refresh invitations
      console.log('✅ Invitation sent to:', inviteEmail);
    } catch (error) {
      console.error('Error inviting member:', error);
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!canManageMembers) return;
    
    const member = members.find(m => m.userId === userId);
    if (!member) return;

    if (!confirm(`Remove ${member.displayName || member.email} from this board?`)) return;

    setLoading(true);
    try {
      await removeBoardMember(boardId, userId);
      
      // Update local state
      const updatedMembers = members.filter(m => m.userId !== userId);
      onMembersChange(updatedMembers);
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'member' | 'viewer') => {
    if (!canManageMembers) return;

    setLoading(true);
    try {
      await updateBoardMemberRole(boardId, userId, newRole);
      
      // Update local state
      const updatedMembers = members.map(m => 
        m.userId === userId ? { ...m, role: newRole } : m
      );
      onMembersChange(updatedMembers);
    } catch (error) {
      console.error('Error updating member role:', error);
      setError(error instanceof Error ? error.message : 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: 'admin' | 'member' | 'viewer') => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'member': return <Users className="h-4 w-4 text-blue-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: 'admin' | 'member' | 'viewer') => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">
            Board Members ({members.length})
          </h3>
        </div>
        
        {canInviteMembers && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmailTest(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Mail className="h-4 w-4" />
              Test Email
            </button>
            <button
              onClick={() => setIsInviting(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Member List */}
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <UserAvatar user={member} size="md" />
              <div>
                <div className="font-medium text-gray-900">
                  {member.displayName || member.email}
                  {member.userId === currentUserId && (
                    <span className="ml-2 text-sm text-gray-500">(You)</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Role Badge */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                {getRoleIcon(member.role)}
                <span className="capitalize">{member.role}</span>
              </div>

              {/* Actions Menu */}
              {canManageMembers && member.userId !== currentUserId && (
                <div className="relative">
                  <button
                    onClick={() => setShowMemberActions(
                      showMemberActions === member.userId ? null : member.userId
                    )}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>

                  {showMemberActions === member.userId && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs text-gray-500 font-medium">Change Role</div>
                        {(['admin', 'member', 'viewer'] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              handleChangeRole(member.userId, role);
                              setShowMemberActions(null);
                            }}
                            disabled={member.role === role}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 ${
                              member.role === role ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                          >
                            {getRoleIcon(role)}
                            <span className="capitalize">{role}</span>
                          </button>
                        ))}
                        
                        <div className="border-t border-gray-200 mt-1 pt-1">
                          <button
                            onClick={() => {
                              handleRemoveMember(member.userId);
                              setShowMemberActions(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove from board
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {isInviting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Invite to Board</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="viewer">Viewer - Can view cards and comments</option>
                    <option value="member">Member - Can edit cards and comments</option>
                    {currentUserRole === 'admin' && (
                      <option value="admin">Admin - Can manage board and members</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsInviting(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  disabled={loading || !inviteEmail.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showMemberActions && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowMemberActions(null)}
        />
      )}

      {/* Email Test Modal */}
      <EmailTestModal
        isOpen={showEmailTest}
        onClose={() => setShowEmailTest(false)}
        boardTitle={boardTitle}
        inviterName={members.find(m => m.userId === currentUserId)?.displayName || 'Unknown'}
        inviterEmail={members.find(m => m.userId === currentUserId)?.email || ''}
      />
    </div>
  );
}; 