'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const isDev = process.env.NODE_ENV === 'development'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      // Set cookies for middleware
      document.cookie = `sb-access-token=${data.session?.access_token || ''}; path=/; SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session?.refresh_token || ''}; path=/; SameSite=Lax`
      document.cookie = `sb-user-metadata=${encodeURIComponent(JSON.stringify(data.user?.user_metadata || {}))}; path=/; SameSite=Lax`

      const role = data.user?.user_metadata?.role as string | undefined

      if (role === 'SUPERADMIN' || role === 'OPERATOR') {
        router.push('/saas')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to authentication service. Please try again.')
      setIsLoading(false)
    }
  }

  const handleDevSuperadminLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: 'superadmin@omnidoc.dev',
        password: 'dev-superadmin-123',
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      // Set cookies for middleware
      document.cookie = `sb-access-token=${data.session?.access_token || ''}; path=/; SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session?.refresh_token || ''}; path=/; SameSite=Lax`
      document.cookie = `sb-user-metadata=${encodeURIComponent(JSON.stringify(data.user?.user_metadata || {}))}; path=/; SameSite=Lax`

      router.push('/saas')
    } catch (err) {
      console.error('Dev login error:', err)
      setError('Unable to connect to authentication service. Please try again.')
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
            onClick={handleDevSuperadminLogin}
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg font-semibold border-2 border-dashed border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Dev: Login as Superadmin'
            )}
          </button>
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
