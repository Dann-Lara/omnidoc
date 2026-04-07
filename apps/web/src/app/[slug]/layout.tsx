'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UserRole } from '@/lib/auth'

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('sb-user')
      if (!userStr) {
        router.push(`/login?redirect=/${slug}`)
        return
      }

      try {
        const user = JSON.parse(userStr)
        const role = user.role || 'CLIENT'
        const orgSlug = user.org_slug || ''

        if (role === UserRole.SUPERADMIN || role === UserRole.OPERATOR) {
          router.push('/admin')
          return
        }

        if (orgSlug && orgSlug !== slug) {
          router.push(`/${orgSlug}`)
          return
        }

        const firstName = user.first_name || ''
        const lastName = user.last_name || ''
        const fullName = `${firstName} ${lastName}`.trim() || user.email || 'User'

        setUserInfo({ name: fullName, role })
        setIsAuthorized(true)
      } catch {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, slug])

  const handleLogout = () => {
    localStorage.removeItem('sb-access-token')
    localStorage.removeItem('sb-refresh-token')
    localStorage.removeItem('sb-user')
    router.push('/login')
  }

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

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{slug}</h1>
            <span className="text-sm opacity-80">/ {userInfo?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {userInfo?.role}
            </span>
            <button
              onClick={handleLogout}
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
