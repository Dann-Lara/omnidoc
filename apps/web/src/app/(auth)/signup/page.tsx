'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, ArrowRight, AlertCircle } from 'lucide-react';

const hasValidClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'Other',
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    orgName: '',
    specialty: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
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

        <SignUpComponent />

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

      <div className="bg-warning-container/20 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-on-surface">Development Mode</p>
          <p className="text-on-surface-variant">
            Clerk keys not configured. Set <code className="text-xs bg-surface-container px-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in <code className="text-xs bg-surface-container px-1 rounded">.env.local</code> to enable authentication.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          step >= 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
        }`}>
          1
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-surface-container'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          step >= 2 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
        }`}>
          2
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <>
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-on-surface mb-2">
                Practice Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  id="orgName"
                  type="text"
                  value={formData.orgName}
                  onChange={(e) => handleInputChange('orgName', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Dr. Smith Medical Practice"
                />
              </div>
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-on-surface mb-2">
                Specialty
              </label>
              <select
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">Select your specialty</option>
                {SPECIALTIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!formData.orgName || !formData.specialty}
              className="w-full clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-on-surface mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-on-surface mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-6 rounded-lg font-semibold border border-outline-variant hover:bg-surface-container transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.password}
                className="flex-1 clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">Creating...</span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>

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
