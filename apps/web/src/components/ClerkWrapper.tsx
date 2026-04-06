'use client';

import { type ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

interface ClerkWrapperProps {
  children: ReactNode;
}

const isClerkConfigured = () => {
  if (typeof window === 'undefined') return false;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  return Boolean(
    publishableKey &&
    !publishableKey.includes('placeholder') &&
    secretKey &&
    !secretKey.includes('placeholder')
  );
};

export function ClerkWrapper({ children }: ClerkWrapperProps) {
  if (isClerkConfigured()) {
    return (
      <ClerkProvider>
        {children}
      </ClerkProvider>
    );
  }

  return <>{children}</>;
}
