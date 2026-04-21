'use client'

import { useParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function TenantDashboardPage() {
  const params = useParams()
  const slug = params.slug as string
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">{t('tenant.dashboard.welcome')} {slug}</h1>
        <p className="text-on-surface-variant mt-2">
          {t('tenant.dashboard.yourDashboard')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <h3 className="font-semibold text-on-surface mb-2">{t('nav.appointments')}</h3>
          <p className="text-sm text-on-surface-variant">{t('nav.appointments')}</p>
        </div>
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <h3 className="font-semibold text-on-surface mb-2">{t('nav.patients')}</h3>
          <p className="text-sm text-on-surface-variant">{t('nav.patients')}</p>
        </div>
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <h3 className="font-semibold text-on-surface mb-2">{t('nav.settings')}</h3>
          <p className="text-sm text-on-surface-variant">{t('nav.settings')}</p>
        </div>
      </div>
    </div>
  )
}
