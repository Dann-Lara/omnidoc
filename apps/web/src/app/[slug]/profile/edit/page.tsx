'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import { getCookie } from '@/lib/cookies'
import { TagSelector } from '@/components/TagSelector'
import {
  ArrowLeft,
  Camera,
  Save,
  Loader2,
  Check,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'
import type { Variants } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const SPECIALTIES = [
  { en: 'General Medicine', es: 'Medicina General', value: 'general-medicine' },
  { en: 'Cardiology', es: 'Cardiología', value: 'cardiology' },
  { en: 'Dermatology', es: 'Dermatología', value: 'dermatology' },
  { en: 'Neurology', es: 'Neurología', value: 'neurology' },
  { en: 'Pediatrics', es: 'Pediatría', value: 'pediatrics' },
  { en: 'Orthopedics', es: 'Ortopedia', value: 'orthopedics' },
  { en: 'Psychiatry', es: 'Psiquiatría', value: 'psychiatry' },
  { en: 'Gynecology', es: 'Ginecología', value: 'gynecology' },
  { en: 'Ophthalmology', es: 'Oftalmología', value: 'ophthalmology' },
  { en: 'Other', es: 'Otro', value: 'other' },
]

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
}

export default function TenantProfileEditPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { lang, t } = useI18n()
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showOrgTypeWarning, setShowOrgTypeWarning] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [specialties, setSpecialties] = useState<Array<{ id: string; nameEn: string; nameEs: string; icon: string }>>([])
  const [allSpecialties, setAllSpecialties] = useState<Array<{ id: string; nameEn: string; nameEs: string; icon: string }>>([])
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialty: '',
    specialtyIds: [] as string[],
    subtype: '',
    orgName: '',
    orgType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'CLINIC',
    subscriptionStatus: '',
    userId: '',
    createdAt: '',
    role: '',
  })

  

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (user?.avatar && !avatarPreview) {
      setAvatarPreview(user.avatar)
    }
  }, [user, avatarPreview])

  const loadProfile = async () => {
    try {
      const [profileRes, specialtiesRes] = await Promise.all([
        fetch(`${API_URL}/profile/me`, { credentials: 'include' }),
        fetch(`${API_URL}/specialties`, { credentials: 'include' }),
      ])
      const data = await profileRes.json()
      const allSpecialtiesData = await specialtiesRes.json()

      setAllSpecialties(allSpecialtiesData || [])

      if (data.user) {
        const userRole = data.user.role
        const userSpecialties = userRole === 'OWNER' || userRole === 'SUPERADMIN'
          ? (data.organization?.specialties || [])
          : (data.user.specialties || [])
        const assignedIds = userRole === 'OWNER' || userRole === 'SUPERADMIN'
          ? (data.organization?.specialtyIds || [])
          : (data.user.specialtyIds || [])
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          specialty: assignedIds.length > 0 ? assignedIds[0] : '',
          specialtyIds: assignedIds,
          subtype: data.user.subtype || '',
          orgName: data.organization?.name || '',
          orgType: data.organization?.type || 'INDIVIDUAL',
          subscriptionStatus: data.organization?.subscriptionStatus || '',
          userId: data.user.id || '',
          createdAt: data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : '',
          role: userRole,
        })
        setSpecialties(userSpecialties)
        if (data.user.avatar) {
          setAvatarPreview(data.user.avatar)
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(t('tenant.profileEdit.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t('tenant.profileEdit.fileError'))
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        setAvatarPreview(base64)
        await saveAvatar(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveAvatar = async (avatar: string) => {
    try {
      await fetch(`${API_URL}/profile/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar }),
      })
      
      updateUser({ avatar })
    } catch (err) {
      console.error('Failed to save avatar:', err)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'orgType' && value !== formData.orgType) {
      setShowOrgTypeWarning(true)
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    try {
      // Guardar perfil básico
      const response = await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          specialty: formData.specialty,
          specialtyIds: formData.specialtyIds,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        if (formData.orgName !== (await fetch(`${API_URL}/profile/me`, { credentials: 'include' }).then(r => r.json())).organization?.name) {
          await fetch(`${API_URL}/profile/organization`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name: formData.orgName }),
          })
        }
        
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (err) {
      setError(t('tenant.profileEdit.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    const orgSlug = getCookie('sb-org-slug') || slug
    router.push(`/${orgSlug}/profile`)
  }

  const userInitials = formData.firstName && formData.lastName 
    ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
    : formData.email?.[0]?.toUpperCase() || 'U'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
              {t('tenant.profile.editIdentity')}
            </h2>
            <p className="text-on-surface-variant font-medium">
              {t('tenant.profileEdit.editIdentitySubtitle')}
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : showSuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {showSuccess 
            ? t('tenant.profileEdit.saved')
            : t('common.save')
          }
        </motion.button>
      </motion.div>

      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success-container/20 border border-success/20 rounded-lg p-4 flex items-center gap-3"
        >
          <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
          <p className="text-sm text-success font-medium">
            {t('tenant.profileEdit.changesSaved')}
          </p>
        </motion.div>
      )}

      {showOrgTypeWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              {t('tenant.profileEdit.orgTypeWarning')}
            </p>
            <button 
              onClick={() => setShowOrgTypeWarning(false)}
              className="text-xs text-amber-600 underline mt-1"
            >
              {t('tenant.profileEdit.understood')}
            </button>
          </div>
        </div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <motion.div 
          variants={fadeInUp}
          className="md:col-span-2 xl:col-span-2 bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-8 border border-outline-variant dark:border-slate-700"
        >
          <h3 className="text-lg font-bold mb-6">
            {t('tenant.profile.personalInfo')}
          </h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative flex-shrink-0"
            >
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg clinical-gradient text-white shadow-lg flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </motion.div>
          </div>
             
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    {t('common.firstName')}
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    {t('common.lastName')}
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  {t('tenant.profile.specialties')}
                </label>
                {formData.role === 'COLLABORATOR' ? (
                  specialties && specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((spec) => (
                        <span key={spec.id} className="px-3 py-1.5 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 text-sm font-medium rounded-full flex items-center gap-2">
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {spec.icon || 'medical_services'}
                          </span>
                          {lang === 'es' ? spec.nameEs : spec.nameEn}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-surface-container rounded-lg border border-outline-variant text-on-surface-variant">
                      {t('tenant.profile.noSpecialties')}
                    </div>
                  )
                ) : formData.role === 'OWNER' || formData.role === 'SUPERADMIN' ? (
                  <TagSelector
                    placeholder={t('tenant.profile.selectSpecialties')}
                    availableTags={allSpecialties.map(s => ({ id: s.id, name: s.nameEn, nameEs: s.nameEs }))}
                    selectedTags={formData.specialtyIds}
                    onChange={(ids) => setFormData(prev => ({ ...prev, specialtyIds: ids }))}
                    minSelections={1}
                    lang={lang}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      {t('common.email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">
                      {t('tenant.profile.emailCannotBeChanged')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

          <motion.div 
          variants={fadeInUp}
          className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-8 border border-outline-variant dark:border-slate-700"
        >
          <h3 className="text-lg font-bold mb-6">
            {formData.role === 'OWNER' || formData.role === 'SUPERADMIN'
              ? t('tenant.profile.organizationData')
              : t('tenant.profile.userTypeInfo')}
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                {t('tenant.profile.clinicName')}
              </label>
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => handleInputChange('orgName', e.target.value)}
                disabled={formData.role === 'COLLABORATOR'}
                className={`w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formData.role === 'COLLABORATOR' ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            {formData.role === 'OWNER' || formData.role === 'SUPERADMIN' ? (
              <div>
                <label className="block text-sm font-medium text-on-surface mb-3">
                  {t('tenant.profile.organizationType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('orgType', 'INDIVIDUAL')}
                    className={`
                      p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${formData.orgType === 'INDIVIDUAL' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-outline-variant hover:border-primary/50'}
                    `}
                  >
                    <span className={`text-sm font-semibold ${formData.orgType === 'INDIVIDUAL' ? 'text-primary' : ''}`}>
                      {t('tenant.profile.individual')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('orgType', 'CLINIC')}
                    className={`
                      p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${formData.orgType === 'CLINIC' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-outline-variant hover:border-primary/50'}
                    `}
                  >
                    <span className={`text-sm font-semibold ${formData.orgType === 'CLINIC' ? 'text-primary' : ''}`}>
                      {t('tenant.profile.clinic')}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  {t('tenant.profile.organizationType')}
                </label>
                <div className="px-4 py-3 bg-surface-container rounded-lg border border-outline-variant text-on-surface-variant">
                  {formData.orgType === 'INDIVIDUAL' 
                    ? t('tenant.profile.individual')
                    : t('tenant.profile.clinic')}
                </div>
              </div>
            )}

            </div>
            <div className="pt-4 border-t border-outline-variant space-y-4">
              {formData.role === 'COLLABORATOR' ? (
                <>
                  {formData.subtype && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                        {t('tenant.profile.collaboratorType')}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-sm font-bold text-primary">
                          {formData.subtype.charAt(0).toUpperCase() + formData.subtype.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                      {t('tenant.profile.memberSince')}
                    </p>
                    <p className="font-semibold text-on-surface text-lg">{formData.createdAt}</p>
                  </div>
                </>
              ) : (
                <>
                  {formData.subscriptionStatus && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                        {t('tenant.profile.subscriptionStatus')}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-sm font-bold text-primary">{formData.subscriptionStatus}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                      {t('tenant.profile.memberSince')}
                    </p>
                    <p className="font-semibold text-on-surface text-lg">{formData.createdAt}</p>
                  </div>
                </>
)}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
  )
}
