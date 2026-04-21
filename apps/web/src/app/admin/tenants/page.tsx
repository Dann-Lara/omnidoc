'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Download, Plus } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { TenantKPIs } from './components/TenantKPIs'
import { TenantTable } from './components/TenantTable'
import { TenantFilters } from './components/TenantFilters'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Tenant {
  id: string
  name: string
  slug: string
  planName: string | null
  mrr: number
  collaboratorsCount: number
  status: string
  createdAt: Date
  owner?: {
    id: string
    name: string
    avatar: string | null
  } | null
}

interface TenantStats {
  totalTenants: number
  tenantsGrowth: number
  totalMRR: number
  mrrGrowth: number
  activeUsers: number
  churnRiskCount: number
}

interface TenantsResponse {
  data: Tenant[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function TenantsPage() {
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [stats, setStats] = useState<TenantStats | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const status = searchParams.get('status') || ''
  const plan = searchParams.get('plan') || ''

  useEffect(() => {
    fetchData()
  }, [currentPage, status, plan])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        fetch(`${API_URL}/admin/tenants/stats`, { credentials: 'include' }),
        fetch(
          `${API_URL}/admin/tenants?page=${currentPage}&limit=10${status ? `&status=${status}` : ''}${plan ? `&plan=${plan}` : ''}`,
          { credentials: 'include' }
        ),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (tenantsRes.ok) {
        const tenantsData: TenantsResponse = await tenantsRes.json()
        setTenants(tenantsData.data || [])
        setTotal(tenantsData.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="label-sm text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
            {t('admin.nav.tenants')}
          </span>
          <h1 className="text-4xl font-extrabold text-primary tracking-tighter mt-1">
            {t('admin.nav.tenants')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 rounded-full bg-surface-container-low text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('admin.dashboard.exportReport') || 'Export Report'}
          </button>
          <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-semibold text-sm shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('admin.dashboard.createNewClinic') || 'Create New Clinic'}
          </button>
        </div>
      </motion.div>

      {/* KPIs */}
      {stats && <TenantKPIs stats={stats} />}

      {/* Filters & Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
        <TenantFilters currentStatus={status} currentPlan={plan} />
        
        {isLoading ? (
          <div className="px-8 py-12 text-center">
            <div className="animate-pulse text-on-surface-variant">Loading...</div>
          </div>
        ) : (
          <>
            <TenantTable tenants={tenants} />
            
            {/* Pagination Footer */}
            <div className="px-8 py-4 border-t border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  className="p-2 rounded hover:bg-surface-container transition-colors disabled:opacity-30"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                {[...Array(Math.min(3, totalPages))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded text-xs font-bold ${
                      currentPage === i + 1
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-container'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 3 && (
                  <span className="px-2 text-outline">...</span>
                )}
                <button
                  className="p-2 rounded hover:bg-surface-container transition-colors"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
              <div className="text-xs font-bold text-outline uppercase tracking-widest">
                Total tenants: {total}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}