'use client'

import { motion } from 'framer-motion'

interface TenantStats {
  totalTenants: number
  tenantsGrowth: number
  totalMRR: number
  mrrGrowth: number
  activeUsers: number
  churnRiskCount: number
}

interface TenantKPIsProps {
  stats: TenantStats
}

export function TenantKPIs({ stats }: TenantKPIsProps) {
  const kpis = [
    {
      title: 'Total Tenants',
      value: stats.totalTenants.toLocaleString(),
      growth: `+${stats.tenantsGrowth}%`,
      growthPositive: true,
      iconName: 'groups',
    },
    {
      title: 'Monthly Recurring Revenue',
      value: `$${(stats.totalMRR / 1000).toFixed(1)}k`,
      growth: `+${stats.mrrGrowth}%`,
      growthPositive: true,
      iconName: 'payments',
    },
    {
      title: 'Total Active Users',
      value: (stats.activeUsers / 1000).toFixed(1) + 'k',
      badge: 'Active',
      iconName: 'person_play',
    },
    {
      title: 'Churn Risk Portfolio',
      value: stats.churnRiskCount,
      subtitle: 'tenants',
      risk: 'high',
      iconName: 'warning',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative col-span-1 bg-surface-container-lowest p-6 rounded-xl
            ${kpi.risk === 'high' ? 'border border-error/10' : 'border-l-4 border-primary'}
          `}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: 'FILL 1' }}>
              {kpi.iconName}
            </span>
            {kpi.growth && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                kpi.growthPositive ? 'text-green-600 bg-green-50' : 'text-error bg-error-container'
              }`}>
                {kpi.growth}
              </span>
            )}
            {kpi.badge && (
              <span className="text-xs font-bold text-primary-container bg-primary-fixed px-2 py-0.5 rounded">
                {kpi.badge}
              </span>
            )}
            {kpi.risk === 'high' && (
              <span className="text-xs font-bold text-error bg-error-container px-2 py-0.5 rounded">
                High Risk
              </span>
            )}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">
            {kpi.title}
          </p>
          <p className="text-3xl font-extrabold tracking-tighter text-on-surface">
            {kpi.value}
            {kpi.subtitle && (
              <span className="text-sm font-medium text-on-surface-variant ml-1">
                {kpi.subtitle}
              </span>
            )}
          </p>
        </motion.div>
      ))}
    </div>
  )
}