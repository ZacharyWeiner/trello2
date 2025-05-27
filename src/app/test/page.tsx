export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Test Page
        </h1>
        <p className="text-gray-600">
          If you can see this, Next.js routing is working on Vercel!
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Environment: {process.env.NODE_ENV}
        </div>
      </div>
    </div>
  );
} 