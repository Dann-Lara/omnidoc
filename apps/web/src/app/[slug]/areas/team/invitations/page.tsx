'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
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
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Invitation {
  id: string;
  email: string;
  userType: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  specialtyIds: string[];
  expiresAt: string;
  createdAt: string;
  role?: {
    name: string;
  };
}

export default function TeamInvitationsPage() {
  const { lang, t } = useI18n();
  const params = useParams();
  const slug = params.slug as string;

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`${API_URL}/team/invitations`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    setActionLoading(invitationId);
    try {
      const res = await fetch(`${API_URL}/team/invite/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitationId }),
      });
      if (res.ok) {
        await fetchInvitations();
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!confirm(t('team.invitations.confirmRevoke'))) {
      return;
    }
    setActionLoading(invitationId);
    try {
      const res = await fetch(`${API_URL}/team/invite/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitationId }),
      });
      if (res.ok) {
        await fetchInvitations();
      }
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'EXPIRED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'REVOKED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { es: string; en: string }> = {
      PENDING: { es: 'Pendiente', en: 'Pending' },
      ACCEPTED: { es: 'Aceptada', en: 'Accepted' },
      EXPIRED: { es: 'Expirada', en: 'Expired' },
      REVOKED: { es: 'Revocada', en: 'Revoked' },
    };
    return labels[status]?.[lang] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EXPIRED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'REVOKED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}/areas/team`}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight">
              {t('team.invitations.title')}
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              {t('team.invitations.manageDesc')}
            </p>
          </div>
        </div>
        <Link
          href={`/${slug}/areas/team/add`}
          className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('team.invitations.newInvitation')}
        </Link>
      </motion.div>

      {invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">
            {t('team.invitations.noPending')}
          </h2>
          <p className="text-on-surface-variant mb-6">
            {t('team.invitations.sendToAdd')}
          </p>
          <Link
            href={`/${slug}/areas/team/add`}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {t('teamInvitations.createInvitation')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-surface-container-low rounded-xl p-6 border-l-4 ${
                invitation.status === 'PENDING'
                  ? 'border-amber-400'
                  : invitation.status === 'ACCEPTED'
                  ? 'border-emerald-400'
                  : 'border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-on-surface-variant" />
                    <span className="font-semibold text-on-surface">
                      {invitation.email}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        invitation.status
                      )} flex items-center gap-1`}
                    >
                      {getStatusIcon(invitation.status)}
                      {getStatusLabel(invitation.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                    <span>
                      {t('teamInvitations.role')}: {invitation.userType}
                    </span>
                    <span>
                      {t('teamInvitations.created')}: {new Date(invitation.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      {t('teamInvitations.expires')}: {new Date(invitation.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invitation.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleResend(invitation.id)}
                        disabled={actionLoading === invitation.id}
                        className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                        title={t('teamInvitations.resend')}
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
                        className="p-2 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                        title={t('teamInvitations.revoke')}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}