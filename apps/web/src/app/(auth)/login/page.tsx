'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { UserRole, saveAuthSession } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()
  const emailConfirmed = searchParams.get('confirmed') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const labels = {
    title: t('auth.login.title'),
    subtitle: t('auth.login.subtitle'),
    email: t('auth.login.email'),
    emailPlaceholder: t('auth.login.emailPlaceholder'),
    password: t('auth.login.password'),
    passwordPlaceholder: t('auth.login.passwordPlaceholder'),
    submit: t('auth.login.submit'),
    signingIn: t('auth.login.signingIn'),
    devPrefill: t('auth.login.devPrefill'),
    devPrefill2: t('auth.login.devPrefill2'),
    devPrefill3: t('auth.login.devPrefill3'),
    devPrefill4: t('auth.login.devPrefill4'),
    devHint: t('auth.login.devHint'),
    noAccount: t('auth.login.noAccount'),
    createOne: t('auth.login.createOne'),
    errors: {
      required: t('auth.login.errors.required'),
      network: t('auth.login.errors.network'),
    },
  }

  const handleDevPrefill = (type: 'superadmin' | 'operator' | 'tenant' | 'sub') => {
    if (type === 'superadmin') {
      setEmail('superadmin@omnidoc.dev')
      setPassword('dev-superadmin-123')
    } else if (type === 'operator') {
      setEmail('operator@omnidoc.dev')
      setPassword('dev-operator-123')
    } else if (type === 'tenant') {
      setEmail('dann@opendoc.com')
      setPassword('Dann92Operator')
    }
    else {
      setEmail('dkubdannspc@gmail.com')
      setPassword('Dann92Operator')
    }
  }

  const getDashboardRoute = (role: string | undefined, orgSlug: string | undefined | null, firstName: string | undefined) => {
    if (role === UserRole.SUPERADMIN || role === UserRole.OPERATOR) {
      return '/admin'
    }
    if (orgSlug) {
      return `/${orgSlug}/dashboard`
    }
    if (firstName) {
      const slug = firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      return `/${slug}/dashboard`
    }
    return '/admin'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError(labels.errors.required)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      // Tokens are now in HttpOnly cookies (set by backend)
      // Only save user data to localStorage
      saveAuthSession(data)

      const redirectParam = searchParams.get('redirect')
      const destination = redirectParam || data.dashboard_route || getDashboardRoute(data.user?.role, data.organization?.org_slug, data.user?.first_name)
      
      // Use window.location to ensure localStorage is fully written before navigation
      window.location.href = destination
    } catch (err) {
      console.error('Login error:', err)
      setError(labels.errors.network)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-on-surface mb-2"
        >
          {labels.title}
        </motion.h2>
        <p className="text-on-surface-variant">
          {labels.subtitle}
        </p>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {emailConfirmed && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('auth.login.emailConfirmed')}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {t('auth.login.emailConfirmedDesc')}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
            {labels.email}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder={labels.emailPlaceholder}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
            {labels.password}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder={labels.passwordPlaceholder}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {labels.signingIn}
            </>
          ) : (
            <>
              {labels.submit}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-outline-variant pt-6">
        <button
          type="button"
          onClick={() => handleDevPrefill('superadmin')}
          className="w-full py-3 px-6 rounded-lg font-semibold border-2 border-dashed border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          {labels.devPrefill}
        </button>
        <button
          type="button"
          onClick={() => handleDevPrefill('operator')}
          className="w-full mt-2 py-3 px-6 rounded-lg font-semibold border-2 border-dashed border-secondary text-secondary hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2"
        >
          {labels.devPrefill2}
        </button>
        <button
          type="button"
          onClick={() => handleDevPrefill('tenant')}
          className="w-full mt-2 py-3 px-6 rounded-lg font-semibold border-2 border-dashed border-tertiary text-tertiary hover:bg-tertiary/5 transition-colors flex items-center justify-center gap-2"
        >
          {labels.devPrefill3}
        </button>
        <button
          type="button"
          onClick={() => handleDevPrefill('sub')}
          className="w-full mt-2 py-3 px-6 rounded-lg font-semibold border-2 border-dashed border-tertiary text-tertiary hover:bg-tertiary/5 transition-colors flex items-center justify-center gap-2"
        >
          {labels.devPrefill4}
        </button>
        <p className="text-xs text-on-surface-variant mt-2 text-center">
          {labels.devHint}
        </p>
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-on-surface-variant">
          <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
            {t('auth.login.forgotPassword')}
          </Link>
        </p>
        <p className="text-sm text-on-surface-variant">
          {labels.noAccount}{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            {labels.createOne}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
