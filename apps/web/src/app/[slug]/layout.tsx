'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createUser, isAuthenticated, getStoredUser, getStoredOrgSlug } from '@/lib/auth'
import { TenantSidebar } from './dashboard/components/TenantSidebar'
import { TenantNavbar } from './dashboard/components/TenantNavbar'

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  const storedUser = getStoredUser()
  const storedOrgSlug = getStoredOrgSlug()
  const orgName = storedOrgSlug || slug

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=/${slug}`)
      return
    }

    const userData = getStoredUser()
    if (!userData) {
      router.push('/login')
      return
    }

    const orgSlug = getStoredOrgSlug()
    const user = createUser(userData)

    if (user.isSaaSUser()) {
      router.push('/admin')
      return
    }

    if (orgSlug && orgSlug !== slug) {
      router.push(`/${orgSlug}/dashboard`)
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router, slug])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  useEffect(() => {
    localStorage.setItem('sidebar-open', String(isSidebarOpen))
  }, [isSidebarOpen])

  if (isLoading) {
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
    <div className="min-h-screen bg-surface">
      <TenantSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        orgName={orgName}
        slug={slug}
      />
      
      <TenantNavbar 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        sidebarCollapsed={isSidebarCollapsed}
        orgName={orgName}
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
