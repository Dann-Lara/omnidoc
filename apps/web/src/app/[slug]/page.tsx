'use client'

import { useParams } from 'next/navigation'

export default function TenantDashboardPage() {
  const params = useParams()
  const slug = params.slug as string

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Welcome to {slug}</h1>
        <p className="text-on-surface-variant mt-2">
          Your clinic dashboard is being set up. More features coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <h3 className="font-semibold text-on-surface mb-2">Appointments</h3>
          <p className="text-sm text-on-surface-variant">Manage your appointments</p>
        </div>
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <h3 className="font-semibold text-on-surface mb-2">Patients</h3>
          <p className="text-sm text-on-surface-variant">View and manage patient records</p>
        </div>
        <div className="bg-surface-container rounded-lg p-6 border border-outline-variant">
          <h3 className="font-semibold text-on-surface mb-2">Settings</h3>
          <p className="text-sm text-on-surface-variant">Configure your clinic</p>
        </div>
      </div>
    </div>
  )
}
