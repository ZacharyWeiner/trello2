import { SignupForm } from '@/components/auth/SignupForm';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <SignupForm />
    </div>
  );
} 