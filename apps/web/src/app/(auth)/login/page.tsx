'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const hasValidClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ShowClerkSignIn, setShowClerkSignIn] = useState<React.ComponentType<Record<string, unknown>> | null>(null);

  useEffect(() => {
    if (hasValidClerkKey) {
      import('@clerk/nextjs').then((mod) => {
        setShowClerkSignIn(() => mod.SignIn);
      });
    }
  }, []);

  if (ShowClerkSignIn) {
    const SignInComponent = ShowClerkSignIn;
    return (
      <div className="space-y-8">
        <div className="text-center lg:text-left">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-on-surface mb-2"
          >
            Welcome back
          </motion.h2>
          <p className="text-on-surface-variant">
            Sign in to access your clinical dashboard
          </p>
        </div>

        <SignInComponent />

        <div className="text-center">
          <p className="text-sm text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-on-surface mb-2"
        >
          Welcome back
        </motion.h2>
        <p className="text-on-surface-variant">
          Sign in to access your clinical dashboard
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="doctor@clinic.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-pulse">Signing in...</span>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
