'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { getCookie } from '@/lib/cookies'
import type { Variants } from 'framer-motion'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Shield,
  Calendar,
  Clock,
  CreditCard,
  Settings,
  Mail,
  X
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
}

export default function TenantDashboardPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const { lang, t } = useI18n()
  const orgSlug = getCookie('sb-org-slug') || slug
  const emailSent = searchParams.get('emailSent') === 'true'
  
  const [userData, setUserData] = React.useState<any>(null)
  const [orgName, setOrgName] = React.useState<string>(slug)
  const [showEmailToast, setShowEmailToast] = React.useState(false)

  React.useEffect(() => {
    if (emailSent) {
      setShowEmailToast(true)
      // Auto-hide after 10 seconds
      setTimeout(() => setShowEmailToast(false), 10000)
    }
  }, [emailSent])

  React.useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/me`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.user) {
        setUserData(data.user)
        setOrgName(data.organization?.name || slug)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const fullName = userData?.firstName && userData?.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.email?.split('@')[0] || 'User'

  const stats = [
    { 
      label: t('tenant.dashboard.activePatients'), 
      value: '24', 
      change: '+5%',
      icon: Users,
      color: 'text-primary'
    },
    { 
      label: t('tenant.dashboard.todaysAppointments'), 
      value: '12', 
      change: '+2',
      icon: Calendar,
      color: 'text-emerald-500'
    },
    { 
      label: t('tenant.dashboard.thisWeek'), 
      value: '87', 
      change: '+15%',
      icon: Activity,
      color: 'text-blue-500'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Email Confirmation Toast */}
      {showEmailToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary-container border border-primary/20 rounded-xl p-4 flex items-start gap-3"
        >
          <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-on-primary-container">
              {t('tenant.dashboard.confirmationEmailSent')}
            </p>
          </div>
          <button
            onClick={() => setShowEmailToast(false)}
            className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-on-primary-container" />
          </button>
        </motion.div>
      )}

      {/* Profile Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            {t('tenant.dashboard.clinicOwnerDashboard')}
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-primary">
            {fullName}
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">
            {t('tenant.dashboard.chiefOfOperations').replace('{orgName}', orgName)}
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
          <span className="text-sm font-medium">
            {t('tenant.dashboard.operational')}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
              className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 border border-outline-variant dark:border-slate-700 relative overflow-hidden group"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className={`w-12 h-12 rounded-xl bg-surface-container dark:bg-slate-700 flex items-center justify-center mb-4`}
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </motion.div>
              <p className="text-sm text-on-surface-variant mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold">{stat.value}</p>
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full"
                >
                  {stat.change}
                </motion.span>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-container"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
              />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Two Column Layout */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Subscription Card */}
        <motion.section
          variants={fadeInUp}
          className="bg-surface-container rounded-xl p-6 border border-outline-variant dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('tenant.dashboard.subscription')}
            </h2>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase">
              Enterprise Plus
            </span>
            <span className="text-2xl font-bold text-primary">$2,400</span>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            {t('tenant.dashboard.monthlyBilling')}
          </p>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '76%' }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">
            {t('tenant.dashboard.licenseUsage').replace('{used}', '76').replace('{total}', '100')}
          </p>
        </motion.section>

        {/* Security Vault */}
        <motion.section
          variants={fadeInUp}
          className="bg-primary-container text-white rounded-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6" />
              <h2 className="text-lg font-bold">
                {t('tenant.dashboard.securityVault')}
              </h2>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded border border-green-500/30 uppercase">
                {t('tenant.dashboard.operational')}
              </span>
            </div>
            <p className="text-sm text-primary-fixed-dim mb-4">
              {t('tenant.dashboard.phEncrypted')}
            </p>
            <div className="flex gap-3">
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-all">
                {t('tenant.dashboard.emergencyLock')}
              </button>
              <button className="bg-transparent border border-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                {t('tenant.dashboard.rotateKeys')}
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Quick Actions */}
      <motion.section
        variants={fadeInUp}
        className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 border border-outline-variant dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {t('tenant.dashboard.quickActions')}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: t('tenant.dashboard.schedule') },
            { icon: Users, label: t('tenant.dashboard.addPatient') },
            { icon: Activity, label: t('tenant.dashboard.viewReports') },
            { icon: Settings, label: t('tenant.dashboard.settings') },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              <action.icon className="w-6 h-6 text-primary" />
              <span className="text-xs font-medium text-on-surface-variant">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Footer Metadata */}
      <footer className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              {t('tenant.dashboard.tenantId')}
            </span>
            <span className="text-sm font-medium text-on-surface-variant">
              {orgName.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              {t('tenant.dashboard.region')}
            </span>
            <span className="text-sm font-medium text-on-surface-variant">US-EAST-1 (Encrypted)</span>
          </div>
        </div>
        <div className="text-[10px] text-outline font-medium flex items-center gap-4">
          <span>© 2024 OMNIDOC SAAS</span>
          <span className="w-1 h-1 bg-outline rounded-full"></span>
          <span>v2.4.0</span>
        </div>
      </footer>
    </motion.div>
  )
}
