'use client';

export const dynamic = 'force-dynamic';

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🧪 Simple Test Page
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          This page should work without any authentication or Firebase dependencies.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">✅ Test Results</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Page loads successfully</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No authentication required</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No Firebase dependencies</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Vercel deployment working</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🔍 Debugging Info
          </h3>
          <p className="text-blue-700">
            If you can see this page, it means the basic Next.js deployment is working correctly.
            The issue with other pages is likely related to Firebase authentication or environment variables.
          </p>
        </div>
      </div>
    </div>
  );
} 