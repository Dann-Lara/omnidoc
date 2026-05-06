'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { TagSelector } from '@/components/TagSelector'
import {
  Loader2,
  ArrowLeft,
  Mail,
  Ban,
  Trash2,
  Badge,
  ShieldCheck,
  Save,
  User
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
  permissions?: Record<string, any>
  lastLoginAt?: string
  createdAt: string
  avatar?: string | null
  role: {
    id: string
    name: string
  }
}

const PERMISSIONS = [
  { key: 'appointments', name: 'Citas', nameEn: 'Appointments', read: true, write: true, delete: false },
  { key: 'patients', name: 'Pacientes', nameEn: 'Patients', read: true, write: true, delete: false },
  { key: 'clinicalHistory', name: 'Historial Clínico', nameEn: 'Clinical History', read: true, write: false, delete: false },
]

export default function TeamMemberPage() {
  const { lang, t } = useI18n()
  const params = useParams()
  const router = useRouter()
  
  const slug = params.slug as string
  const userId = params.userId as string
  
  const [member, setMember] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [localPermissions, setLocalPermissions] = useState({});
  const [localSubtype, setLocalSubtype] = useState<string>('');
  const [localSpecialtyIds, setLocalSpecialtyIds] = useState<string[]>([]);
  const [userTypes, setUserTypes] = useState<Record<string, { name: string; nameEn: string }>>({});
  const [specialties, setSpecialties] = useState<{ id: string; name: string; nameEn: string }[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<{ id: string; email: string }[]>([]);
  const [resending, setResending] = useState(false);

  const getSidebarState = () => {
    if (typeof window === 'undefined') return { collapsed: true, open: false }
    const collapsed = localStorage.getItem('sidebar-collapsed') !== 'false'
    const open = localStorage.getItem('sidebar-open') === 'true'
    return { collapsed, open }
  }
  const [sidebarState, setSidebarState] = useState({ collapsed: true, open: false })

  useEffect(() => {
    setSidebarState(getSidebarState())
  }, [])

  useEffect(() => {
    fetchMember()
    fetchUserTypes()
    fetchSpecialties()
    fetchPendingInvitations()
  }, [userId])

  const fetchMember = async () => {
    try {
      const res = await fetch(`${API_URL}/team/${userId}`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setMember(data)
        setLocalPermissions(data.permissions || {})
        setLocalSubtype(data.subtype || '')
        setLocalSpecialtyIds(data.specialtyIds || [])
      }
    } catch (error) {
      console.error('Failed to fetch member:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/team/user-types`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const types: Record<string, { name: string; nameEn: string }> = {}
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          types[key] = { name: value.name, nameEn: value.nameEn }
        })
        setUserTypes(types)
      }
    } catch (error) {
      console.error('Failed to fetch user types:', error)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/specialties`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSpecialties(data.map((s: any) => ({
          id: s.id,
          name: lang === 'es' ? s.nameEs : s.nameEn,
          nameEn: s.nameEn,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error)
    }
  }

  const fetchPendingInvitations = async () => {
    try {
      const res = await fetch(`${API_URL}/team/invitations`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setPendingInvitations((data || []).filter((inv: any) => inv.status === 'PENDING'))
      }
    } catch (error) {
      console.error('Failed to fetch pending invitations:', error)
    }
  }

  const handleResendInvitation = async () => {
    if (!member) return
    const invitation = pendingInvitations.find(inv => inv.email === member.email)
    if (!invitation) return

    setResending(true)
    try {
      const res = await fetch(`${API_URL}/team/invite/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitationId: invitation.id }),
      })
      if (res.ok) {
        alert(t('team.resendSuccess'))
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error)
    } finally {
      setResending(false)
    }
  }

  const updatePermission = (module: string, action: string, value: boolean) => {
    setLocalPermissions((prev: any) => ({
      ...prev,
      [module]: {
        ...(prev[module] || {}),
        [action]: value,
      }
    }))
  }

  const handleSave = async () => {
    if (!member) return

    setIsSaving(true)
    try {
      await fetch(`${API_URL}/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subtype: localSubtype,
          specialtyIds: localSpecialtyIds,
          permissions: localPermissions,
        }),
      })
      router.push(`/${slug}/areas/team`)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!member) return

    try {
      await fetch(`${API_URL}/team/${member.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      router.push(`/${slug}/areas/team`)
    } catch (error) {
      console.error('Failed to deactivate:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant">{t('team.memberNotFound')}</p>
        <Link href={`/${slug}/areas/team`} className="text-primary mt-4">
          {t('team.backToTeam')}
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-8"
    >
      <Link 
        href={`/${slug}/areas/team`}
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('team.backToTeam')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full ring-4 ring-surface-container dark:ring-slate-700 overflow-hidden">
                {member.avatar ? (
                  <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-fixed dark:bg-slate-700">
                    <User className="w-12 h-12 text-primary-fixed-variant dark:text-slate-300" />
                  </div>
                )}
              </div>
              <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-white dark:border-slate-800 rounded-full ${
                member.status === 'ACTIVE' && member.lastLoginAt
                  ? 'bg-emerald-500'
                  : member.status === 'PENDING_INVITATION' || !member.lastLoginAt
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}></div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface mb-1">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-on-surface-variant text-sm mb-4">{member.email}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <span className="px-3 py-1 bg-primary-container dark:bg-slate-700 text-on-primary-container dark:text-slate-200 text-xs font-bold uppercase tracking-widest rounded-full">
                {userTypes[member.subtype || '']?.[lang === 'es' ? 'name' : 'nameEn'] || member.subtype || member.userType}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${
                member.status === 'ACTIVE' && member.lastLoginAt
                  ? 'bg-secondary-container dark:bg-slate-600 text-on-secondary-container dark:text-slate-200'
                  : member.status === 'PENDING_INVITATION' || !member.lastLoginAt
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-error-container dark:bg-red-900/30 text-error-container dark:text-red-400'
              }`}>
                {member.status === 'ACTIVE' && member.lastLoginAt
                  ? t('team.statusLabels.active')
                  : member.status === 'PENDING_INVITATION' || !member.lastLoginAt
                  ? t('team.statusLabels.pendingInvitation')
                  : t('team.statusLabels.inactive')}
              </span>
            </div>
            {(member.status === 'PENDING_INVITATION' || !member.lastLoginAt) && (
              <button
                onClick={handleResendInvitation}
                disabled={resending}
                className="w-full mt-4 bg-gradient-to-br from-primary to-primary-container text-white px-4 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {resending ? t('team.resending') : t('team.resendInvitation')}
              </button>
            )}
            <div className="w-full space-y-4 pt-6 border-t border-surface-container dark:border-slate-700 text-left">
              <div>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  {t('team.specialties')}
                </span>
                <span className="text-sm font-medium">
                  {specialties.length > 0 && member.specialtyIds?.length > 0
                    ? member.specialtyIds
                        .map(id => specialties.find(s => s.id === id)?.name || id)
                        .filter(Boolean)
                        .join(', ')
                    : t('team.notAssigned')}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  {t('team.lastActivity')}
                </span>
                <span className="text-sm font-medium">
                  {member.lastLoginAt 
                    ? new Date(member.lastLoginAt).toLocaleString()
                    : t('team.never')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-8">
          <section className="bg-surface-container dark:bg-slate-800 rounded-xl p-8">
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-6 flex items-center gap-2">
              <Badge className="w-5 h-5 text-primary" />
              {t('team.memberDetails')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('team.fullName')}
                </label>
                <input 
                  className="w-full bg-surface-container-high dark:bg-slate-700 border-none rounded-lg px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={`${member.firstName} ${member.lastName}`}
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('team.email')}
                </label>
                <input 
                  className="w-full bg-surface-container-high dark:bg-slate-700 border-none rounded-lg px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={member.email}
                  readOnly
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container dark:bg-slate-800 rounded-xl p-8">
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-6 flex items-center gap-2">
              <Badge className="w-5 h-5 text-primary" />
              {t('team.editInformation')}
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('team.userType')}
                </label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-surface-container rounded-xl border-2 border-outline-variant px-4 py-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                    value={member?.subtype || ''}
                    onChange={(e) => {
                      setMember({ ...member!, subtype: e.target.value })
                      setLocalSubtype(e.target.value)
                    }}
                  >
                    <option value="">{t('team.selectType')}</option>
                    {Object.entries(userTypes).map(([key, value]) => (
                      <option key={key} value={key}>
                        {lang === 'es' ? value.name : value.nameEn}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant dark:text-slate-400 uppercase tracking-wider">
                  {t('team.specialties')}
                </label>
                <TagSelector
                  availableTags={specialties.map(s => ({ id: s.id, name: lang === 'es' ? s.name : s.nameEn }))}
                  selectedTags={localSpecialtyIds}
                  onChange={setLocalSpecialtyIds}
                  lang={lang}
                  placeholder={t('team.selectSpecialties')}
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-8 pb-4">
              <h2 className="text-lg font-bold text-on-surface dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {t('team.systemPermissions')}
              </h2>
              <p className="text-on-surface-variant dark:text-slate-400 text-sm mt-1">
                {t('team.permissionsDescription')}
              </p>
            </div>
            <div className="px-8 pb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      <th className="pb-4 pl-4">{t('userTypes.module')}</th>
                      <th className="pb-4 text-center">{t('userTypes.read')}</th>
                      <th className="pb-4 text-center">{t('userTypes.write')}</th>
                      <th className="pb-4 text-center">{t('userTypes.delete')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {PERMISSIONS.map((perm) => (
                      <tr key={perm.key} className="bg-surface-container-low dark:bg-slate-700 group hover:bg-surface-container dark:hover:bg-slate-600 transition-colors">
                        <td className="py-4 pl-4 font-semibold dark:text-white rounded-l-lg">
                          {perm.key === 'appointments' ? t('team.permAppointments') : perm.key === 'patients' ? t('team.permPatients') : t('team.permClinicalHistory')}
                        </td>
                        <td className="py-4 text-center">
                          <input
                            checked={(localPermissions as any)[perm.key]?.read ?? perm.read}
                            onChange={(e) => updatePermission(perm.key, 'read', e.target.checked)}
                            className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-outline-variant/30 bg-white dark:bg-slate-800"
                            type="checkbox"
                          />
                        </td>
                        <td className="py-4 text-center">
                          <input
                            checked={(localPermissions as any)[perm.key]?.write ?? perm.write}
                            onChange={(e) => updatePermission(perm.key, 'write', e.target.checked)}
                            className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-outline-variant/30 bg-white dark:bg-slate-800"
                            type="checkbox"
                          />
                        </td>
                        <td className="py-4 text-center rounded-r-lg">
                          <input
                            checked={(localPermissions as any)[perm.key]?.delete ?? perm.delete}
                            onChange={(e) => updatePermission(perm.key, 'delete', e.target.checked)}
                            className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-outline-variant/30 bg-white dark:bg-slate-800"
                            type="checkbox"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="pb-8 pt-6 border-t border-outline-variant mt-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleDeactivate}
            className="px-5 py-2 text-sm font-semibold text-error hover:bg-error-container/30 dark:hover:bg-red-900/20 transition-colors rounded-lg flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            {t('team.deactivate')}
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/${slug}/areas/team`)}
              className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant dark:text-slate-400 hover:bg-surface-container dark:hover:bg-slate-800 transition-colors rounded-lg"
            >
              {t('team.cancel')}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {t('team.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}