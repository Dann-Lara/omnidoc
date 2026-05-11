'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { PERMISSION_MODULES } from '@/lib/permissions/modules'
import {
  ChevronLeft,
  Loader2,
  Save,
  Stethoscope,
  Heart,
  Calendar,
  Palette,
  Badge,
  FlaskConical,
  Headphones,
  Shield,
  User,
  AlertTriangle,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const AVAILABLE_ICONS = [
  { id: 'stethoscope', icon: Stethoscope, label: 'Médico' },
  { id: 'heart', icon: Heart, label: 'Enfermería' },
  { id: 'calendar', icon: Calendar, label: 'Recepción' },
  { id: 'palette', icon: Palette, label: 'Administrativo' },
  { id: 'badge', icon: Badge, label: 'Badge' },
  { id: 'vaccines', icon: FlaskConical, label: 'Vacunas' },
  { id: 'support', icon: Headphones, label: 'Soporte' },
  { id: 'person', icon: User, label: 'Usuario' },
]

const ALL_ACTIONS = [...new Set(PERMISSION_MODULES.flatMap(m => m.actions))]

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

const emptyFormData: UserTypeConfig = {
  type: '',
  name: '',
  nameEn: '',
  description: '',
  descriptionEn: '',
  icon: 'stethoscope',
  dashboard: '/dashboard',
  permissions: [],
  canHaveSpecialties: false,
}

interface UserTypeFormProps {
  initialData?: UserTypeConfig
  typeKey?: string
}

export default function UserTypeForm({ initialData, typeKey }: UserTypeFormProps) {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const slug = (params?.slug as string) || ''
  const isNew = !initialData
  const [formData, setFormData] = useState<UserTypeConfig>(initialData || emptyFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const togglePermission = (permission: string) => {
    const current = formData.permissions || []
    const newPermissions = current.includes(permission)
      ? current.filter((p) => p !== permission)
      : [...current, permission]
    setFormData({ ...formData, permissions: newPermissions })
  }

  const handleSave = async () => {
    if (!formData.type || !formData.name) {
      setMessage({ type: 'error', text: t('userTypes.nameRequired') })
      return
    }

    const key = isNew ? formData.type.toLowerCase().replace(/\s+/g, '-') : typeKey!

    setIsSaving(true)
    setMessage(null)

    try {
      const getRes = await fetch(`${API_URL}/team/user-types`, {
        credentials: 'include',
      })
      const existing: Record<string, UserTypeConfig> = await getRes.json()
      const updated = { ...existing, [key]: formData }

      const putRes = await fetch(`${API_URL}/team/user-types`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updated),
      })

      if (!putRes.ok) {
        setMessage({ type: 'error', text: t('userTypes.errorSaving') })
        setIsSaving(false)
        return
      }

      router.push(`/${slug}/profile/user-types`)
    } catch {
      setMessage({ type: 'error', text: t('userTypes.errorSaving') })
    } finally {
      setIsSaving(false)
    }
  }

  const getIconComponent = (iconId: string) => {
    const found = AVAILABLE_ICONS.find((i) => i.id === iconId)
    return found?.icon || Stethoscope
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/${slug}/profile/user-types`)}
          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {isNew ? t('userTypes.newType') : formData.name}
          </h1>
          <p className="text-on-surface-variant">
            {isNew ? t('userTypes.subtitle') : t('userTypes.roleDetails')}
          </p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl font-medium flex items-center gap-2 ${
            message.type === 'error'
              ? 'bg-error-container text-error'
              : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {message.text}
        </motion.div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl p-8 border-l-4 border-primary shadow-sm">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t('userTypes.nameEs')}
              </label>
              <input
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('userTypes.placeholderEs')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t('userTypes.nameEn')}
              </label>
              <input
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium"
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder={t('userTypes.placeholderEn')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t('userTypes.uniqueKey')}
              </label>
              <input
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder={t('userTypes.uniqueKeyPlaceholder')}
                disabled={!isNew}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t('userTypes.icon')}
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ICONS.map((iconOption) => {
                  const IconComp = iconOption.icon
                  return (
                    <button
                      key={iconOption.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconOption.id })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        formData.icon === iconOption.id
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t('userTypes.description')}
            </label>
            <textarea
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 text-on-surface text-sm"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('userTypes.descriptionPlaceholder')}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="canHaveSpecialties"
              checked={formData.canHaveSpecialties}
              onChange={(e) => setFormData({ ...formData, canHaveSpecialties: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus:ring-primary/20"
            />
            <label htmlFor="canHaveSpecialties" className="text-sm text-on-surface">
              {t('userTypes.canHaveSpecialties')}
            </label>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('userTypes.permissionMatrix')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                    <th className="pb-3 pl-4">{t('userTypes.module')}</th>
                    {ALL_ACTIONS.map(action => (
                      <th key={action} className="pb-3 text-center capitalize">{action}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {PERMISSION_MODULES.map((module) => (
                    <tr key={module.key} className="bg-surface-container-low hover:bg-surface-container transition-colors">
                      <td className="py-3 pl-4 font-bold text-xs text-on-surface whitespace-nowrap">
                        {lang === 'en' ? module.labelEn : module.label}
                      </td>
                      {ALL_ACTIONS.map(action => (
                        <td key={action} className="py-3 text-center">
                          {module.actions.includes(action) && (
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(`${module.key}:${action}`)}
                              onChange={() => togglePermission(`${module.key}:${action}`)}
                              className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-outline-variant/30 bg-white"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {t('userTypes.save')}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${slug}/profile/user-types`)}
              className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-bold text-sm hover:bg-surface-container transition-all"
            >
              {t('userTypes.cancel')}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
