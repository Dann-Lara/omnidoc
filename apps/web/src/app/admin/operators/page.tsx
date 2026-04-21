'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Search, MoreVertical, Edit, Trash2, Mail } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Operator {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  createdAt: Date
  tenantAssignments: Array<{
    id: string
    tenant: { id: string; name: string; slug: string }
  }>
}

export default function OperatorsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useI18n()
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchOperators()
  }, [])

  const fetchOperators = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/operators`, { credentials: 'include' })
      const data = await res.json()
      setOperators(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch operators:', error)
      setOperators([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOperators = (operators || []).filter(
    (op) =>
      op.firstName.toLowerCase().includes(search.toLowerCase()) ||
      op.lastName.toLowerCase().includes(search.toLowerCase()) ||
      op.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeactivate = async (id: string) => {
    if (!confirm(t('admin.operators.confirmDeactivate'))) return
    await fetch(`${API_URL}/admin/operators/${id}`, { method: 'DELETE', credentials: 'include' })
    fetchOperators()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t('admin.nav.operators')}</h1>
          <p className="text-on-surface-variant">{t('admin.operators.description')}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/operators/invitations"
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors"
          >
            <Mail className="w-4 h-4" />
            {t('common.invitations')}
          </a>
          <a
            href="/admin/operators/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('admin.operators.addNew')}
          </a>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t('admin.operators.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant bg-surface dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="bg-surface dark:bg-slate-800 rounded-2xl border border-outline-variant overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                {t('common.name')}
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                {t('common.email')}
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                {t('admin.operators.tenantsAssigned')}
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                {t('common.status')}
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-on-surface-variant">
                {t('admin.operators.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                  {t('common.loading')}
                </td>
              </tr>
            ) : filteredOperators.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                  {t('common.noResults')}
                </td>
              </tr>
            ) : (
              filteredOperators.map((operator) => (
                <tr
                  key={operator.id}
                  className="border-t border-outline-variant dark:border-slate-700"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {operator.firstName} {operator.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {operator.email || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {operator.tenantAssignments.length > 0
                        ? operator.tenantAssignments
                            .map((t) => t.tenant.name)
                            .join(', ')
                        : t('admin.operators.noTenants')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        operator.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {operator.status === 'ACTIVE'
                        ? t('admin.operators.active')
                        : t('admin.operators.inactive')}
</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/operators/${operator.id}`)
                        }
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {operator.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleDeactivate(operator.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20"
                          title={t('admin.operators.deactivate')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}