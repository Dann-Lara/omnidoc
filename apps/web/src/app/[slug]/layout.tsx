'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/auth'

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = createClient()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/login?redirect=/${slug}`)
        return
      }

      const role: string = user.user_metadata?.role || 'CLIENT'
      const orgSlug: string = user.user_metadata?.org_slug || ''

      if (role === UserRole.SUPERADMIN || role === UserRole.OPERATOR) {
        router.push('/admin')
        return
      }

      if (orgSlug && orgSlug !== slug) {
        router.push(`/${orgSlug}`)
        return
      }

      const firstName: string = user.user_metadata?.first_name || ''
      const lastName: string = user.user_metadata?.last_name || ''
      const fullName: string = `${firstName} ${lastName}`.trim() || user.email || 'User'

      setUserInfo({ name: fullName, role })
      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, slug, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
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
