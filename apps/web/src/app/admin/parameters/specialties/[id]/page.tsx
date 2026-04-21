'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { getStoredRole } from '@/lib/auth/session'
import {
  ChevronRight,
  Code,
  Info,
  Loader2,
  Save,
  X
} from 'lucide-react'
import type { Variants } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const CLINICAL_ICONS = [
  { value: 'medical_services', label: 'Medical Services' },
  { value: 'stethoscope', label: 'Stethoscope' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'gynecology', label: 'Gynecology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'local_pharmacy', label: 'Pharmacy' },
  { value: 'vaccines', label: 'Vaccines' },
  { value: 'healing', label: 'Healing' },
  { value: 'health_and_safety', label: 'Health & Safety' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'emergency_medics', label: 'Emergency Medics' },
  { value: 'dentistry', label: 'Dentistry' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'urology', label: 'Urology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'hematology', label: 'Hematology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'allergology', label: 'Allergology' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'icu', label: 'ICU' },
  { value: 'clinical_notes', label: 'Clinical Notes' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'monitor_heart', label: 'Monitor Heart' },
  { value: 'biotech', label: 'Biotech' },
  { value: 'medication', label: 'Medication' },
  { value: 'bloodtype', label: 'Blood Type' },
]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  }
}

interface Specialty {
  id: string
  nameEn: string
  nameEs?: string
  icon?: string
  descriptionEn?: string
  descriptionEs?: string
  isActive: boolean
  configSchema?: Record<string, unknown>
}

