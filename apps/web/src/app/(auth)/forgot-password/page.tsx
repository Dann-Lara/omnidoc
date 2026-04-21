'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function ForgotPasswordForm() {
  const router = useRouter()
  const { lang, t } = useI18n()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const labels = {
    title: t('forgotPassword.title'),
    subtitle: t('forgotPassword.subtitle'),
    email: t('forgotPassword.email'),
    emailPlaceholder: 'doctor@clinic.com',
    submit: t('forgotPassword.submit'),
    sending: t('forgotPassword.sending'),
    backToLogin: t('forgotPassword.backToLogin'),
    successTitle: t('forgotPassword.successTitle'),
    successMessage: t('forgotPassword.successMessage'),
    checkEmail: t('forgotPassword.checkEmail'),
    errors: {
      required: t('forgotPassword.required'),
      network: t('auth.login.errors.network'),
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError(labels.errors.required)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Failed to send reset email')
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
    } catch (err) {
      console.error('Forgot password error:', err)
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

        <div className="text-center space-y-4">
          <div className="bg-surface-container rounded-lg p-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
            <span className="text-sm text-on-surface">{email}</span>
          </div>
          
          <p className="text-sm text-on-surface-variant">
            {labels.checkEmail}
          </p>

          <Link 
            href="/login" 
            className="block w-full py-3 px-6 rounded-lg font-semibold border border-outline-variant hover:bg-surface-container transition-colors"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {labels.sending}
            </>
          ) : (
            <>
              {labels.submit}
              <ArrowRight className="w-5 h-5" />
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
