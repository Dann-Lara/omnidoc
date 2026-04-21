'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import {
  Loader2,
  Mail,
  Send,
  XCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Plus,
  UserPlus,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Invitation {
  id: string
  email: string
  role: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  tenantIds: string[]
  expiresAt: string
  createdAt: string
}

export default function OperatorInvitationsPage() {
  const { lang, t } = useI18n()

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/invitations`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setInvitations(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async (id: string) => {
    setActionLoading(id)
    try {
      await fetch(`${API_URL}/admin/invitations/${id}/resend`, {
        method: 'POST',
        credentials: 'include',
      })
      fetchInvitations()
    } catch (error) {
      console.error('Failed to resend:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm(t('operators.revokeConfirm'))) return
    
    setActionLoading(id)
    try {
      await fetch(`${API_URL}/admin/invitations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      fetchInvitations()
    } catch (error) {
      console.error('Failed to revoke:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: Invitation['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'REVOKED':
        return <XCircle className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusLabel = (status: Invitation['status']) => {
    switch (status) {
      case 'PENDING':
        return t('operators.statusPending')
      case 'ACCEPTED':
        return t('operators.statusAccepted')
      case 'EXPIRED':
        return t('operators.statusExpired')
      case 'REVOKED':
        return t('operators.statusRevoked')
    }
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
          <ChevronLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>
        
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">
          {t('common.invitations')}
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm max-w-xl">
          {t('admin.operators.description')}
        </p>
      </motion.div>

      <div className="flex justify-end">
        <Link
          href="/admin/operators/add"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('admin.operators.addNew')}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('operators.noInvitations')}</p>
        </div>
      ) : (
        <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                  {t('common.email')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                  {t('common.status')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                  {t('admin.operators.tenantsAssigned')}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-on-surface-variant">
                  {t('common.createdDate')}
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-on-surface-variant">
                  {t('admin.operators.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr
                  key={invitation.id}
                  className="border-t border-outline-variant dark:border-slate-700"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                        <Mail className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-xs text-on-surface-variant">
                          {invitation.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitation.status)}
                      <span className={`text-sm font-medium ${
                        invitation.status === 'PENDING'
                          ? 'text-amber-600'
                          : invitation.status === 'ACCEPTED'
                          ? 'text-emerald-600'
                          : 'text-on-surface-variant'
                      }`}>
                        {getStatusLabel(invitation.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {invitation.tenantIds?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {invitation.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResend(invitation.id)}
                          disabled={actionLoading === invitation.id}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                          title={t('operators.resend')}
                        >
                          {actionLoading === invitation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRevoke(invitation.id)}
                          disabled={actionLoading === invitation.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 disabled:opacity-50"
                          title={t('operators.revoke')}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}