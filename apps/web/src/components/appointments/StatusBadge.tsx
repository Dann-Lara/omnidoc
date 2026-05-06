'use client'

import { useI18n } from '@/lib/i18n'
import { CheckCircle, Clock, XCircle, Play, CalendarCheck } from 'lucide-react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string; icon: typeof CheckCircle }> = {
  SCHEDULED: {
    label: 'appointments.directory.scheduled',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    dotColor: 'bg-green-500',
    icon: CheckCircle,
  },
  CONFIRMED: {
    label: 'appointments.directory.confirmed',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
    icon: CalendarCheck,
  },
  IN_PROGRESS: {
    label: 'appointments.directory.inProgress',
    bgColor: 'bg-tertiary-container/10',
    textColor: 'text-tertiary-container',
    dotColor: 'bg-tertiary-container',
    icon: Play,
  },
  COMPLETED: {
    label: 'appointments.directory.completed',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    dotColor: 'bg-blue-500',
    icon: CheckCircle,
  },
  CANCELED: {
    label: 'appointments.directory.cancelled',
    bgColor: 'bg-error-container dark:bg-red-900/30',
    textColor: 'text-error dark:text-red-400',
    dotColor: 'bg-error',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'appointments.directory.noShow',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-400',
    dotColor: 'bg-slate-500',
    icon: XCircle,
  },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useI18n()
  const config = statusConfig[status] || statusConfig.SCHEDULED
  const Icon = config.icon
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${config.bgColor} ${config.textColor} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
      {t(config.label)}
    </span>
  )
}

export function getStatusOptions() {
  return [
    { value: 'SCHEDULED', key: 'appointments.directory.scheduled' },
    { value: 'CONFIRMED', key: 'appointments.directory.confirmed' },
    { value: 'IN_PROGRESS', key: 'appointments.directory.inProgress' },
    { value: 'COMPLETED', key: 'appointments.directory.completed' },
    { value: 'CANCELED', key: 'appointments.directory.cancelled' },
    { value: 'NO_SHOW', key: 'appointments.directory.noShow' },
  ]
}
