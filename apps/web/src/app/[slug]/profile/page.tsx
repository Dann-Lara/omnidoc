'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { getCookie } from '@/lib/cookies'
import type { Variants } from 'framer-motion'
import { 
  Settings,
  Edit,
  Shield,
  Clock,
} from 'lucide-react'

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

export default function TenantProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { lang, t } = useI18n()
  
  const orgSlug = getCookie('sb-org-slug') || slug
  const [userData, setUserData] = React.useState<any>(null)
  const [orgName, setOrgName] = React.useState<string>('')

  const userRole = userData?.role

  React.useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile/me`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.user) {
        setUserData(data.user)
        setOrgName(data.organization?.name || slug)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const fullName = userData?.firstName && userData?.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.email?.split('@')[0] || 'User'

  const userInitials = userData?.firstName && userData?.lastName 
    ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
    : userData?.email?.[0]?.toUpperCase() || 'U'

  const handleEditIdentity = () => {
    router.push(`/${orgSlug}/profile/edit`)
  }

  const handleEditSpecialties = () => {
    router.push(`/${orgSlug}/profile/specialties`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-4rem)] space-y-8"
    >
      {/* Profile Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
            {userRole === 'OWNER' || userRole === 'SUPERADMIN'
              ? t('tenant.profile.clinicAdministratorProfile')
              : t('tenant.profile.teamMemberProfile')}
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-primary mb-4">
            {fullName}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            {t('tenant.profile.roleDescription').replace('{orgName}', orgName)}
          </p>
        </div>
        
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEditIdentity}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {t('tenant.profile.editIdentity')}
          </motion.button>
          {(userRole === 'OWNER' || userRole === 'SUPERADMIN') && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditSpecialties}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-secondary text-white shadow-lg shadow-secondary/20 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {t('tenant.profile.specialties')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/${orgSlug}/profile/user-types`)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-tertiary text-white shadow-lg shadow-tertiary/20 hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {t('tenant.profile.userTypes')}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
{(userRole === 'OWNER' || userRole === 'SUPERADMIN' || userRole === 'OPERATOR') && (
            <>
              {/* Clinic Identity Card */}
              <motion.section
                variants={fadeInUp}
                className="lg:col-span-4 bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 border border-outline-variant dark:border-slate-700"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-6">
                  {t('tenant.profile.clinicIdentity')}
                </h3>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white text-2xl font-black">
                    {orgName.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{orgName}</p>
                    <p className="text-xs text-on-surface-variant">Primary Brand #0F4C81</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t('tenant.profile.activeTheme')}</span>
                    <span className="font-semibold text-primary">High-End Clinical</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">{t('tenant.profile.logoAsset')}</span>
                    <span className="text-on-surface font-medium underline cursor-pointer">logo_v2.svg</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant">
                  <button className="w-full py-2 text-xs font-bold uppercase tracking-wider text-primary hover:opacity-70 transition-opacity">
                    {t('tenant.profile.manageBranding')}
                  </button>
                </div>
              </motion.section>

              {/* Subscription Status */}
              <motion.section
                variants={fadeInUp}
                className="lg:col-span-4 bg-surface-container rounded-xl p-6 border border-outline-variant dark:border-slate-700"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-6">
                  {t('tenant.profile.subscriptionTier')}
                </h3>
                <div className="mb-4">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-tighter">
                    Enterprise Plus
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-primary">$2,400</span>
                  <span className="text-on-surface-variant text-sm">/ {t('tenant.profile.monthlyBilling')}</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-6">
                  {t('tenant.profile.nextRenewal')}
                </p>
                <div className="mt-auto">
                  <div className="w-full bg-surface-dim h-1.5 rounded-full mb-2">
                    <div className="bg-surface-tint h-full w-3/4 rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-medium">
                    {t('tenant.profile.licenseUsage').replace('{used}', '76').replace('{total}', '100')}
                  </p>
                </div>
              </motion.section>
            </>
          )}

        {userRole === 'COLLABORATOR' && userData?.subtype && (
          <motion.section
            variants={fadeInUp}
            className="lg:col-span-4 bg-surface-container rounded-xl p-6 border border-outline-variant dark:border-slate-700"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline mb-6">
              {t('tenant.profile.userType')}
            </h3>
            <div className="mb-4">
              <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-tighter">
                {userData.subtype}
              </span>
            </div>
            {userData.specialties && userData.specialties.length > 0 && (
              <div className="mt-4">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  {t('tenant.profile.specialties')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {userData.specialties.map((specialty: { id: string; nameEn: string; nameEs: string }) => (
                    <span key={specialty.id} className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-bold rounded-full">
                      {lang === 'es' ? specialty.nameEs : specialty.nameEn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Team Summary */}
        <motion.section
          variants={fadeInUp}
          className="lg:col-span-4 bg-surface-container-lowest dark:bg-slate-800 rounded-xl p-6 border border-outline-variant dark:border-slate-700"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-outline">
              {t('tenant.profile.teamSummary')}
            </h3>
            <button className="text-primary text-xs font-bold">
              {t('tenant.profile.viewDirectory')}
            </button>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-primary">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+12</div>
              </div>
              <span className="text-sm font-medium">15 Active Clinicians</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">04</p>
                <p className="text-[10px] uppercase font-bold text-outline">Admins</p>
              </div>
              <div className="bg-surface-container p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">02</p>
                <p className="text-[10px] uppercase font-bold text-outline">Onboarding</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Security Vault */}
        <motion.section
          variants={fadeInUp}
          className="lg:col-span-8 bg-primary text-white rounded-xl overflow-hidden shadow-2xl relative"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-container/40 -skew-x-12 translate-x-12 -z-0"></div>
          <div className="relative z-10 p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-24 h-24 flex-shrink-0 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
              <Shield className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {t('tenant.profile.securityVaultStatus')}
                </h2>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded border border-green-500/30 uppercase">
                  {t('tenant.profile.operational')}
                </span>
              </div>
              <p className="text-primary-fixed-dim text-sm max-w-xl leading-relaxed">
                {t('tenant.profile.hsmActive')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button className="bg-white text-primary px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-all">
                {t('tenant.profile.emergencyLock')}
              </button>
              <button className="bg-transparent border border-white/30 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                {t('tenant.profile.rotateKeys')}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Handshake Protocol */}
        <motion.section
          variants={fadeInUp}
          className="lg:col-span-4 flex rounded-xl overflow-hidden shadow-sm border border-outline-variant dark:border-slate-700"
        >
          <div className="w-1/3 bg-surface p-4 flex flex-col justify-between border-r border-outline-variant">
            <div>
              <Clock className="w-5 h-5 text-on-surface-variant mb-2" />
              <h4 className="text-xs font-bold text-on-surface uppercase leading-tight">
                {t('tenant.profile.handshakeLogs')}
              </h4>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-tight">
              {t('tenant.profile.integrityCheck')}
            </p>
          </div>
          <div className="flex-1 bg-surface-container-lowest p-4 space-y-3">
            <div className="flex justify-between items-center text-[10px] pb-2 border-b border-outline-variant">
              <span className="font-bold text-outline">RECENT PROTOCOLS</span>
              <span className="text-green-600 font-bold">100% SECURE</span>
            </div>
            {['HS-9821-X', 'HS-9744-B', 'HS-9601-A'].map((protocol) => (
              <div key={protocol} className="flex justify-between items-center py-2 px-2 rounded bg-surface-container">
                <span className="text-[11px] font-mono font-medium text-primary">{protocol}</span>
                <span className="text-[10px] text-on-surface-variant">09:41 AM</span>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {/* Footer Metadata */}
      <footer className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              {t('tenant.profile.tenantId')}
            </span>
            <span className="text-sm font-medium text-on-surface-variant">
              TID-{orgName.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              {t('tenant.profile.region')}
            </span>
            <span className="text-sm font-medium text-on-surface-variant">US-EAST-1 (Encrypted)</span>
          </div>
        </div>
        <div className="text-[10px] text-outline font-medium flex items-center gap-4">
          <span>© 2024 OMNIDOC SAAS</span>
          <span className="w-1 h-1 bg-outline rounded-full"></span>
          <span className="hover:text-primary underline cursor-pointer">COMPLIANCE HUB</span>
          <span className="hover:text-primary underline cursor-pointer">API ACCESS</span>
        </div>
      </footer>
    </motion.div>
  )
}
