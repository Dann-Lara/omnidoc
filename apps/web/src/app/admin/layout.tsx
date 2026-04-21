'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { isAuthenticated, getStoredUser, getStoredOrgSlug, useAuth } from '@/lib/auth'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminNavbar } from './components/AdminNavbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user: authUser, isLoading: authLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLayoutLoading, setIsLayoutLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/login')
      return
    }

    const user = authUser || storedUser
    if (!user) {
      router.push('/login')
      return
    }

    const userRole = user.role
    const userOrgSlug = getStoredOrgSlug()
    if (userRole !== 'SUPERADMIN' && userRole !== 'OPERATOR') {
      if (userOrgSlug) {
        router.push(`/${userOrgSlug}/dashboard`)
      } else if (user.first_name) {
        const slug = user.first_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        router.push(`/${slug}/dashboard`)
      } else {
        router.push('/login')
      }
      return
    }

    setIsAuthorized(true)
    setIsLayoutLoading(false)
  }, [router, authLoading, authUser])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (authLoading || isLayoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl clinical-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full"
            />
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-on-surface-variant text-sm"
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const sidebarMargin = isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <AdminNavbar 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        sidebarCollapsed={isSidebarCollapsed}
      />

      <AnimatePresence>
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`
            pt-16 min-h-screen transition-all duration-300
            ${isSidebarOpen ? 'lg:ml-0' : sidebarMargin}
          `}
        >
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
