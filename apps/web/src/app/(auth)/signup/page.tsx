'use client';

import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-on-surface mb-2"
        >
          Start your journey
        </motion.h2>
        <p className="text-on-surface-variant">
          Create your account and set up your practice in minutes
        </p>
      </div>

      <SignUp />

      <div className="text-center">
        <p className="text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
