'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  Loader2,
  Search,
  Plus,
  Mail,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  Stethoscope,
  Heart,
  Calendar,
  Palette,
  Badge,
  FlaskConical,
  Headphones,
  Settings,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface TeamMember {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: string
  subtype: string | null
  specialtyIds: string[]
  specialty: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_INVITATION'
  lastLoginAt?: string
  createdAt: string
  avatar?: string | null
  role: {
    id: string
    name: string
  }
}

interface TeamResponse {
  data: TeamMember[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-500',
  INACTIVE: 'bg-slate-400',
  PENDING_INVITATION: 'bg-amber-500',
}

const STATUS_LABELS: Record<string, { name: string; nameEn: string }> = {
  ACTIVE: { name: 'Activo', nameEn: 'Active' },
  INACTIVE: { name: 'Inactivo', nameEn: 'Inactive' },
  PENDING_INVITATION: { name: 'Invitación Pendiente', nameEn: 'Pending Invitation' },
}

const AVAILABLE_ICONS: Record<string, any> = {
  medical_services: Stethoscope,
  health_and_safety: Heart,
  calendar_month: Calendar,
  palette: Palette,
  badge: Badge,
  vaccines: FlaskConical,
  support_agent: Headphones,
  person: User,
}

export default function TeamPage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  
  const slug = params.slug as string
  
  const [team, setTeam] = useState<TeamResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [userTypes, setUserTypes] = useState<Record<string, { name: string; nameEn: string }>>({})

  useEffect(() => {
    fetchTeam()
    fetchUserTypes()
  }, [page, statusFilter, userTypeFilter])

  const fetchTeam = async () => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.set('page', String(page))
      queryParams.set('limit', '10')
      if (search) queryParams.set('search', search)
      if (statusFilter) queryParams.set('status', statusFilter)
      if (userTypeFilter) queryParams.set('userType', userTypeFilter)

      const res = await fetch(`${API_URL}/team?${queryParams}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setTeam(data)
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/team/user-types`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        const labels: Record<string, { name: string; nameEn: string }> = {}
        Object.entries(data).forEach(([key, config]: [string, any]) => {
          labels[key] = { name: config.name, nameEn: config.nameEn || config.name }
        })
        setUserTypes(labels)
      }
    } catch (error) {
      console.error('Failed to fetch user types:', error)
    }
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return t('team.never')
    
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return t('common.minutesAgo').replace('{min}', String(minutes))
    if (hours < 24) return t('common.hoursAgo').replace('{hours}', String(hours))
    if (days === 1) return t('common.yesterday')
    return t('common.daysAgo').replace('{days}', String(days))
  }

  const hasUserTypes = Object.keys(userTypes).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasUserTypes) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">
          {t('team.noUserTypes')}
        </h2>
        <p className="text-on-surface-variant mb-6 max-w-md">
          {t('team.noUserTypesDesc')}
        </p>
        <Link 
          href={`/${slug}/profile/user-types`}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
        >
          <Settings className="w-4 h-4" />
          {t('team.configureUserTypes')}
        </Link>
      </motion.div>
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
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">
            {t('common.teamLabel')}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {lang === 'es' 
              ? 'Gestiona los profesionales y personal administrativo del centro.' 
              : 'Manage professionals and administrative staff.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/${slug}/areas/team/invitations`}
            className="bg-surface-container border border-outline-variant text-on-surface-variant px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all hover:bg-surface-container-high"
          >
            <Mail className="w-4 h-4" />
            {t('common.invitations')}
          </Link>
          <Link 
            href={`/${slug}/areas/team/add`}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('common.newMember')}
          </Link>
        </div>
      </motion.div>

      <section className="bg-surface-container-low rounded-2xl p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTeam()}
          />
        </div>
        <div className="flex gap-3">
          <select
            className="appearance-none bg-surface-container-lowest border-none rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-on-surface-variant focus:ring-2 focus:ring-primary/20 cursor-pointer"
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
          >
            <option value="">{t('common.type')}</option>
            {Object.entries(userTypes).map(([key, labels]) => (
              <option key={key} value={key}>{labels.name}</option>
            ))}
          </select>
          <select
            className="appearance-none bg-surface-container-lowest border-none rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-on-surface-variant focus:ring-2 focus:ring-primary/20 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('common.status')}</option>
<option value="ACTIVE">{STATUS_LABELS.ACTIVE[lang === 'es' ? 'name' : 'nameEn']}</option>
              <option value="INACTIVE">{STATUS_LABELS.INACTIVE[lang === 'es' ? 'name' : 'nameEn']}</option>
              <option value="PENDING_INVITATION">{STATUS_LABELS.PENDING_INVITATION[lang === 'es' ? 'name' : 'nameEn']}</option>
          </select>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {team?.data.map((member) => (
          <Link
            key={member.id}
            href={`/${slug}/areas/team/${member.id}`}
            className="group bg-surface-container-lowest p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container ring-4 ring-surface">
                  {member.avatar ? (
                    <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-fixed">
                      <User className="w-8 h-8 text-primary-fixed-variant" />
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full ${STATUS_COLORS[member.status]}`}></div>
              </div>
                <div>
                <h3 className="text-lg font-bold text-on-surface">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-primary-fixed-variant font-medium text-sm">
                  {userTypes[member.subtype || '']?.name || member.subtype || 'Colaborador'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member.status === 'ACTIVE' 
                      ? 'bg-secondary-container text-on-secondary-container' 
                      : member.status === 'INACTIVE'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {STATUS_LABELS[member.status]?.[lang === 'es' ? 'name' : 'nameEn']}
                  </span>
                  {(member.specialtyIds?.length || 0) > 0 && (
                    <span className="text-[11px] text-outline">
                      {member.specialtyIds?.length} {t('team.specialtiesCount')?.replace('{count}', String(member.specialtyIds?.length || 0)) || (lang === 'es' ? 'especialidades' : 'specialties')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary-container bg-surface-container-high hover:bg-primary-container hover:text-white transition-colors duration-200">
                <Mail className="w-5 h-5" />
              </button>
              <button className="p-1 text-outline hover:text-on-surface">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </Link>
        ))}
      </div>

      {team && team.meta.totalPages > 1 && (
        <footer className="mt-12 flex justify-between items-center py-6 border-t border-outline-variant/30">
          <p className="text-sm text-outline-variant font-medium">
            {t('common.showing')}
            <span className="text-on-surface font-bold">{team.data.length}</span>
            {t('common.of')}
            <span className="text-on-surface font-bold">{team.meta.total}</span>
            {t('common.members')}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-dim transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(3, team.meta.totalPages) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm ${
                  page === i + 1
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setPage(p => Math.min(team.meta.totalPages, p + 1))}
              disabled={page === team.meta.totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant hover:bg-surface-dim transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>
      )}
    </motion.div>
  )
}