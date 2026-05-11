'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { getStoredOrgId } from '@/lib/auth'
import {
  ChevronLeft,
  Loader2,
  Plus,
  Stethoscope,
  Heart,
  Calendar,
  Palette,
  Badge,
  FlaskConical,
  Headphones,
  User,
  Shield,
  Clock,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const ICON_MAP = {
  stethoscope: Stethoscope,
  heart: Heart,
  calendar: Calendar,
  palette: Palette,
  badge: Badge,
  vaccines: FlaskConical,
  support: Headphones,
  person: User,
}

interface UserTypeConfig {
  type: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  icon: string
  dashboard: string
  permissions: string[]
  canHaveSpecialties: boolean
}

export default function UserTypesListPage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = (params?.slug as string) || ''
  const orgId = getStoredOrgId() || ''

  const [userTypes, setUserTypes] = useState<Record<string, UserTypeConfig>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!orgId) {
      setIsLoading(false)
      return
    }

    fetch(`${API_URL}/team/user-types`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUserTypes(data || {}))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [orgId])

  const getIcon = (iconId: string) => {
    const Icon = ICON_MAP[iconId]
    return Icon || Stethoscope
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasTypes = Object.keys(userTypes).length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}/profile`}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {t('userTypes.title')}
            </h1>
            <p className="text-on-surface-variant">
              {t('userTypes.subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/${slug}/profile/user-types/new`)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('userTypes.newType')}
        </button>
      </div>

      {!hasTypes ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-xl">
          <Shield className="w-12 h-12 mx-auto text-on-surface-variant/40 mb-4" />
          <p className="text-on-surface-variant font-medium mb-1">
            {t('userTypes.noConfigured')}
          </p>
          <p className="text-on-surface-variant/60 text-sm">
            {t('userTypes.noConfiguredDesc')}
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {t('userTypes.systemRole')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  {t('userTypes.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {Object.entries(userTypes).map(([key, config]) => {
                const IconComponent = getIcon(config.icon)
                return (
                  <tr
                    key={key}
                    className="hover:bg-surface-container transition-colors cursor-pointer"
                    onClick={() => router.push(`/${slug}/profile/user-types/${key}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                          <IconComponent className="w-5 h-5 text-on-primary-fixed-variant" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">
                            {lang === 'en' ? config.nameEn : config.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-xs text-on-surface-variant">
                        {config.type}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-container p-6 rounded-xl relative overflow-hidden group">
          <Shield className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-primary mb-2">
            {t('userTypes.permissionInheritance')}
          </h4>
          <p className="text-sm text-on-surface-variant">
            {t('userTypes.permissionInheritanceDesc')}
          </p>
        </div>
        <div className="bg-surface-container p-6 rounded-xl relative overflow-hidden group">
          <Clock className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-primary mb-2">
            {t('userTypes.auditTrail')}
          </h4>
          <p className="text-sm text-on-surface-variant">
            {t('userTypes.auditTrailDesc')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
