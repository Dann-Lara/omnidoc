'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, isAuthenticated, clearAuthSession, getStoredUser } from '@/lib/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/login')
      return
    }

    const user = new User(storedUser)

    if (!user.isSaaSUser()) {
      router.push('/tenant')
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-primary">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const storedUser = getStoredUser()
  const user = storedUser ? new User(storedUser) : null

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">OmniDoc Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">
              {user?.getFullName() || ''}
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {user?.getRole() || ''}
            </span>
            <button
              onClick={() => {
                clearAuthSession()
                router.push('/login')
              }}
              className="text-sm hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}
