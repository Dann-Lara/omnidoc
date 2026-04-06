'use client';

import { useParams } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';

export default function SetupPage() {
  const params = useParams();
  const token = params?.token as string;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-on-surface mb-2">
          Complete your profile
        </h2>
        <p className="text-on-surface-variant">
          You&apos;ve been invited to join a medical practice
        </p>
      </div>

      <SignUp
        fallbackRedirectUrl={`/setup/${token}/complete`}
        unsafeMetadata={{ invitationToken: token }}
      />
    </div>
  );
}
