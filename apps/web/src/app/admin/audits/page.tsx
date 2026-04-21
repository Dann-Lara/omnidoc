'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  User,
  Settings,
  Shield,
  Clock,
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

const mockAuditLogs = [
  { id: 1, timestamp: '2026-04-08 14:32:05', action: 'USER_LOGIN', entity: 'Auth', user: 'superadmin@omnidoc.dev', hash: 'a1b...c3d' },
  { id: 2, timestamp: '2026-04-08 14:28:12', action: 'PATIENT_CREATED', entity: 'Data', user: 'dr.smith@clinic.com', hash: 'e5f...g7h' },
  { id: 3, timestamp: '2026-04-08 14:15:00', action: 'ORG_SETTINGS_UPDATE', entity: 'Config', user: 'operator@omnidoc.dev', hash: 'i9j...k1l' },
  { id: 4, timestamp: '2026-04-08 13:45:00', action: 'SCHEMA_UPDATE', entity: 'Core', user: 'system', hash: 'm3n...o5p' },
  { id: 5, timestamp: '2026-04-08 11:05:44', action: 'KEY_ROTATION', entity: 'Vault', user: 'system', hash: 'q7r...s9t' },
]

const tabs = ['All', 'Auth', 'Data', 'Billing', 'Security']

export default function AdminAuditsPage() {
  const { lang, t } = useI18n()
  const [activeTab, setActiveTab] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 24

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            {t('audits.title')}
          </h2>
          <p className="text-on-surface-variant font-medium">
            {t('audits.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {t('audits.filters')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('audits.export')}
          </motion.button>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
        <input
          type="text"
          placeholder={t('audits.placeholder')}
          className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-primary text-white' 
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl border border-outline-variant dark:border-slate-700 overflow-hidden"
      >
        <div className="grid grid-cols-4 px-8 py-4 bg-surface-container dark:bg-slate-700/50 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          <span>{t('audits.timestamp')}</span>
          <span>{t('audits.action')}</span>
          <span>{t('audits.entity')}</span>
          <span className="text-right">{t('audits.hash')}</span>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {mockAuditLogs.map((log, index) => (
            <motion.div 
              key={log.id}
              variants={fadeInUp}
              className={`grid grid-cols-4 px-8 py-4 items-center ${
                index % 2 === 0 ? 'bg-surface-container-lowest dark:bg-slate-800' : 'bg-transparent'
              } hover:bg-surface-container dark:hover:bg-slate-700/50 transition-colors cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-on-surface-variant" />
                <span className="text-sm font-mono">{log.timestamp}</span>
              </div>
              <span className="text-sm font-semibold">{log.action}</span>
              <span className="text-sm text-on-surface-variant">{log.entity}</span>
              <span className="text-xs font-mono text-right text-on-surface-variant">
                {log.hash}
              </span>
            </motion.div>
          ))}
        </div>
        
        <div className="p-4 flex items-center justify-between border-t border-outline-variant">
          <span className="text-sm text-on-surface-variant">
            {t('audits.page')} {currentPage} {t('audits.of')} {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
