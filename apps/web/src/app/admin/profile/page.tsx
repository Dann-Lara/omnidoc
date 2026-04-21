'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'
import {
  Camera,
  Save,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import type { Variants } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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

export default function ProfilePage() {
  const router = useRouter()
  const { lang, t } = useI18n()
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    userId: '',
    createdAt: '',
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
      const response = await fetch(`${API_URL}/profile/me`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.user) {
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          role: data.user.role || 'SUPERADMIN',
          userId: data.user.id || '',
          createdAt: data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : '',
        })
        if (data.user.avatar) {
          setAvatarPreview(data.user.avatar)
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(t('admin.profile.failedToLoad'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t('admin.profile.fileTooLarge'))
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

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (err) {
      setError(t('admin.profile.failedToSave'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
            {t('admin.profile.myProfile')}
          </h2>
          <p className="text-on-surface-variant font-medium">
            {t('admin.profile.managePersonalInfo')}
          </p>
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
            ? t('admin.profile.saved')
            : t('admin.profile.saveChanges')
          }
        </motion.button>
      </motion.div>

      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
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
            {t('admin.profile.personalInfo')}
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
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    {t('admin.profile.firstName')}
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
                    {t('admin.profile.lastName')}
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  {t('admin.profile.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  {t('admin.profile.emailCannotBeChanged')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-8 border border-outline-variant dark:border-slate-700"
        >
          <h3 className="text-lg font-bold mb-6">
            {t('admin.profile.accountInfo')}
          </h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                {t('admin.profile.role')}
              </p>
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="font-bold text-primary">
                  {formData.role === 'SUPERADMIN' 
                    ? t('admin.profile.superadmin')
                    : formData.role === 'OPERATOR'
                    ? t('admin.profile.operator')
                    : formData.role
                  }
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                {t('admin.profile.memberSince')}
              </p>
              <p className="font-semibold text-on-surface text-lg">{formData.createdAt}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                {t('admin.profile.userId')}
              </p>
              <p className="font-mono text-xs text-on-surface-variant truncate" title={formData.userId}>
                {formData.userId}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
