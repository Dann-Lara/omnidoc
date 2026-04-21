'use client'

import Link from 'next/link'
import { Eye, Ban, CheckCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

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

interface TenantTableProps {
  tenants: Tenant[]
}

export function TenantTable({ tenants }: TenantTableProps) {
  const { t } = useI18n()
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {t('common.active')}
          </span>
        )
      case 'TRIALING':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary-container">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            {t('common.trialing') || 'Trialing'}
          </span>
        )
      case 'CANCELED':
      case 'SUSPENDED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-error">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            {t('common.suspended') || 'Suspended'}
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-outline">
            <span className="w-2 h-2 rounded-full bg-outline"></span>
            {status}
          </span>
        )
    }
  }

  const getPlanBadge = (plan: string | null) => {
    const planStyles: Record<string, string> = {
      ENTERPRISE: 'bg-primary-fixed text-on-primary-fixed',
      PRO: 'bg-surface-container-highest text-on-surface-variant',
      STARTER: 'bg-surface-container-high text-on-surface-variant',
      INDIVIDUAL: 'bg-surface-container text-on-surface-variant',
    }
    const style = planStyles[plan || ''] || 'bg-surface-container text-on-surface-variant'
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${style}`}>
        {plan || 'Free'}
      </span>
    )
  }

  const getUserProgress = (count: number, max: number = 1240) => {
    const percentage = Math.min((count / max) * 100, 100)
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{count}</span>
        <div className="w-12 h-1 bg-surface-container-high rounded-full overflow-hidden">
          <div className="bg-primary rounded-full" style={{ width: `${percentage}%`, height: '100%' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-lowest border-b border-surface-container">
            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-outline">Clinic Name</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-outline">Subscription Plan</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-outline">MRR</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-outline">Collaborators</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-outline">Status</th>
            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-outline text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {tenants.map((tenant, index) => (
            <tr 
              key={tenant.id} 
              className={`hover:bg-surface-container-low transition-colors group ${index % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}
            >
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  {tenant.owner?.avatar ? (
                    <img 
                      src={tenant.owner.avatar} 
                      alt={tenant.owner.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {tenant.owner?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || tenant.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-on-surface">{tenant.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{tenant.owner?.name || 'Sin owner'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                {getPlanBadge(tenant.planName)}
              </td>
              <td className="px-6 py-5 font-semibold text-sm">
                ${tenant.mrr.toLocaleString()}
              </td>
              <td className="px-6 py-5">
                {getUserProgress(tenant.collaboratorsCount)}
              </td>
              <td className="px-6 py-5">
                {getStatusBadge(tenant.status)}
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link 
                    href={`/admin/tenants/${tenant.id}`}
                    className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" 
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  {tenant.status === 'ACTIVE' ? (
                    <button 
                      className="p-2 text-error hover:bg-error/5 rounded-lg transition-colors" 
                      title="Block Tenant"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                      title="Activate Tenant"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {tenants.length === 0 && (
            <tr>
              <td colSpan={6} className="px-8 py-12 text-center text-on-surface-variant">
                No tenants found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}