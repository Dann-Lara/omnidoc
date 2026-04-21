'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Siren,
  UserPlus,
  Video,
  Clock,
  Package,
  FileText,
  FlaskConical,
  BarChart3,
  Settings,
  ArrowLeft
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Specialty {
  id: string
  nameEn: string
  nameEs?: string
  icon?: string
  descriptionEn?: string
  descriptionEs?: string
  statsVolume?: number
}

interface Appointment {
  id: string
  patientName: string
  patientAvatar?: string
  scheduledAt: string
  scheduledTime: string
  period: string
  type: string
  doctor: string
  status: 'scheduled' | 'in-progress' | 'waiting' | 'completed'
  isTelehealth: boolean
}

interface Reminder {
  id: string
  type: 'warning' | 'emergency' | 'info'
  title: string
  description: string
}

interface Supply {
  id: string
  name: string
  current: number
  max: number
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientName: 'Eleanor Vance',
    patientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRLvbRVtxwlgN0Yzj2RRJ_pFySRUsLjnwfrVnTryiE2WVP0iJu0nmydcMxH3gwpcCcUFRbcV7wdzQhgcCc2WS51HJWGiF-lyyaE3CIQjvV2E6i4gHiDiSvgFn51RTBOnJgUsjSz6SxxHlZsSgyN6N-_D7DfxRwdltzoVNsl08hCz-VK5VjpHDT1HxEtQTKyftrWcWpH1SlLyV1NXsOTlJUKB6Gaz0roTE0L5V4YhNaG24yBUT-TqOuBg13HMUFAk8GtPve2Uw3hNo',
    scheduledAt: '2024-01-15',
    scheduledTime: '09:30',
    period: 'AM',
    type: 'Post-Op Follow-up',
    doctor: 'Dr. Thorne',
    status: 'scheduled',
    isTelehealth: true
  },
  {
    id: '2',
    patientName: 'Julian Rivers',
    patientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3MV-25-f_6EfIa2gaBowPjWqa1qCGh0kOzuw-xYzn9l84x14qJHOwFCujYf-lM3qYGWJanVTzWKrD6pp1rJ0KCRiLn3w_-Mf-VbCpl5njEG1FdU7Wdbp8l4rsa39hFBoCQ2KwiXOH2uh0KKvhuBpcO_vEl9o11tfezcuyzKCY5e9VfXtFx0Iqir7UhD5sk2zDmyRB5MWG-O4OeSojWO4Tt1yn559q8t64-4ePjDv40jvKjXnB7bl30BQckB2XKQSx4LmVtJ_HnaQ',
    scheduledAt: '2024-01-15',
    scheduledTime: '10:15',
    period: 'AM',
    type: 'Stress Test Evaluation',
    doctor: 'Dr. Chen',
    status: 'scheduled',
    isTelehealth: false
  },
  {
    id: '3',
    patientName: 'Marcus Holloway',
    patientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUaNrzfDcMqg57z6kJ_KLLtt4Ni468CIA08m3EgiZJPWers2slg-iASJcED4aKYz-0HhzXjlHZ-sy6wHlMtMC5mED-DREI35syyIcrE1ayuGm3cVgO4y26djAxjb01HAftrJidp-wePsJdAmhvEenYsmSnWC-2TjpdaV9rWNZdjMVJHFTOErsk8CiPjgyt-tDrvWEEzjromr40BwD4Z2cUxeFBrer5DL53rN4nXiKVhrdwe1LedC1ZXn_IUgaykIMvBokVD_McQM8',
    scheduledAt: '2024-01-15',
    scheduledTime: '11:00',
    period: 'AM',
    type: 'Hypertension Check',
    doctor: 'Nurse Sarah',
    status: 'waiting',
    isTelehealth: false
  }
]

const MOCK_REMINDERS: Reminder[] = [
  {
    id: '1',
    type: 'warning',
    title: 'ECG Module Calibration',
    description: 'Overdue by 2 days in Room 402'
  },
  {
    id: '2',
    type: 'emergency',
    title: 'Stock Alert: Warfarin',
    description: 'Central pharmacy levels < 15%'
  }
]

const MOCK_SUPPLIES: Supply[] = [
  { id: '1', name: 'Catheter Kits (A-9)', current: 42, max: 100 },
  { id: '2', name: 'Sterile Gloves (M)', current: 12, max: 150 },
  { id: '3', name: 'Suture Packs (3-0)', current: 88, max: 200 },
  { id: '4', name: 'Defibrillator Pads', current: 15, max: 20 }
]

