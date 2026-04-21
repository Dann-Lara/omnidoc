'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Check, Save } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Tenant {
  id: string
  name: string
  slug: string
}

interface Operator {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  tenantAssignments: Array<{ id: string; tenant: { id: string; name: string; slug: string } }>
}

export default function OperatorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useI18n()
  const [operator, setOperator] = useState<Operator | null>(null)
  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loadingTenants, setLoadingTenants] = useState(true)
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const operatorId = params.id as string

  useEffect(() => {
    if (operatorId) {
      fetchOperator()
      fetchTenants()
    }
  }, [operatorId])

  const fetchOperator = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/operators/${operatorId}`, {
        credentials: 'include',
      })
      const data = await res.json()
      setOperator(data)
      setSelectedTenants(data.tenantAssignments?.map((t: any) => t.tenant.id) || [])
    } catch (err) {
      console.error('Failed to fetch operator:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTenants = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/tenants?limit=1000`, {
        credentials: 'include',
      })
      const data = await res.json()
      setTenants(data.data || [])
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
    } finally {
      setLoadingTenants(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/admin/operators/${operatorId}/tenants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantIds: selectedTenants }),
      })

      if (!res.ok) throw new Error('Failed to update')

      router.push('/admin/operators')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleTenant = (tenantId: string) => {
    setSelectedTenants((prev) =>
      prev.includes(tenantId)
        ? prev.filter((id) => id !== tenantId)
        : [...prev, tenantId]
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-2xl"
    >
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {operator?.firstName} {operator?.lastName}
        </h1>
        <p className="text-on-surface-variant">{operator?.email}</p>
        <span
          className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-medium ${
            operator?.status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
          }`}
        >
          {operator?.status === 'ACTIVE'
            ? t('admin.operators.active')
            : t('admin.operators.inactive')}
        </span>
      </div>

      <div className="bg-surface dark:bg-slate-800 rounded-2xl border border-outline-variant p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t('admin.operators.editTenants')}
        </h2>

        {loadingTenants ? (
          <p className="text-on-surface-variant">{t('common.loading')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {tenants.map((tenant) => (
              <label
                key={tenant.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTenants.includes(tenant.id)
                    ? 'bg-primary/10 border border-primary'
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTenants.includes(tenant.id)}
                  onChange={() => toggleTenant(tenant.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedTenants.includes(tenant.id)
                      ? 'bg-primary border-primary'
                      : 'border-slate-300 dark:border-slate-500'
                  }`}
                >
                  {selectedTenants.includes(tenant.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">{tenant.name}</span>
              </label>
            ))}
          </div>
        )}

        {tenants.length === 0 && !loadingTenants && (
          <p className="text-on-surface-variant">{t('common.noResults')}</p>
        )}
      </div>

      {error && (
        <p className="mt-4 text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        <Save className="w-4 h-4" />
        {saving ? t('common.loading') : t('common.save')}
      </button>
    </motion.div>
  )
}