export default function SpecialtyFormPage() {
  const { lang, t } = useI18n()
  const router = useRouter()
  const userRole = getStoredRole()
  const isOperator = userRole === 'OPERATOR'

  useEffect(() => {
    if (isOperator) {
      router.push('/admin/parameters/specialties')
    }
  }, [isOperator, router])
  const params = useParams()
  const specialtyId = params.id as string | undefined
  const isEditing = !!specialtyId
  
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [toggleActive, setToggleActive] = useState(true)
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false)
  const iconDropdownRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    nameEn: '',
    nameEs: '',
    icon: '',
    descriptionEn: '',
    descriptionEs: '',
    configSchema: ''
  })

  useEffect(() => {
    if (isEditing && specialtyId) {
      fetchSpecialty()
    }
  }, [specialtyId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target as Node)) {
        setIconDropdownOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredIcons = CLINICAL_ICONS.filter(icon =>
    icon.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fetchSpecialty = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/specialties`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data: Specialty[] = await res.json()
        const specialty = data.find(s => s.id === specialtyId)
        if (specialty) {
          setFormData({
            nameEn: specialty.nameEn,
            nameEs: specialty.nameEs || '',
            icon: specialty.icon || '',
            descriptionEn: specialty.descriptionEn || '',
            descriptionEs: specialty.descriptionEs || '',
            configSchema: specialty.configSchema ? JSON.stringify(specialty.configSchema, null, 2) : ''
          })
          setToggleActive(specialty.isActive)
        }
      }
    } catch (error) {
      console.error('Failed to fetch specialty:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let configSchema = undefined
      if (formData.configSchema.trim()) {
        try {
          configSchema = JSON.parse(formData.configSchema)
        } catch {
          alert(t('admin.specialties.invalidJsonFormat'))
          setIsSaving(false)
          return
        }
      }

      const payload = {
        nameEn: formData.nameEn,
        nameEs: formData.nameEs,
        icon: formData.icon,
        descriptionEn: formData.descriptionEn,
        descriptionEs: formData.descriptionEs,
        isActive: toggleActive,
        configSchema
      }

      const url = isEditing 
        ? `${API_URL}/admin/specialties/${specialtyId}`
        : `${API_URL}/admin/specialties`
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      if (res.ok) {
        router.push('/admin/parameters/specialties')
      }
    } catch (error) {
      console.error('Failed to save specialty:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    router.push('/admin/parameters/specialties')
  }

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
      className="space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <nav className="flex items-center space-x-2 text-xs text-on-surface-variant mb-3 uppercase tracking-widest font-semibold">
            <Link href="/admin/parameters/specialties" className="hover:text-primary transition-colors">
              {t('admin.specialties.parameters')}
            </Link>
            <ChevronRight className="text-[12px]" />
            <Link href="/admin/parameters/specialties" className="hover:text-primary transition-colors">
              {t('admin.nav.specialties')}
            </Link>
            <ChevronRight className="text-[12px]" />
            <span className="text-primary">
              {isEditing ? t('admin.specialties.edit') : t('admin.specialties.createNew')}
            </span>
          </nav>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight font-headline">
            {isEditing 
              ? t('admin.specialties.editSpecialty')
              : t('admin.specialties.createNewSpecialty')}
          </h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
            {t('admin.specialties.defineNewSpecialty')}
          </p>
        </div>
        <div className="flex space-x-4 w-full md:w-auto">
          <button
            type="button"
            onClick={handleDiscard}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold text-on-primary-fixed-variant hover:bg-surface-container-high transition-colors rounded-lg border border-transparent hover:border-outline-variant/30"
          >
            {t('admin.specialties.discardDraft')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 md:flex-none px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-primary to-primary-container rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('admin.specialties.saveSpecialty')}
          </button>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="col-span-12 lg:col-span-7 space-y-10"
        >
          <section className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
            <div className="flex items-center space-x-3 mb-8">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                language
              </span>
              <h3 className="text-lg font-bold text-primary">
                {t('admin.specialties.identityTranslation')}
              </h3>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {t('admin.specialties.specialtyNameSpanish')}
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.nameEs}
                    onChange={(e) => setFormData({ ...formData, nameEs: e.target.value })}
                    className="w-full bg-surface-container-high border-none px-4 py-3 rounded-lg focus:bg-surface-container-lowest focus:ring-0 transition-all border-l-2 border-transparent focus:border-primary"
                    placeholder={t('admin.specialties.egCardiologia')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {t('admin.specialties.specialtyNameEnglish')}
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-surface-container-high border-none px-4 py-3 rounded-lg focus:bg-surface-container-lowest focus:ring-0 transition-all border-l-2 border-transparent focus:border-primary"
                    placeholder={t('admin.specialties.egCardiology')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {t('admin.specialties.descriptionSpanish')}
                </label>
                <textarea
                  value={formData.descriptionEs}
                  onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                  className="w-full bg-surface-container-high border-none px-4 py-3 rounded-lg focus:bg-surface-container-lowest focus:ring-0 transition-all resize-none"
                  placeholder={t('admin.specialties.placeholderDescriptionEs')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {t('admin.specialties.descriptionEnglish')}
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full bg-surface-container-high border-none px-4 py-3 rounded-lg focus:bg-surface-container-lowest focus:ring-0 transition-all resize-none"
                  placeholder={t('admin.specialties.placeholderDescriptionEn')}
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                  terminal
                </span>
                <h3 className="text-lg font-bold text-primary">
                  {t('admin.specialties.configurationSchema')}
                </h3>
              </div>
              <div className="flex items-center space-x-2 bg-surface-container px-3 py-1.5 rounded-full">
                <Code className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-tight">JSON Format</span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant italic">
                {t('admin.specialties.clinicalLogicParams')}
              </p>
              <div className="rounded-xl overflow-hidden shadow-inner">
                <textarea
                  className="w-full p-6 text-sm focus:outline-none resize-none leading-relaxed font-mono bg-[#1e1e1e] text-[#d4d4d4]"
                  value={formData.configSchema}
                  onChange={(e) => setFormData({ ...formData, configSchema: e.target.value })}
                  placeholder={`{
  "clinical_logic": {
    "triage_priority": "high"
  }
 }`}
                  rows={12}
                  spellCheck={false}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-medium text-outline pt-2">
                <span>{t('admin.specialties.readyForValidation')}</span>
                <span>Line {formData.configSchema.split('\n').length}, Column 1</span>
              </div>
            </div>
          </section>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="col-span-12 lg:col-span-5 space-y-10"
        >
          <section className="bg-surface-container p-8 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">
              {t('admin.specialties.iconographyStatus')}
            </h3>
            <div className="space-y-8">
              <div className="space-y-4" ref={iconDropdownRef}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                  {t('admin.specialties.systemIcon')}
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                    className="w-16 h-16 bg-surface-container-high rounded-xl flex items-center justify-center border border-outline-variant/20 shadow-sm hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {formData.icon || 'medical_services'}
                    </span>
                  </button>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                      className="w-full bg-surface-container-high border-none px-4 py-3 rounded-lg text-sm flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {formData.icon || 'medical_services'}
                        </span>
                        <span className="text-on-surface">
                          {formData.icon 
                            ? CLINICAL_ICONS.find(i => i.value === formData.icon)?.label || formData.icon
                            : t('admin.specialties.selectAnIcon')}
                        </span>
                      </span>
                      <ChevronRight className={`w-4 h-4 text-on-surface-variant transition-transform ${iconDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {iconDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-2 border-b border-outline-variant/50">
                      <input
                        type="text"
                        placeholder={t('admin.specialties.searchIcons')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-high rounded-lg text-sm border-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {filteredIcons.length === 0 ? (
                        <div className="px-4 py-6 text-center text-on-surface-variant text-sm">
                          {t('admin.specialties.noIconsFound')}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1">
                          {filteredIcons.map((icon) => (
                            <button
                              key={icon.value}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, icon: icon.value })
                                setIconDropdownOpen(false)
                                setSearchQuery('')
                              }}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                formData.icon === icon.value
                                  ? 'bg-primary/20 text-primary'
                                  : 'hover:bg-surface-container-high text-on-surface'
                              }`}
                            >
                              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {icon.value}
                              </span>
                              <span className="truncate">{icon.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="pt-6 border-t border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-primary">
                      {t('admin.specialties.activeStatus')}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      {t('admin.specialties.immediateAvailability')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer overflow-hidden">
                    <input
                      type="checkbox"
                      checked={toggleActive}
                      onChange={(e) => setToggleActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-surface-variant rounded-full transition-colors duration-300 peer-checked:bg-primary"></div>
                    <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${toggleActive ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-blue-900 text-blue-100 p-8 rounded-xl shadow-xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">architecture</span>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-70">
              {t('admin.specialties.architectureSpecs')}
            </h3>
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-center py-2 border-b border-blue-800">
                <span className="text-xs opacity-80">Global ID</span>
                <span className="text-xs font-mono">{specialtyId || 'SPEC_NEW_' + Date.now().toString().slice(-4)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-800">
                <span className="text-xs opacity-80">
                  {t('admin.specialties.tenantInheritance')}
                </span>
                <span className="text-xs font-bold bg-blue-800 px-2 py-0.5 rounded">Cascade</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-800">
                <span className="text-xs opacity-80">
                  {t('admin.specialties.syncStatus')}
                </span>
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-2"></div>
                  <span className="text-xs">
                    {t('admin.specialties.propagating')}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-10 bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/5">
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 mt-0.5" />
                <p className="text-[11px] leading-relaxed opacity-90">
                  {t('admin.specialties.creatingSpecialtyGlobal')}
                </p>
              </div>
            </div>
          </section>

          <div className="p-6 bg-white/40 border border-white/20 backdrop-blur-lg rounded-xl shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">
              {t('admin.specialties.ensureSpecialtyIcon')}
            </p>
          </div>
        </motion.div>
      </form>
    </motion.div>
  )
}