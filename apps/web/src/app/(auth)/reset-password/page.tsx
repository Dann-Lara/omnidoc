'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang, t } = useI18n()

  const [accessToken, setAccessToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const labels = {
    title: t('resetPassword.title'),
    subtitle: t('resetPassword.subtitle'),
    password: t('resetPassword.password'),
    passwordPlaceholder: t('resetPassword.passwordPlaceholder'),
    confirmPassword: t('resetPassword.confirmPassword'),
    confirmPasswordPlaceholder: t('resetPassword.confirmPasswordPlaceholder'),
    submit: t('resetPassword.submit'),
    resetting: t('resetPassword.resetting'),
    backToLogin: t('resetPassword.backToLogin'),
    successTitle: t('resetPassword.successTitle'),
    successMessage: t('resetPassword.successMessage'),
    errors: {
      tokenMissing: t('resetPassword.tokenMissing'),
      passwordRequired: t('resetPassword.passwordRequired'),
      passwordMin: t('resetPassword.passwordMin'),
      passwordMismatch: t('resetPassword.passwordMismatch'),
      network: t('auth.login.errors.network'),
    },
  }

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setAccessToken(token)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!accessToken) {
      setError(labels.errors.tokenMissing)
      return
    }

    if (!password) {
      setError(labels.errors.passwordRequired)
      return
    }

    if (password.length < 8) {
      setError(labels.errors.passwordMin)
      return
    }

    if (password !== confirmPassword) {
      setError(labels.errors.passwordMismatch)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          access_token: accessToken,
          new_password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Failed to reset password')
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
    } catch (err) {
      console.error('Reset password error:', err)
      setError(labels.errors.network)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-success-container rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-on-surface mb-3"
          >
            {labels.successTitle}
          </motion.h2>
          <p className="text-on-surface-variant mb-6">
            {labels.successMessage}
          </p>
        </motion.div>

        <div className="text-center">
          <Link 
            href="/login" 
            className="block w-full py-3 px-6 rounded-lg font-semibold clinical-gradient text-on-primary hover:opacity-90 transition-opacity"
          >
            {labels.backToLogin}
          </Link>
        </div>
      </div>
    )
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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface mb-2">
            {labels.confirmPassword}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder={labels.confirmPasswordPlaceholder}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !accessToken}
          className="w-full clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {labels.resetting}
            </>
          ) : (
            <>
              {labels.submit}
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <Link 
          href="/login" 
          className="text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          {labels.backToLogin}
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
