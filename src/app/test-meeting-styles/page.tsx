'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';

export default function TestMeetingStylesPage() {
  const [testText, setTestText] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testType, setTestType] = useState('general');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Meeting Notes Styling Test
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g., Sprint Planning Meeting"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 placeholder-visible"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-visible"
              >
                <option value="general">General</option>
                <option value="standup">Standup</option>
                <option value="planning">Planning</option>
                <option value="review">Review</option>
                <option value="brainstorm">Brainstorm</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Notes
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Paste your meeting notes here... 

Examples of what I can extract:
• 'John needs to update the documentation by Friday'
• 'TODO: Review the API design'
• 'Sarah will create wireframes for the new feature'
• 'We decided to use React for the frontend'
• 'Blocked by missing database credentials'
• 'Follow up with the client next week'"
              className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white meeting-notes-textarea placeholder-visible"
              style={{ 
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Styling Test Results
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-blue-800">
                ✅ Input field text: <span className="font-mono">{testTitle || 'Type something...'}</span>
              </p>
              <p className="text-blue-800">
                ✅ Select value: <span className="font-mono">{testType}</span>
              </p>
              <p className="text-blue-800">
                ✅ Textarea text: <span className="font-mono">{testText.substring(0, 50) || 'Type something...'}</span>
              </p>
              <p className="text-blue-800">
                ✅ Placeholder visibility: Should be clearly visible in gray
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Expected Behavior
            </h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Placeholder text should be clearly visible in medium gray</li>
              <li>• Input text should be dark gray/black for good contrast</li>
              <li>• Focus states should show blue ring</li>
              <li>• All text should be easily readable</li>
              <li>• No white text on white background issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 