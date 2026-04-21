'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Building2, ArrowRight, AlertCircle, Loader2, Stethoscope, Building } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { saveAuthSession } from '@/lib/auth'
import { TagSelector } from '@/components/TagSelector'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

export default function SignupPage() {
  const router = useRouter()
  const { lang, t } = useI18n()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    orgName: '',
    specialties: [] as string[],
    orgType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'CLINIC',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')
  const [specialties, setSpecialties] = useState<Array<{ id: string; name: string; nameEs?: string }>>([])

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await fetch(`${API_URL}/specialties`, {
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setSpecialties(data.map((s: any) => ({
            id: s.id,
            name: s.nameEn,
            nameEs: s.nameEs,
          })))
        }
      } catch (error) {
        console.error('Failed to fetch specialties:', error)
      }
    }
    fetchSpecialties()
  }, [])

  const handleSpecialtiesChange = (tagIds: string[]) => {
    setFormData({ ...formData, specialties: tagIds })
  }

  const labels = {
    title: t('auth.signup.title'),
    subtitle: t('auth.signup.subtitle'),
    practiceName: t('auth.signup.practiceName'),
    practicePlaceholder: t('auth.signup.practicePlaceholder'),
    specialty: t('auth.signup.specialty'),
    selectSpecialty: t('auth.signup.selectSpecialty'),
    orgTypeTitle: t('auth.signup.orgTypeTitle'),
    orgTypeIndividual: t('auth.signup.orgTypeIndividual'),
    orgTypeClinic: t('auth.signup.orgTypeClinic'),
    firstName: t('auth.signup.firstName'),
    lastName: t('auth.signup.lastName'),
    lastNamePlaceholder: 'Smith',
    email: t('auth.signup.email'),
    emailPlaceholder: 'doctor@clinic.com',
    password: t('auth.signup.password'),
    passwordHint: t('auth.signup.passwordHint'),
    continue: t('auth.signup.continue'),
    back: t('auth.signup.back'),
    submit: t('auth.signup.submit'),
    creating: t('auth.signup.creating'),
    hasAccount: t('auth.signup.hasAccount'),
    signIn: t('auth.signup.signIn'),
    errors: {
      network: t('auth.signup.errors.network'),
    },
  }

  const successLabels = {
    title: t('auth.signup.emailSent'),
    subtitle: t('auth.signup.subtitle'),
    emailLabel: t('auth.signup.emailLabel'),
    resend: t('auth.signup.resend'),
    resendLink: t('auth.signup.resendLink'),
    backToLogin: t('auth.signup.backToLogin'),
  }

  const handleInputChange = (field: string, value: string | 'INDIVIDUAL' | 'CLINIC') => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const orgSlug = generateSlug(formData.orgName)

    if (formData.specialties.length === 0) {
      setError(t('auth.signup.selectSpecialtyError'))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          orgName: formData.orgName,
          specialties: formData.specialties,
          orgType: formData.orgType,
          lang, // Enviar idioma del navbar
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || 'Signup failed')
        setIsLoading(false)
        return
      }

      if (data.user) {
        setSuccessEmail(formData.email)
        setShowSuccess(true)
      } else {
        setSuccessEmail(formData.email)
        setShowSuccess(true)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(labels.errors.network)
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-on-surface mb-3"
          >
            {successLabels.title}
          </motion.h2>
          <p className="text-on-surface-variant mb-6">
            {successLabels.subtitle}
          </p>
          <div className="bg-surface-container rounded-lg p-4 mb-6">
            <p className="text-sm text-on-surface-variant mb-1">{successLabels.emailLabel}</p>
            <p className="font-semibold text-on-surface">{successEmail}</p>
          </div>
          <p className="text-sm text-on-surface-variant mb-8">
            {successLabels.instruction}
          </p>
        </motion.div>

        <div className="text-center space-y-4">
          <p className="text-sm text-on-surface-variant">
            {successLabels.resend}{' '}
            <button className="text-primary font-semibold hover:underline">
              {successLabels.resendLink}
            </button>
          </p>
          <Link 
            href="/login" 
            className="block w-full py-3 px-6 rounded-lg font-semibold border border-outline-variant hover:bg-surface-container transition-colors"
          >
            {successLabels.backToLogin}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center lg:text-left">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-on-surface mb-2"
        >
          {labels.title}
        </motion.h2>
        <p className="text-on-surface-variant">
          {labels.subtitle}
        </p>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mb-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          1
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-surface-container'}`} />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step >= 2 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          2
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        {step === 1 && (
          <>
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-on-surface mb-2">
                {labels.practiceName}
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  id="orgName"
                  type="text"
                  value={formData.orgName}
                  onChange={(e) => handleInputChange('orgName', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder={labels.practicePlaceholder}
                />
              </div>
            </div>

            <TagSelector
              label={labels.specialty}
              placeholder={labels.selectSpecialty}
              availableTags={specialties}
              selectedTags={formData.specialties}
              onChange={handleSpecialtiesChange}
              minSelections={1}
              lang={lang}
            />

            <div>
              <label className="block text-sm font-medium text-on-surface mb-3">
                {labels.orgTypeTitle}
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
                  <Stethoscope className={`w-6 h-6 ${formData.orgType === 'INDIVIDUAL' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-sm font-semibold">{labels.orgTypeIndividual}</span>
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
                  <Building className={`w-6 h-6 ${formData.orgType === 'CLINIC' ? 'text-primary' : 'text-on-surface-variant'}`} />
                  <span className="text-sm font-semibold">{labels.orgTypeClinic}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!formData.orgName || formData.specialties.length === 0}
              className="w-full clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {labels.continue}
              <ArrowRight className="w-5 h-5" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-on-surface mb-2">
                  {labels.firstName}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-on-surface mb-2">
                  {labels.lastName}
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder={labels.lastNamePlaceholder}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                {labels.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder={labels.emailPlaceholder}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
                {labels.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder={labels.passwordHint}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-6 rounded-lg font-semibold border border-outline-variant hover:bg-surface-container transition-colors"
              >
                {labels.back}
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  formData.password.length < 8
                }
                className="flex-1 clinical-gradient text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-pulse">{labels.creating}</span>
                ) : (
                  <>
                    {labels.submit}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>

      <div className="text-center">
        <p className="text-sm text-on-surface-variant">
          {labels.hasAccount}{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            {labels.signIn}
          </Link>
        </p>
      </div>
    </div>
  )
}
