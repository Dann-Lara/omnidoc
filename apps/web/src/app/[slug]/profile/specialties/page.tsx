'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { getStoredUser, getStoredOrgId, getStoredOrgSlug } from '@/lib/auth'
import { TagSelector } from '@/components/TagSelector'
import { ChevronLeft, Loader2, Save } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ProfileSpecialtiesPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { lang, t } = useI18n()
  const user = getStoredUser()
  const orgId = getStoredOrgId() || ''
  const orgSlug = getStoredOrgSlug() || ''

  const [allSpecialties, setAllSpecialties] = useState<Array<{ id: string; nameEn: string; nameEs?: string }>>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (orgId) {
      loadSpecialties()
    }
  }, [orgId])

  const loadSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/my-specialties`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        console.log('[profile/specialties] Loaded data:', data)
        // Guardar todas las especialidades disponibles para el selector
        setAllSpecialties(data.map((s: { id: string; nameEn: string; nameEs?: string }) => ({
          id: s.id,
          nameEn: s.nameEn,
          nameEs: s.nameEs
        })))
        // Filtrar las asignadas (que tienen assignedAt)
        const assigned = data.filter((s: { assignedAt: string | null }) => s.assignedAt)
        console.log('[profile/specialties] Assigned:', assigned.map((s: { id: string }) => s.id))
        setSelectedSpecialties(assigned.map((s: { id: string }) => s.id))
      }
    } catch (error) {
      console.error('Failed to load specialties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const res = await fetch(`${API_URL}/my-specialties`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          organizationId: orgId,
          specialtyIds: selectedSpecialties,
        }),
      })

      if (res.ok) {
        setMessage(t('tenant.profileSpecialties.updated'))
        setTimeout(() => {
          router.push(`/${orgSlug || 'profile'}/profile`)
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to save specialties:', error)
      setMessage(t('tenant.profileSpecialties.error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link 
            href={`/${slug}/profile`}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {t('tenant.profile.specialties')}
            </h1>
            <p className="text-on-surface-variant">
              {t('tenant.profileSpecialties.manageSubtitle')}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {t('common.save')}
        </motion.button>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-50 text-emerald-600 font-medium"
        >
          {message}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
          <TagSelector
            label={t('tenant.profileSpecialties.yourSpecialties')}
            placeholder={t('tenant.profileSpecialties.placeholder')}
            availableTags={allSpecialties.map(s => ({ id: s.id, name: s.nameEn, nameEs: s.nameEs }))}
            selectedTags={selectedSpecialties}
            onChange={setSelectedSpecialties}
            minSelections={1}
            lang={lang}
          />
        </div>
      )}
    </motion.div>
  )
}