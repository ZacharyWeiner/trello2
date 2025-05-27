'use client';

import React, { useState } from 'react';
import { generateInvitationEmailContent } from '@/services/emailService';
import { X, Mail, Copy, ExternalLink } from 'lucide-react';

interface EmailTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTitle: string;
  inviterName: string;
  inviterEmail: string;
}

export const EmailTestModal: React.FC<EmailTestModalProps> = ({
  isOpen,
  onClose,
  boardTitle,
  inviterName,
  inviterEmail
}) => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testRole, setTestRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [emailContent, setEmailContent] = useState<any>(null);

  if (!isOpen) return null;

  const generateTestEmail = () => {
    const content = generateInvitationEmailContent({
      inviteeName: testEmail.split('@')[0],
      inviterName,
      inviterEmail,
      boardTitle,
      role: testRole,
      invitationToken: 'demo-token-123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    setEmailContent(content);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const openInNewTab = (content: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Invitation Test
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Email Configuration */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-3">Test Email Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="test@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={testRole}
                    onChange={(e) => setTestRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                onClick={generateTestEmail}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Generate Email Preview
              </button>
            </div>

            {/* EmailJS Setup Instructions */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-3">📧 EmailJS Setup Required</h3>
              <p className="text-yellow-800 text-sm mb-3">
                To send actual emails, you need to set up EmailJS. Here's how:
              </p>
              <ol className="text-yellow-800 text-sm space-y-2 list-decimal list-inside">
                <li>Sign up at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">emailjs.com</a></li>
                <li>Create an email service (Gmail, Outlook, etc.)</li>
                <li>Create an email template with these variables:
                  <code className="bg-yellow-100 px-1 rounded text-xs ml-1">
                    to_email, to_name, from_name, board_title, board_role, invitation_link
                  </code>
                </li>
                <li>Add your EmailJS credentials to <code className="bg-yellow-100 px-1 rounded text-xs">.env.local</code>:
                  <div className="bg-yellow-100 p-2 rounded mt-2 text-xs font-mono">
                    NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id<br/>
                    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id<br/>
                    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
                  </div>
                </li>
              </ol>
            </div>

            {/* Email Preview */}
            {emailContent && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Email Preview</h3>
                
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                  <div className="bg-gray-50 p-3 rounded border flex items-center justify-between">
                    <span className="font-medium">{emailContent.subject}</span>
                    <button
                      onClick={() => copyToClipboard(emailContent.subject)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Invitation Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invitation Link:</label>
                  <div className="bg-gray-50 p-3 rounded border flex items-center justify-between">
                    <span className="text-blue-600 break-all">{emailContent.link}</span>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => copyToClipboard(emailContent.link)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(emailContent.link, '_blank')}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* HTML Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">HTML Email:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(emailContent.html)}
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy HTML
                      </button>
                      <button
                        onClick={() => openInNewTab(emailContent.html)}
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Preview
                      </button>
                    </div>
                  </div>
                  <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: emailContent.html }} />
                  </div>
                </div>

                {/* Text Version */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Text Email:</label>
                    <button
                      onClick={() => copyToClipboard(emailContent.text)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Text
                    </button>
                  </div>
                  <pre className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {emailContent.text}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 