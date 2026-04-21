'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Download,
  Settings,
  Award,
  TrendingUp,
  Verified,
  Lock,
  ArrowUpCircle,
  Handshake,
  ChevronRight,
  Menu,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface TenantDetails {
  id: string
  name: string
  slug: string
  status: string
  type: string
  planId: string | null
  features: Record<string, any>
  branding: Record<string, any>
  settings: Record<string, any>
  createdAt: string
  subscription: any
  owner: any
  stats: {
    totalUsers: number
    activeDoctors: number
    totalSpecialties: number
    totalAppointments: number
    storageUsedGB: number
    storageCapacityTB: number
  }
  recentAppointments: any[]
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [details, setDetails] = useState<TenantDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [handshakeEnabled, setHandshakeEnabled] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  useEffect(() => {
    fetchDetails()
  }, [id])

  const fetchDetails = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/tenants/${id}/details`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setDetails(data)
      } else {
        setError('Failed to load tenant details')
      }
    } catch (err) {
      setError('Failed to load tenant details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-green-500/10 text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Tenant Active
          </span>
        )
      case 'TRIALING':
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-[#00355f]/10 text-[#00355f]">
            <span className="w-2 h-2 rounded-full bg-[#00355f]"></span>
            Trialing
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-error/10 text-error">
            <span className="w-2 h-2 rounded-full bg-error"></span>
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatStoragePercent = (used: number, capacity: number) => {
    return Math.round((used / capacity) * 100)
  }

  const handleDeleteTenant = async () => {
    if (deleteConfirmText !== details?.name) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/admin/tenants/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (res.ok) {
        router.push('/admin/tenants')
      } else {
        setError('Failed to delete tenant')
        setShowDeleteModal(false)
      }
    } catch (err) {
      setError('Failed to delete tenant')
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <p className="text-error">{error || 'Tenant not found'}</p>
        <button
          onClick={() => router.push('/admin/tenants')}
          className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
        >
          Back to Tenants
        </button>
      </div>
    )
  }

  const storagePercent = formatStoragePercent(details.stats.storageUsedGB, details.stats.storageCapacityTB)

  return (
    <>
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full shadow-2xl border border-outline-variant"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-error" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">
                    Delete Tenant
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    This action cannot be undone. All data associated with this tenant including users, appointments, and patient records will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Type <span className="font-bold text-error">{details?.name}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={details?.name}
                  className="w-full px-4 py-3 bg-surface-container rounded-lg border border-outline-variant focus:border-error focus:ring-2 focus:ring-error/20 outline-none transition-all"
                  disabled={isDeleting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => !isDeleting && setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTenant}
                  disabled={deleteConfirmText !== details?.name || isDeleting}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-sm bg-error text-white hover:bg-error/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Tenant'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-surface font-body text-on-surface antialiased">
        <main className="p-8 lg:p-16 max-w-[1600px] mx-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          {/* Page Header */}
          <motion.header variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => router.push('/admin/tenants')}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {getStatusBadge(details.status)}
                <span className="text-on-surface-variant/60 font-mono text-sm border-l border-outline-variant pl-3">
                  ID: {details.slug.toUpperCase()}
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold text-on-surface tracking-tighter leading-none">
                {details.name}
              </h1>
              <p className="text-on-surface-variant mt-4 font-medium text-lg">
                Central control for regional medical operations and compliance.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-surface-container-high text-on-surface-variant rounded-xl font-bold text-sm hover:bg-surface-container transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </button>
              <button className="px-6 py-3 bg-gradient-to-br from-primary to-[#0f4c81] text-white rounded-xl font-bold text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Tenant
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-error/10 text-error rounded-xl font-bold text-sm hover:bg-error/20 transition-all flex items-center gap-2 border border-error/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete Tenant
              </button>
            </div>
          </motion.header>

          {/* Bento Grid Dashboard */}
          <div className="grid grid-cols-12 gap-8">
            {/* Subscription Tier Card */}
            <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Subscription Tier</h3>
                <div className="h-10 w-10 bg-[#0f4c81]/20 rounded-full flex items-center justify-center text-primary">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mb-10">
                <p className="text-4xl font-black text-primary mb-2">
                  {details.type || 'Enterprise Pro'}
                </p>
                <p className="text-on-surface-variant text-base font-medium">
                  Annual Billing • Priority Support
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm py-4 bg-surface-container-low px-5 rounded-2xl">
                  <span className="text-on-surface-variant font-medium">Next Renewal</span>
                  <span className="font-bold text-on-surface">
                    {details.subscription?.nextBillingDate 
                      ? formatDate(details.subscription.nextBillingDate)
                      : 'Oct 12, 2024'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-4 bg-surface-container-low px-5 rounded-2xl">
                  <span className="text-on-surface-variant font-medium">Annual Fee</span>
                  <span className="font-bold text-on-surface">
                    ${details.subscription?.amount || 124500}.00
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Panel */}
            <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-0 rounded-[2.5rem] overflow-hidden bg-surface-container-low shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-outline-variant/10">
              <div className="bg-surface p-10 border-b md:border-b-0 md:border-r border-outline-variant/10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-6">Active Doctors</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black tracking-tighter text-on-surface">
                    {details.stats.activeDoctors}
                  </span>
                  <span className="text-on-surface-variant/40 font-bold text-2xl">/ {details.stats.totalUsers}</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-8">
                  <div 
                    className="bg-primary h-full rounded-full shadow-sm" 
                    style={{ width: `${(details.stats.activeDoctors / details.stats.totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-surface p-10 border-b md:border-b-0 md:border-r border-outline-variant/10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-6">Specialties</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black tracking-tighter text-on-surface">
                    {details.stats.totalSpecialties}
                  </span>
                </div>
                <p className="text-sm text-primary font-bold mt-8 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +2 added this month
                </p>
              </div>
              <div className="bg-surface-container-lowest p-10 relative">
                <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-primary animate-pulse"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/70 mb-6">Cloud Storage</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-6xl font-black tracking-tighter text-on-surface">
                    {details.stats.storageUsedGB}
                  </span>
                  <span className="text-on-surface-variant/40 font-bold uppercase text-2xl">TB</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-8 font-medium">
                  {storagePercent}% Capacity Reached
                </p>
              </div>
            </motion.div>

            {/* Operational Activity Chart */}
            <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-outline-variant/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
                <div>
                  <h3 className="text-2xl font-black text-on-surface tracking-tight">Operational Activity</h3>
                  <p className="text-sm text-on-surface-variant font-medium mt-1">
                    Global system engagement trend — Last 30 Days
                  </p>
                </div>
                <div className="flex p-1.5 bg-surface-container-low rounded-2xl gap-1">
                  <button className="px-4 py-1.5 text-xs font-bold rounded-xl text-on-surface-variant hover:bg-surface transition-colors">
                    7D
                  </button>
                  <button className="px-4 py-1.5 bg-primary text-xs font-bold rounded-xl text-white shadow-lg shadow-primary/20">
                    30D
                  </button>
                  <button className="px-4 py-1.5 text-xs font-bold rounded-xl text-on-surface-variant hover:bg-surface transition-colors">
                    90D
                  </button>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-3 px-2">
                {[25, 45, 35, 65, 80, 55, 75, 92, 68, 42, 28, 100].map((height, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-xl hover:bg-primary/20 transition-colors ${
                      i === 11 ? 'bg-primary' : i >= 7 ? 'bg-primary/60' : 'bg-surface-container'
                    }`}
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between mt-6 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] px-1 border-t border-outline-variant/10 pt-4">
                <span>Sep 01</span>
                <span>Sep 15</span>
                <span>Sep 30</span>
              </div>
            </motion.div>

            {/* System Health Score */}
            <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-4 bg-[#00355f] rounded-[2.5rem] p-10 text-white flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-24 -top-24 h-64 w-64 bg-white/5 rounded-full blur-3xl"></div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-200/40 mb-10">System Health Score</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-8xl font-black tracking-tighter">9.4</span>
                  <span className="text-blue-200/30 text-3xl font-bold">/ 10</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-8 border border-white/10">
                  <Verified className="text-green-400 text-2xl" />
                  <div>
                    <p className="text-sm font-bold text-white leading-none">Performance Optimized</p>
                    <p className="text-xs text-blue-100/60 mt-1">Latency &lt; 120ms</p>
                  </div>
                </div>
                <button className="w-full py-5 bg-white text-primary hover:bg-blue-50 transition-colors rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                  View Detailed Metrics
                </button>
              </div>
            </motion.div>

            {/* Administrative Control */}
            <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-[2.5rem] p-10 border border-outline-variant/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-10">Administrative Control</h3>
              <div className="space-y-4">
                <button className="w-full group flex items-center justify-between p-5 bg-surface-container-lowest rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-error-container/50 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-on-surface text-lg leading-none mb-1">Force Password Reset</p>
                      <p className="text-sm text-on-surface-variant">Global trigger for all tenant users</p>
                    </div>
                  </div>
                  <ChevronRight className="text-on-surface-variant/30 group-hover:text-primary transition-colors" />
                </button>
                <button className="w-full group flex items-center justify-between p-5 bg-surface-container-lowest rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-[#0f4c81]/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <ArrowUpCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-on-surface text-lg leading-none mb-1">Upgrade Subscription</p>
                      <p className="text-sm text-on-surface-variant">Adjust tier and billing parameters</p>
                    </div>
                  </div>
                  <ChevronRight className="text-on-surface-variant/30 group-hover:text-primary transition-colors" />
                </button>
                <div className="p-8 bg-[#0F4C81] rounded-3xl text-white mt-6 shadow-xl shadow-primary/10">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Handshake className="text-blue-300 text-2xl" />
                      <span className="font-black text-sm uppercase tracking-widest">Handshake Protocol</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={handshakeEnabled}
                        onChange={() => setHandshakeEnabled(!handshakeEnabled)}
                      />
                      <div className="w-12 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[19px] after:w-[19px] after:transition-all peer-checked:bg-blue-400"></div>
                    </label>
                  </div>
                  <p className="text-sm text-blue-100/70 leading-relaxed font-medium">
                    Grant temporary support access to OmniDoc engineers. This allows deep-level technical debugging for critical errors.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recent Support Tickets */}
            <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Support Lifecycle Queue</h3>
                <a className="text-sm font-bold text-primary flex items-center gap-2 hover:underline" href="#">
                  Access Portal
                  <span className="text-sm">↗</span>
                </a>
              </div>
              <div className="overflow-hidden">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                      <th className="px-6 pb-2">Reference</th>
                      <th className="px-6 pb-2">Service Subject</th>
                      <th className="px-6 pb-2 text-center">Current Status</th>
                      <th className="px-6 pb-2">Assigned Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-surface-container-low/50 group hover:bg-surface-container-high/50 transition-all rounded-3xl">
                      <td className="px-6 py-6 rounded-l-[2rem] font-mono text-sm text-on-surface-variant font-bold">TKT-8821</td>
                      <td className="px-6 py-6">
                        <p className="text-base font-black text-on-surface leading-tight mb-1">Data Latency: Radiology Sync</p>
                        <span className="text-[10px] font-black text-error uppercase tracking-widest border border-error/20 px-2 py-0.5 rounded-md">Critical Priority</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-error/10 text-error px-4 py-2 rounded-full">
                          <span className="h-2 w-2 rounded-full bg-error animate-pulse"></span>
                          <span className="text-xs font-black uppercase">Pending</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 rounded-r-[2rem]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden border-2 border-white shadow-sm">
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">AR</div>
                          </div>
                          <span className="text-sm font-bold text-on-surface-variant">Alex R.</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-surface-container-low/50 group hover:bg-surface-container-high/50 transition-all rounded-3xl">
                      <td className="px-6 py-6 rounded-l-[2rem] font-mono text-sm text-on-surface-variant font-bold">TKT-8825</td>
                      <td className="px-6 py-6">
                        <p className="text-base font-black text-on-surface leading-tight mb-1">New Physician Onboarding</p>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded-md">Medium Priority</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                          <span className="text-xs font-black uppercase">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 rounded-r-[2rem]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden border-2 border-white shadow-sm">
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">SM</div>
                          </div>
                          <span className="text-sm font-bold text-on-surface-variant">Sarah M.</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Global Footer Status */}
          <footer className="mt-20 pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center text-on-surface-variant/40 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold tracking-tighter text-primary/40">OmniDoc</span>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Administrative Handshake Terminal</span>
            </div>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
              <a className="hover:text-primary transition-colors" href="#">Compliance Logs</a>
              <a className="hover:text-primary transition-colors" href="#">Security Manifest</a>
              <a className="hover:text-primary transition-colors" href="#">Contact Global Support</a>
            </div>
          </footer>
        </motion.div>
      </main>
    </div>
    </>
  )
}