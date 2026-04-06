'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const hasValidClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

export default function SetupPage() {
  const params = useParams();
  const token = params?.token as string;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [ShowClerkSignUp, setShowClerkSignUp] = useState<React.ComponentType<Record<string, unknown>> | null>(null);

  useEffect(() => {
    if (hasValidClerkKey) {
      import('@clerk/nextjs').then((mod) => {
        setShowClerkSignUp(() => mod.SignUp);
      });
    }
  }, []);

  if (ShowClerkSignUp) {
    const SignUpComponent = ShowClerkSignUp;
    return (
      <div className="space-y-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-on-surface mb-2"
          >
            Complete your profile
          </motion.h2>
          <p className="text-on-surface-variant">
            You&apos;ve been invited to join a medical practice
          </p>
        </div>

        <SignUpComponent
          fallbackRedirectUrl={`/setup/${token}/complete`}
          unsafeMetadata={{ invitationToken: token }}
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <User className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-on-surface mb-2"
        >
          Complete your profile
        </motion.h2>
        <p className="text-on-surface-variant">
          You&apos;ve been invited to join a medical practice
        </p>
      </div>

      <div className="bg-warning-container/20 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-on-surface">Development Mode</p>
          <p className="text-on-surface-variant">
            Clerk keys not configured. Set <code className="text-xs bg-surface-container px-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in <code className="text-xs bg-surface-container px-1 rounded">.env.local</code> to enable authentication.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-error-container/20 border border-error/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-on-surface mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="John"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-on-surface mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
            Create Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Create a strong password"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword}
          className="w-full clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-pulse">Setting up...</span>
          ) : (
            <>
              Complete Setup
              <CheckCircle className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-center text-on-surface-variant">
        Invitation token: <code className="bg-surface-container px-1.5 py-0.5 rounded">{token || 'none'}</code>
      </p>
    </div>
  );
}
