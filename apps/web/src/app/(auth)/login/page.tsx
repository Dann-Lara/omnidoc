'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const isDev = process.env.NODE_ENV === 'development'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDevPrefill = () => {
    setEmail('superadmin@omnidoc.dev')
    setPassword('dev-superadmin-123')
  }

  const getDashboardRoute = (role: string | undefined, orgSlug: string | undefined) => {
    if (role === UserRole.SUPERADMIN || role === UserRole.OPERATOR) {
      return '/admin'
    }
    return orgSlug ? `/${orgSlug}` : '/admin'
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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || `Login failed (${response.status})`)
        setIsLoading(false)
        return
      }

      const { access_token, refresh_token, user } = data

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (sessionError) {
        setError('Failed to establish session')
        setIsLoading(false)
        return
      }

      const destination = redirect || getDashboardRoute(user.role, user.org_slug)
      router.push(destination)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to authentication service')
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
      <CardHeader className="space-y-1 text-center pb-2">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to access your clinical dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {isDev && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Development
              </span>
            </div>
          </div>
        )}

        {isDev && (
          <Button
            variant="outline"
            onClick={handleDevPrefill}
            className="w-full"
          >
            Pre-fill Superadmin Credentials
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Suspense fallback={<div className="w-full max-w-md h-96 flex items-center justify-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </motion.div>
  )
}
