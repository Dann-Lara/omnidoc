'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  Loader2,
  Check,
  ArrowLeft,
  Send,
  Building2,
  Mail,
  User
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Tenant {
  id: string
  name: string
  slug: string
}

export default function AddOperatorPage() {
  const router = useRouter()
  const { lang, t } = useI18n()
  
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [selectedTenants, setSelectedTenants] = useState<string[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoadingTenants, setIsLoadingTenants] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/tenants?limit=1000`, { credentials: 'include' })
      const data = await res.json()
      setTenants(data.data || [])
    } catch (err) {
      console.error('Failed to fetch tenants:', err)
    } finally {
      setIsLoadingTenants(false)
    }
  }

  const handleSubmit = async () => {
    if (!email) {
      setError(lang === 'es' ? 'El email es requerido' : 'Email is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          role: 'OPERATOR',
          tenantIds: selectedTenants,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to send invitation')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/operators')
      }, 2000)
    } catch (err: any) {
      setError(err.message || t('common.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTenant = (tenantId: string) => {
    setSelectedTenants((prev) =>
      prev.includes(tenantId)
        ? prev.filter((id) => id !== tenantId)
        : [...prev, tenantId]
    )
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-12 px-8 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-primary mb-3">
          {t('admin.operators.invitationSent')}
        </h2>
        <p className="text-on-surface-variant text-lg">
          {t('admin.operators.redirecting')}
        </p>
      </motion.div>
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
          href="/admin/operators"
          className="inline-flex items-center gap-2 mb-6 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>
        
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">
          {t('admin.operators.inviteTitle')}
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm max-w-xl">
          {lang === 'es'
            ? 'Asigna un operador al panel SaaS. Selecciona los tenants que podrá gestionar.'
            : 'Assign an operator to the SaaS dashboard. Select the tenants they can manage.'}
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
                <p className="text-[10px] font-bold uppercase tracking-tighter">Profile</p>
                <p className="text-sm font-semibold">{t('common.email')}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 relative z-10 ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-surface ${
                step >= 2 ? 'bg-primary text-white' : 'bg-surface-container-highest'
              }`}>2</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tighter">Tenants</p>
                <p className="text-sm font-semibold">{t('admin.operators.tenantsAssigned')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-primary">
            <p className="text-xs leading-relaxed text-on-surface-variant">
              {lang === 'es'
                ? 'El operador podrá acceder solo a los tenants asignados.'
                : 'The operator will only be able to access the assigned tenants.'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section>
                <h2 className="text-xl font-bold tracking-tight text-primary mb-6">
                  {lang === 'es' ? 'Datos del Operador' : 'Operator Data'}
                </h2>
                
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('common.email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface"
                        placeholder="operador@ejemplo.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!email) {
                      setError(lang === 'es' ? 'El email es requerido' : 'Email is required')
                      return
                    }
                    setError('')
                    setStep(2)
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  {lang === 'es' ? 'Continuar' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section>
                <h2 className="text-xl font-bold tracking-tight text-primary mb-6">
                  {t('admin.operators.selectTenants')}
                </h2>
                
                {isLoadingTenants ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    {tenants.length === 0 ? (
                      <p className="col-span-2 text-center py-8 text-on-surface-variant">
                        {t('common.noResults')}
                      </p>
                    ) : (
                      tenants.map((tenant) => (
                        <label
                          key={tenant.id}
                          className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                            selectedTenants.includes(tenant.id)
                              ? 'bg-primary/10 border-2 border-primary'
                              : 'bg-surface-container hover:bg-surface-container-high border-2 border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTenants.includes(tenant.id)}
                            onChange={() => toggleTenant(tenant.id)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedTenants.includes(tenant.id)
                              ? 'bg-primary text-white'
                              : 'bg-surface-container-high text-primary'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{tenant.name}</p>
                            <p className="text-xs text-on-surface-variant">{tenant.slug}</p>
                          </div>
                          {selectedTenants.includes(tenant.id) && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </label>
                      ))
                    )}
                  </div>
                )}
              </section>

              {error && (
                <p className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 text-on-surface-variant hover:text-primary font-medium transition-colors"
                >
                  {lang === 'es' ? 'Atrás' : 'Back'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('admin.operators.sendInvite')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
