'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  Loader2,
  Plus,
  Send,
  CheckCircle,
  Stethoscope,
  ArrowLeft
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Specialty {
  id: string
  nameEn: string
  nameEs?: string
}

interface UserTypes {
  [key: string]: {
    name: string
    nameEn: string
    description: string
    descriptionEn: string
    icon: string
    dashboard: string
    permissions: string[]
    canHaveSpecialties: boolean
  }
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
}

export default function AddTeamMemberPage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  
  const slug = params.slug as string
  
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [specialtyIds, setSpecialtyIds] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [userTypes, setUserTypes] = useState<UserTypes>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [specialtiesRes, typesRes] = await Promise.all([
        fetch(`${API_URL}/my-specialties`, { credentials: 'include' }),
        fetch(`${API_URL}/team/user-types`, { credentials: 'include' }),
      ])
      
      if (specialtiesRes.ok) {
        const data = await specialtiesRes.json()
        setSpecialties(data)
      }
      if (typesRes.ok) {
        const data = await typesRes.json()
        setUserTypes(data)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSpecialty = (id: string) => {
    setSpecialtyIds(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (!userType || !email) {
      setError(t('team.requiredFields'))
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          userType,
          specialtyIds: specialtyIds.length > 0 ? specialtyIds : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to create invitation')
      }

      router.push(`/${slug}/areas/team`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTypeConfig = userTypes[userType]
  const canHaveSpecialties = userType && userTypes[userType]?.canHaveSpecialties

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-32"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link 
          href={`/${slug}/areas/team`}
          className="inline-flex items-center gap-2 mb-6 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('team.backToTeam')}
        </Link>
        
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">
          {t('team.inviteNewMember')}
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm max-w-xl">
          {lang === 'es'
            ? 'Provisiona acceso seguro al ecosistema clínico. Completa la asignación de rol y especialidad.'
            : 'Provision secure access to the clinical ecosystem. Complete the role and specialty alignment.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-surface-container-highest"></div>
            
            <div className={`flex items-center gap-4 relative z-10 ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-surface ${
                step >= 1 ? 'bg-primary text-white' : 'bg-surface-container-highest'
              }`}>1</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tighter">Configuration</p>
<p className="text-sm font-semibold">{t('team.userType')}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 relative z-10 ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-surface ${
                step >= 2 ? 'bg-primary text-white' : 'bg-surface-container-highest'
              }`}>2</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tighter">Profile</p>
                <p className="text-sm font-semibold">{t('team.personalDetails')}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 relative z-10 ${step >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-surface ${
                step >= 3 ? 'bg-primary text-white' : 'bg-surface-container-highest'
              }`}>3</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tighter">Specialty</p>
                <p className="text-sm font-semibold">{t('team.specialty')}</p>
              </div>
            </div>
            
            </div>

          <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-primary">
            <p className="text-xs leading-relaxed text-on-surface-variant">
              {lang === 'es'
                ? 'Los permisos se heredan automáticamente según el tipo de usuario y especialidades asignadas.'
                : 'Permissions are automatically inherited based on the selected User Type and assigned Specialties.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-16">
          <section>
            <h2 className="text-xl font-bold tracking-tight text-primary mb-6">
              {t('team.step1UserType')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(userTypes).length === 0 ? (
                <p className="text-on-surface-variant col-span-2 text-center py-8">
                  {lang === 'es' 
                    ? 'No hay tipos de usuario configurados. Configúralos primero.' 
                    : 'No user types configured. Configure them first.'}
                </p>
              ) : (
                Object.entries(userTypes).map(([typeKey, config]: [string, any]) => {
                  const isSelected = userType === typeKey
                  return (
                    <button
                      key={typeKey}
                      onClick={() => {
                        setUserType(typeKey)
                        setStep(2)
                      }}
                      className={`p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-container-low border-primary ring-4 ring-primary-fixed-dim/20'
                          : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary-fixed' : 'bg-surface-container'
                        }`}>
                          <Stethoscope className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <h3 className="font-bold text-on-surface mb-1">
                        {lang === 'es' ? config.name : config.nameEn || config.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {lang === 'es' ? config.description : config.descriptionEn || config.description}
                      </p>
                    </button>
                  )
                })
              )}
            </div>
          </section>

          {step >= 2 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold tracking-tight text-primary mb-6">
                {t('team.step2PersonalDetails')}
              </h2>
              <div className="bg-surface-container-lowest rounded-xl p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5 ml-1">
                    {t('team.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary/20"
                    placeholder="email@clinica.com"
                  />
                </div>
<div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5 ml-1">
                      {t('team.firstName')}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={lang === 'es' ? 'Ej. Juan' : 'John'}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5 ml-1">
                      {t('team.lastName')}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-high border-none rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary/20"
                      placeholder={lang === 'es' ? 'Ej. Pérez' : 'Doe'}
                    />
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step >= 2 && canHaveSpecialties && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold tracking-tight text-primary mb-6">
                {t('team.step3SpecialtyAssignment')}
              </h2>
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-surface-container">
                  {specialties.map((specialty) => (
                    <label
                      key={specialty.id}
                      className="flex items-center justify-between p-5 hover:bg-surface-container/30 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-xl" style={{ fontVariationSettings: 'FILL 1' }}>
                            medical_services
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface group-hover:text-primary transition-colors">
                            {lang === 'es' ? specialty.nameEs : specialty.nameEn}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={specialtyIds.includes(specialty.id)}
                        onChange={() => toggleSpecialty(specialty.id)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </div>

      <div className="pb-8 pt-6 border-t border-outline-variant mt-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {error && (
              <span className="text-sm font-semibold text-error">{error}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${slug}/areas/team`)}
              className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant dark:text-slate-400 hover:bg-surface-container dark:hover:bg-slate-800 transition-colors rounded-lg"
            >
              {t('team.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userType || !email || isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {t('team.sendInvitation')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}