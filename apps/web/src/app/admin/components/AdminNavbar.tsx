'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useAuth, clearAuthSession } from '@/lib/auth'
import { ThemeToggle } from '@/components/ThemeToggle'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
import {
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'

interface AdminNavbarProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
  sidebarCollapsed?: boolean
}

export function AdminNavbar({ onMenuClick, isSidebarOpen, sidebarCollapsed = false }: AdminNavbarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { lang, t, toggleLang } = useI18n()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const userInitials = user?.first_name && user?.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  const displayAvatar = user?.avatar || null

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      logout()
      document.cookie = 'sb-access-token=; path=/; max-age=0'
      document.cookie = 'sb-refresh-token=; path=/; max-age=0'
      router.push('/login')
    }
  }

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64'
  const sidebarMargin = sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
  const sidebarLeft = sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        fixed top-0 right-0 h-16 flex items-center justify-between px-8 z-40
        bg-surface-container-lowest dark:bg-slate-900 backdrop-blur-md border-b border-outline-variant dark:border-slate-700
        transition-all duration-300
        ${isSidebarOpen ? 'left-0' : sidebarLeft}
      `}
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.div
          initial={false}
          animate={{ 
            width: searchFocused ? 320 : 280,
            backgroundColor: searchFocused ? 'var(--color-surface-container)' : 'var(--color-surface-container-low)'
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border border-transparent focus-within:border-primary bg-slate-100 dark:bg-slate-800"
        >
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t('admin.nav.search') || 'Search...'}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent border-none outline-none text-sm w-full text-on-surface placeholder:text-on-surface-variant"
          />
          <motion.div
            initial={false}
            animate={{ opacity: searchFocused ? 1 : 0 }}
            className="text-[10px] text-on-surface-variant font-mono"
          >
            ⌘K
          </motion.div>
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLang}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {lang === 'en' ? 'ES' : 'EN'}
        </motion.button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        <ThemeToggle />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative text-on-surface dark:text-on-surface-variant"
        >
          <Bell className="w-5 h-5" />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
          />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-on-surface dark:text-on-surface-variant"
        >
          <HelpCircle className="w-5 h-5" />
        </motion.button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="relative" ref={userMenuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitials
              )}
            </motion.div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-primary">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.email?.split('@')[0] || 'User'
                }
              </p>
              <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wide">
                {user?.role || 'Super Admin'}
              </p>
            </div>
            <motion.div
              animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{user?.role}</p>
                  </div>
                  <div className="p-2">
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        router.push('/admin/profile')
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {t('admin.nav.profile')}
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        router.push('/admin/settings')
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {t('admin.nav.settings')}
                    </motion.button>
                  </div>
                  <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('common.logout')}
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}
