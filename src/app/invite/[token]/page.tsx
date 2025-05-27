'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { BoardInvitation } from '@/types';
import { 
  getBoardInvitations, 
  acceptBoardInvitation, 
  declineBoardInvitation,
  getInvitationByToken
} from '@/services/userService';
import { getBoard, addBoardMember } from '@/services/boardService';
import { Loader2, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<BoardInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined' | 'expired' | 'invalid'>('pending');

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      // Find invitation by token
      const foundInvitation = await getInvitationByToken(token);

      if (!foundInvitation) {
        setStatus('invalid');
        setError('Invitation not found or invalid');
        return;
      }

      // Check if invitation is expired
      if (foundInvitation.expiresAt < new Date()) {
        setStatus('expired');
        setError('This invitation has expired');
        return;
      }

      // Check if invitation is already processed
      if (foundInvitation.status !== 'pending') {
        setStatus(foundInvitation.status as any);
        if (foundInvitation.status === 'accepted') {
          setError('This invitation has already been accepted');
        } else {
          setError('This invitation has been declined');
        }
        return;
      }

      setInvitation(foundInvitation);
      setStatus('pending');

    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Failed to load invitation');
      setStatus('invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !user) return;

    setProcessing(true);
    try {
      // Accept the invitation
      await acceptBoardInvitation(invitation.id);

      // Add user to board members
      await addBoardMember(invitation.boardId, {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email || '',
        photoURL: user.photoURL || '',
        role: invitation.role,
        invitedBy: invitation.inviterEmail
      });

      setStatus('accepted');
      
      // Redirect to board after a short delay
      setTimeout(() => {
        router.push(`/boards/${invitation.boardId}`);
      }, 2000);

    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    setProcessing(true);
    try {
      await declineBoardInvitation(invitation.id);
      setStatus('declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
      setError('Failed to decline invitation. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid' || status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'expired' ? 'Invitation Expired' : 'Invalid Invitation'}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/boards')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Boards
          </button>
        </div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined the board. Redirecting you now...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-500">Redirecting to board...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Declined</h1>
          <p className="text-gray-600 mb-6">
            You've declined this board invitation.
          </p>
          <button
            onClick={() => router.push('/boards')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Boards
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to accept this board invitation.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Board Invitation</h1>
        </div>

        {invitation && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="font-semibold text-blue-900 mb-2">You're invited to join:</h2>
              <p className="text-lg font-bold text-blue-800">{invitation.boardTitle}</p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Invited by:</strong> {invitation.inviterName}</p>
              <p><strong>Role:</strong> <span className="capitalize font-medium">{invitation.role}</span></p>
              <p><strong>Expires:</strong> {invitation.expiresAt.toLocaleDateString()}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">As a {invitation.role}, you can:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {invitation.role === 'admin' ? (
                  <>
                    <li>✅ View and edit all content</li>
                    <li>✅ Manage board members</li>
                    <li>✅ Change board settings</li>
                    <li>✅ Delete the board</li>
                  </>
                ) : invitation.role === 'member' ? (
                  <>
                    <li>✅ View and edit all content</li>
                    <li>✅ Create and manage cards</li>
                    <li>✅ Comment and collaborate</li>
                    <li>❌ Manage board members</li>
                  </>
                ) : (
                  <>
                    <li>✅ View all content</li>
                    <li>✅ Comment on cards</li>
                    <li>❌ Edit or create content</li>
                    <li>❌ Manage board members</li>
                  </>
                )}
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleAcceptInvitation}
                disabled={processing}
                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </button>

              <button
                onClick={handleDeclineInvitation}
                disabled={processing}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 