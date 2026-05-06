'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  X,
  Video,
  Stethoscope
} from 'lucide-react'

interface AppointmentData {
  patientName: string
  doctorName: string
  date: string
  time: string
  location: string
  specialty: string
  mode: 'IN_PERSON' | 'TELEHEALTH'
}

interface ConfirmAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: AppointmentData
}

export function ConfirmAppointmentModal({ isOpen, onClose, appointment }: ConfirmAppointmentModalProps) {
  const { t } = useI18n()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 max-w-lg w-full bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-primary tracking-tight">
                  {t('appointments.emailConfirm.title')}
                </h2>
                <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                  {t('appointments.emailConfirm.subtitle')}
                </p>
              </div>
            </div>

            <div className="mx-8 rounded-xl overflow-hidden border border-outline-variant/20">
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {t('appointments.emailConfirm.patient')}
                    </p>
                    <p className="text-on-surface font-semibold text-sm mt-0.5">{appointment.patientName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container/30 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4 text-secondary-container" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {t('appointments.emailConfirm.doctor')}
                    </p>
                    <p className="text-on-surface font-semibold text-sm mt-0.5">{appointment.doctorName}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{appointment.specialty}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-tertiary-container/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-tertiary-container" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {t('appointments.emailConfirm.date')}
                    </p>
                    <p className="text-on-surface font-semibold text-sm mt-0.5">{appointment.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {t('appointments.emailConfirm.time')}
                    </p>
                    <p className="text-on-surface font-semibold text-sm mt-0.5">{appointment.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                    {appointment.mode === 'TELEHEALTH' ? (
                      <Video className="w-4 h-4 text-on-surface-variant" />
                    ) : (
                      <MapPin className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {t('appointments.emailConfirm.location')}
                    </p>
                    <p className="text-on-surface font-semibold text-sm mt-0.5">
                      {appointment.mode === 'TELEHEALTH'
                        ? t('appointments.emailConfirm.telehealth')
                        : appointment.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-6 space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                <Calendar className="w-4 h-4" />
                {t('appointments.emailConfirm.addToCalendar')}
              </button>
              <button
                onClick={onClose}
                className="w-full text-on-surface-variant font-bold py-3 rounded-xl hover:bg-surface-container-high transition-colors text-sm"
              >
                {t('appointments.emailConfirm.close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
