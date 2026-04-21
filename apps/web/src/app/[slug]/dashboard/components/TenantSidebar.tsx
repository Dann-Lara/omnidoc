'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  Activity,
  BarChart3,
  User,
  Folder
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { getStoredUser, clearAuthSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface TenantSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  orgName?: string
  slug?: string
}

export function TenantSidebar({ isOpen, onClose, isCollapsed: externalCollapsed, onToggleCollapse, orgName, slug }: TenantSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(true)
  const isCollapsed = externalCollapsed ?? internalCollapsed
  const setIsCollapsed = onToggleCollapse ?? setInternalCollapsed
  
  const pathname = usePathname()
  const router = useRouter()
  const { lang, t } = useI18n()
  const user = getStoredUser()
  const userRole = user?.role
  
  const basePath = slug ? `/${slug}` : ''

  const navItems = [
    { href: `${basePath}/dashboard`, icon: LayoutDashboard, labelKey: 'tenant.nav.dashboard' },
  ]

  const areasItems = [
    { href: `${basePath}/areas/specialties`, icon: Folder, labelKey: 'tenant.nav.specialties' },
    ...(userRole === 'OWNER' ? [{ href: `${basePath}/areas/team`, icon: Users, labelKey: 'tenant.nav.team' }] : []),
  ]

  const secondaryNavItems = [
    { href: `${basePath}/dashboard/calendar`, icon: Calendar, labelKey: 'tenant.nav.calendar' },
    { href: `${basePath}/dashboard/metrics`, icon: BarChart3, labelKey: 'tenant.nav.metrics' },
    { href: `${basePath}/dashboard/team`, icon: Users, labelKey: 'tenant.nav.team' },
    { href: `${basePath}/settings`, icon: Settings, labelKey: 'tenant.nav.settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard') && href === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      clearAuthSession()
      document.cookie = 'sb-access-token=; path=/; max-age=0'
      document.cookie = 'sb-refresh-token=; path=/; max-age=0'
      router.push('/login')
    }
  }

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'

  const sidebarContent = (
    <div className="flex flex-col h-full py-6">
      <div className={`px-6 mb-8 flex items-center ${isCollapsed ? 'justify-center px-3' : ''}`}>
        <Link href={`${basePath}/dashboard`} className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl clinical-gradient flex items-center justify-center shadow-lg shadow-primary/20 shrink-0"
          >
            <Activity className="w-5 h-5 text-white" />
          </motion.div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-xl font-bold tracking-tight text-primary dark:text-white">OmniDoc</h1>
              <p className="text-xs text-on-surface-variant dark:text-slate-400">{orgName || 'Clinic'}</p>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant dark:text-slate-500 mb-3 ${isCollapsed ? 'hidden' : ''}`}>
          {t('tenant.sidebar.navigation')}
        </p>
        
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${active 
                    ? 'bg-surface-container-lowest dark:bg-slate-800 text-primary dark:text-white font-bold border-l-4 border-primary shadow-sm' 
                    : 'text-on-surface-variant dark:text-slate-400 hover:bg-surface-container dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{t(item.labelKey)}</span>
                )}
              </Link>
            </motion.div>
          )
        })}

        <div className="mt-4">
          <p className={`text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant dark:text-slate-500 mb-3 ${isCollapsed ? 'hidden' : ''}`}>
            {t('tenant.nav.areas')}
          </p>
          {areasItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${active 
                      ? 'bg-surface-container-lowest dark:bg-slate-800 text-primary dark:text-white font-bold border-l-4 border-primary shadow-sm' 
                      : 'text-on-surface-variant dark:text-slate-400 hover:bg-surface-container dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : ''}`} />
                  {!isCollapsed && (
                    <span className="text-sm truncate">{t(item.labelKey)}</span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
        </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mx-auto mb-2 p-2 rounded-lg hover:bg-surface-container dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronLeft className={`w-4 h-4 text-on-surface-variant transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>

      <div className="mt-auto px-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3 ${isCollapsed ? 'hidden' : ''}`}>
          {t('tenant.sidebar.systemStatus')}
        </p>
        
        {!isCollapsed && (
          <div className="bg-surface-container rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium flex items-center gap-2 text-on-surface-variant">
                <motion.span 
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-500"
                />
                {t('tenant.sidebar.operational')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant">v2.4.1</span>
              <span className="text-[10px] text-on-surface-variant">•</span>
              <span className="text-[10px] text-on-surface-variant">AES-256</span>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant dark:text-slate-400 hover:bg-error-container/10 hover:text-error transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm truncate">{t('common.logout')}</span>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`
          fixed left-0 top-0 h-full bg-surface dark:bg-slate-900 border-r border-outline-variant dark:border-slate-700 z-50
          hidden lg:flex flex-col
          ${sidebarWidth}
          transition-all duration-300 ease-in-out
        `}
      >
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`
                fixed left-0 top-0 h-full bg-surface dark:bg-slate-900 border-r border-outline-variant dark:border-slate-700 z-50
                lg:hidden flex flex-col w-64
              `}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
