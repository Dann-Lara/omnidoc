'use client'

import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { 
  Building2, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Download,
  Verified
} from 'lucide-react'
import type { Variants } from 'framer-motion'

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

export default function AdminDashboard() {
  const { t } = useI18n()

  const stats = [
    { 
      label: t('admin.dashboard.activeTenants'), 
      value: '127', 
      change: '+12%',
      icon: Building2,
      color: 'text-primary'
    },
    { 
      label: t('admin.dashboard.totalUsers'), 
      value: '2,847', 
      change: '+8%',
      icon: Users,
      color: 'text-emerald-500'
    },
    { 
      label: t('admin.dashboard.systemHealth'), 
      value: '99.9%', 
      change: '+0.1%',
      icon: Activity,
      color: 'text-blue-500'
    },
    { 
      label: t('admin.dashboard.revenueMRR'), 
      value: '$48.2k', 
      change: '+23%',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
  ]

  const recentActivity = [
    { 
      action: t('admin.dashboard.newTenantRegistered'),
      tenant: 'Dr. Martinez Clinic',
      time: t('admin.dashboard.twoMinutesAgo')
    },
    { 
      action: t('admin.dashboard.operatorPromoted'),
      tenant: 'Sarah Johnson → Senior',
      time: t('admin.dashboard.fifteenMinutesAgo')
    },
    { 
      action: t('admin.dashboard.systemBackupCompleted'),
      tenant: 'Automated',
      time: t('admin.dashboard.oneHourAgo')
    },
    { 
      action: t('admin.dashboard.securityAuditPassed'),
      tenant: 'All systems',
      time: t('admin.dashboard.threeHoursAgo')
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            {t('admin.dashboard.controlCenter')}
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-primary">
            {t('admin.dashboard.dashboard')}
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">
            {t('admin.dashboard.monitorPlatform')}
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
          <span className="text-sm font-medium">
            {t('admin.dashboard.allSystemsOperational')}
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
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
                className={`w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4`}
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

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.section
          variants={fadeInUp}
          className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 border border-outline-variant dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t('admin.dashboard.recentActivity')}
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-surface-container dark:bg-slate-700/50 hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.action}</p>
                  <p className="text-sm text-on-surface-variant">{activity.tenant}</p>
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={fadeInUp}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-2">
                {t('admin.dashboard.developmentMode')}
              </h2>
              <p className="text-sm text-on-surface dark:text-on-surface-variant">
                {t('admin.dashboard.developmentModeDesc')}
              </p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </motion.div>
  )
}
