'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCog, 
  Settings, 
  Shield, 
  LogOut,
  ChevronLeft,
  Activity,
  Gauge,
  Calendar,
  Bell,
  Stethoscope
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { getStoredUser, clearAuthSession, useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

type NavRole = 'SUPERADMIN' | 'OPERATOR'

interface NavItem {
  href: string
  icon: any
  labelKey: string
  roles?: NavRole[]
}

const navItems: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, labelKey: 'admin.nav.dashboard', roles: ['SUPERADMIN', 'OPERATOR'] },
  { href: '/admin/tenants', icon: Building2, labelKey: 'admin.nav.tenants', roles: ['SUPERADMIN', 'OPERATOR'] },
  { href: '/admin/parameters/specialties', icon: Stethoscope, labelKey: 'admin.nav.specialties', roles: ['SUPERADMIN', 'OPERATOR'] },
  { href: '/admin/operators', icon: UserCog, labelKey: 'admin.nav.operators', roles: ['SUPERADMIN'] },
  { href: '/admin/config', icon: Shield, labelKey: 'admin.nav.platformConfig', roles: ['SUPERADMIN'] },
]

const bottomNavItems: NavItem[] = [
  { href: '/admin/settings', icon: Settings, labelKey: 'admin.nav.settings', roles: ['SUPERADMIN'] },
]

export function AdminSidebar({ isOpen, onClose, isCollapsed: externalCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = externalCollapsed ?? internalCollapsed
  const setIsCollapsed = onToggleCollapse ?? setInternalCollapsed
  
  const pathname = usePathname()
  const router = useRouter()
  const { lang, t } = useI18n()
  const { user } = useAuth()

  const userRole = user?.role as NavRole | null

  const filteredNavItems = useMemo(() => {
    if (!userRole) return navItems.filter(item => item.roles?.includes('SUPERADMIN'))
    return navItems.filter(item => !item.roles || item.roles.includes(userRole))
  }, [userRole])

  const filteredBottomNavItems = useMemo(() => {
    if (!userRole) return bottomNavItems.filter(item => item.roles?.includes('SUPERADMIN'))
    return bottomNavItems.filter(item => !item.roles || item.roles.includes(userRole))
  }, [userRole])

  const isActive = (href: string) => {
    if (href === '/admin/dashboard' || href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard'
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
      {/* Logo Section */}
      <div className={`px-6 mb-8 flex items-center ${isCollapsed ? 'justify-center px-3' : ''}`}>
        <Link href="/admin" className="flex items-center gap-2">
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant dark:text-on-surface-variant">Health System</p>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant dark:text-on-surface-variant mb-3 ${isCollapsed ? 'hidden' : ''}`}>
          {t('admin.sidebar.realTimeOperations')}
        </p>
        
        {filteredNavItems.map((item) => {
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
                    ? 'bg-white dark:bg-slate-800 text-primary dark:text-white font-bold border-l-4 border-primary shadow-sm' 
                    : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{t(item.labelKey)}</span>
                )}
                <AnimatePresence>
                  {active && !isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="ml-auto"
                    >
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mx-auto mb-2 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronLeft className={`w-4 h-4 text-on-surface-variant transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* System Status */}
      <div className="mt-auto px-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant dark:text-on-surface-variant mb-3 ${isCollapsed ? 'hidden' : ''}`}>
          {t('admin.sidebar.systemStatus')}
        </p>
        
        {!isCollapsed && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium flex items-center gap-2 text-on-surface-variant dark:text-slate-300">
                <motion.span 
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-500"
                />
                {t('admin.sidebar.operational')}
              </span>
            </div>
            <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant mt-2">
              {t('admin.sidebar.uptimeValue').replace('{value}', '98.4%')}
            </p>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center mb-4">
            <motion.span 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-emerald-500"
            />
          </div>
        )}

        <div className="space-y-1">
          {filteredBottomNavItems.map((item) => {
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
                      ? 'bg-white dark:bg-slate-800 text-primary dark:text-white font-bold' 
                      : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="text-sm">{t(item.labelKey)}</span>}
                </Link>
              </motion.div>
            )
          })}
          
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm">{t('common.logout')}</span>}
          </motion.button>
        </div>

        {!isCollapsed && (
          <div className="mt-6 px-4 flex items-center justify-between opacity-50">
            <span className="text-[10px] font-bold tracking-tighter">OMNIDOC</span>
            <span className="text-[10px] font-medium">v2.4.0</span>
          </div>
        )}
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
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-surface dark:bg-slate-900 border-r border-outline-variant dark:border-slate-700 z-50 lg:hidden overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
