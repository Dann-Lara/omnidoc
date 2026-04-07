'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:9999'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export default function LoginPage() {
  const router = useRouter()
  const isDev = process.env.NODE_ENV === 'development'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDevPrefill = () => {
    setEmail('superadmin@omnidoc.dev')
    setPassword('dev-superadmin-123')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
        credentials: 'omit',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.msg || 'Login failed')
        setIsLoading(false)
        return
      }

      // Guardar SOLO en localStorage (las cookies Secure no funcionan en HTTP localhost)
      localStorage.setItem('sb-access-token', data.access_token || '')
      localStorage.setItem('sb-refresh-token', data.refresh_token || '')
      localStorage.setItem('sb-user', JSON.stringify(data.user || {}))
      localStorage.setItem('sb-role', data.user?.user_metadata?.role || '')
      localStorage.setItem('sb-email', data.user?.email || '')
      localStorage.setItem('sb-user-id', data.user?.id || '')

      const role = data.user?.user_metadata?.role

      if (role === 'SUPERADMIN' || role === 'OPERATOR') {
        router.push('/saas')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to authentication service')
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
          Welcome back
        </motion.h2>
        <p className="text-on-surface-variant">
          Sign in to access your clinical dashboard
        </p>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
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
              required
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
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {isDev && (
        <div className="border-t border-outline-variant pt-6">
          <button
            type="button"
            onClick={handleDevPrefill}
            className="w-full py-3 px-6 rounded-lg font-semibold border-2 border-dashed border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            Dev: Pre-fill Superadmin Credentials
          </button>
          <p className="text-xs text-on-surface-variant mt-2 text-center">
            Click to fill credentials, then click Sign In
          </p>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
