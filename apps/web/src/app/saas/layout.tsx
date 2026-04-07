'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SaaSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('sb-role')
    if (role === 'SUPERADMIN' || role === 'OPERATOR') {
      setIsAuthorized(true)
    } else {
      const cookies = document.cookie.split(';')
      const accessToken = cookies.find(c => c.trim().startsWith('sb-access-token='))
      if (accessToken) {
        setIsAuthorized(true)
      } else {
        router.push('/login')
      }
    }
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

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">OmniDoc SaaS Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80">
              {localStorage.getItem('sb-email') || ''}
            </span>
            <button
              onClick={() => {
                document.cookie = 'sb-access-token=; Max-Age=0'
                document.cookie = 'sb-refresh-token=; Max-Age=0'
                document.cookie = 'sb-user-metadata=; Max-Age=0'
                localStorage.clear()
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