export default function SpecialtyDashboardPage() {
  const { t, lang } = useI18n()
  const params = useParams()
  const router = useRouter()
  
  const slug = params.slug as string
  const specialtyId = params.specialtyId as string
  
  const [specialty, setSpecialty] = useState<Specialty | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchSpecialty()
  }, [specialtyId])
  
  const fetchSpecialty = async () => {
    try {
      const res = await fetch(`${API_URL}/specialties/${specialtyId}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setSpecialty(data)
      }
    } catch (error) {
      console.error('Failed to fetch specialty:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const specialtyName = specialty 
    ? (lang === 'en' ? specialty.nameEn : (specialty.nameEs || specialty.nameEn))
    : 'Specialty'
  
  const getSupplyColor = (current: number, max: number) => {
    const pct = (current / max) * 100
    if (pct < 15) return 'bg-error'
    if (pct < 40) return 'bg-warning'
    return 'bg-primary'
  }
  
  const getSupplyTextColor = (current: number, max: number) => {
    const pct = (current / max) * 100
    if (pct < 15) return 'text-error font-bold'
    return 'text-on-surface-variant'
  }
  
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
      className="space-y-8 pb-24"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:justify-between md:items-end gap-6"
      >
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
            <Link href={`/${slug}/areas/specialties`} className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              {t('tenant.areas.specialties.areas')}
            </Link>
            <ChevronRight className="w-3 h-3 text-on-surface-variant/50" />
            <span className="text-primary">{specialtyName}</span>
          </nav>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
            {specialtyName}
          </h2>
          <p className="text-on-surface-variant mt-3 max-w-2xl text-lg leading-relaxed">
            {t('tenant.specialties.managingSpecialtyOperations').replace('{specialty}', specialtyName)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-semibold text-sm">
            <UserPlus className="w-4 h-4" />
            {t('tenant.specialties.newPatient')}
          </button>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-12 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-3 font-bold">{t('tenant.specialties.dailyCapacity')}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-primary">84%</span>
              <div className="flex items-end gap-1 h-8">
                <div className="w-1.5 bg-primary/20 h-4 rounded-t-sm"></div>
                <div className="w-1.5 bg-primary/20 h-6 rounded-t-sm"></div>
                <div className="w-1.5 bg-primary h-8 rounded-t-sm"></div>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-3 font-bold">{t('tenant.specialties.avgConsult')}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-primary">22m</span>
              <span className="text-xs text-error font-semibold flex items-center mb-1">
                <TrendingUp className="w-3 h-3" /> 4%
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-3 font-bold">{t('tenant.specialties.waitTime')}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-primary">12m</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center mb-1">
                <TrendingDown className="w-3 h-3" /> 8%
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-12 lg:col-span-4 bg-primary text-white p-5 rounded-xl relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-bold">{t('tenant.specialties.criticalReminders')}</h3>
              <span className="bg-white/20 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-tighter">{MOCK_REMINDERS.length} {t('tenant.specialties.pending')}</span>
            </div>
            <div className="space-y-3">
              {MOCK_REMINDERS.map((reminder) => (
                <div key={reminder.id} className="flex gap-3 p-2.5 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                  {reminder.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-tertiary-fixed shrink-0 mt-0.5" />
                  ) : (
                    <Siren className="w-5 h-5 text-tertiary-fixed shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{reminder.title}</p>
                    <p className="text-xs text-white/70">{reminder.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-3xl"></div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-12 lg:col-span-8"
      >
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
            <h3 className="text-lg font-bold text-primary">{t('tenant.specialties.upcomingAppointments')}</h3>
            <button className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-widest hover:underline">
              {t('tenant.specialties.viewAll')}
            </button>
          </div>
          <div className="divide-y divide-surface-container">
            {MOCK_APPOINTMENTS.map((appointment) => (
              <div key={appointment.id} className="px-5 py-4 flex items-center gap-5 group hover:bg-surface-container-low/20 transition-colors">
                <div className="w-11 text-center shrink-0">
                  <p className="text-lg font-black text-primary">{appointment.scheduledTime}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase">{appointment.period}</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-surface-container overflow-hidden ring-2 ring-primary/5 shrink-0">
                  <img alt={appointment.patientName} src={appointment.patientAvatar} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-on-surface truncate">{appointment.patientName}</h4>
                  <p className="text-sm text-on-surface-variant truncate">{appointment.type} • {appointment.doctor}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {appointment.isTelehealth ? (
                    <span className="hidden sm:inline-block px-2.5 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {t('tenant.specialties.telehealth')}
                    </span>
                  ) : (
                    <span className="hidden sm:inline-block px-2.5 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {t('tenant.specialties.inPerson')}
                    </span>
                  )}
                  {appointment.status === 'waiting' ? (
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-container transition-all flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
                      <Clock className="w-4 h-4" />
                      {t('tenant.specialties.waiting')}
                    </button>
                  ) : (
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-container transition-all flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      {t('tenant.specialties.start')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-12 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-12 lg:col-span-4 flex flex-col gap-6"
        >
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t('tenant.specialties.suppliesInventory')}
              </h3>
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">
                {t('tenant.specialties.orderAll')}
              </button>
            </div>
            <div className="space-y-5">
              {MOCK_SUPPLIES.map((supply) => (
                <div key={supply.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-on-surface">{supply.name}</span>
                    <span className={getSupplyTextColor(supply.current, supply.max)}>
                      {supply.current} / {supply.max}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${getSupplyColor(supply.current, supply.max)}`} 
                      style={{ width: `${(supply.current / supply.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/10">
            <h4 className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-4">
              {t('tenant.specialties.quickResources')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-white rounded-xl flex flex-col items-center gap-2 hover:shadow-lg transition-all border border-transparent hover:border-primary/20">
                <FileText className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold uppercase tracking-tight">{t('tenant.specialties.protocols')}</span>
              </button>
              <button className="p-4 bg-white rounded-xl flex flex-col items-center gap-2 hover:shadow-lg transition-all border border-transparent hover:border-primary/20">
                <FlaskConical className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold uppercase tracking-tight">{t('tenant.specialties.labOrders')}</span>
              </button>
              <button className="p-4 bg-white rounded-xl flex flex-col items-center gap-2 hover:shadow-lg transition-all border border-transparent hover:border-primary/20">
                <BarChart3 className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold uppercase tracking-tight">{t('tenant.specialties.analytics')}</span>
              </button>
              <button className="p-4 bg-white rounded-xl flex flex-col items-center gap-2 hover:shadow-lg transition-all border border-transparent hover:border-primary/20">
                <Settings className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold uppercase tracking-tight">{t('tenant.specialties.settings')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}