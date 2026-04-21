'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SetupPage() {
  const params = useParams()
  const router = useRouter()
  const [token, setToken] = useState<string>('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (params?.token) {
      setToken(params.token as string)
    }
    setMounted(true)
  }, [params])

  const isFormValid = mounted && formData.firstName && formData.lastName && formData.password && formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/invitations/${token}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Setup failed')
      } else {
        const redirectUrl = data.redirectUrl || `/${data.organizationSlug}/dashboard`
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}&setup=success`)
      }
    } catch (err) {
      console.error('Setup error:', err)
      setError('Unable to complete setup')
    } finally {
      setIsLoading(false)
    }
  }

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

      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-on-surface mb-2">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="John"
              required
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
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Smith"
              required
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
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Create a strong password"
              required
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
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!mounted || isLoading || !isFormValid}
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
        Invitation token: <code className="bg-surface-container px-1.5 py-0.5 rounded">{token}</code>
      </p>
    </div>
  )
}
