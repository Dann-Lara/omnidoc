'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'

interface TenantFiltersProps {
  currentStatus: string
  currentPlan: string
}

export function TenantFilters({ currentStatus, currentPlan }: TenantFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  
  const [status, setStatus] = useState(currentStatus || 'ALL')
  const [plan, setPlan] = useState(currentPlan || 'ALL')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt')

  useEffect(() => {
    const params = new URLSearchParams()
    if (status !== 'ALL') params.set('status', status)
    if (plan !== 'ALL') params.set('plan', plan)
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    
    const queryString = params.toString()
    router.push(`/admin/tenants${queryString ? `?${queryString}` : ''}`)
  }, [status, plan, sortOrder, sortBy])

  return (
    <div className="px-8 py-5 bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-outline uppercase tracking-widest">{t('common.filterBy') || 'Filter By'}:</span>
        
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-primary py-0 cursor-pointer"
        >
          <option value="ALL">{t('common.allStatuses') || 'All Statuses'}</option>
          <option value="ACTIVE">{t('common.active')}</option>
          <option value="TRIALING">{t('common.trialing')}</option>
          <option value="CANCELED">{t('common.canceled') || 'Canceled'}</option>
        </select>
        
        <select 
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-primary py-0 cursor-pointer"
        >
          <option value="ALL">{t('common.allPlans') || 'All Plans'}</option>
          <option value="ENTERPRISE">Enterprise</option>
          <option value="PRO">Pro</option>
          <option value="STARTER">Starter</option>
          <option value="INDIVIDUAL">Individual</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-outline uppercase tracking-widest">{t('common.orderBy') || 'Order By'}:</span>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-primary py-0 cursor-pointer"
        >
          <option value="createdAt">{t('common.createdDate') || 'Created Date'}</option>
          <option value="name">{t('common.name') || 'Name'}</option>
        </select>

        <select 
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-primary py-0 cursor-pointer"
        >
          <option value="asc">{t('common.ascending') || 'Ascending'}</option>
          <option value="desc">{t('common.descending') || 'Descending'}</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-on-surface-variant font-medium">
          {t('common.showingTenants') || 'Showing tenants'}
        </span>
      </div>
    </div>
  )
}