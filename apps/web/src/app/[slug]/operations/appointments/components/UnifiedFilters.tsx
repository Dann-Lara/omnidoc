'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { Search, User, Stethoscope, Calendar, X, ChevronDown } from 'lucide-react'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

interface Patient {
  id: string
  firstName: string
  lastName: string
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  specialties: {
    specialtyId: string
    specialty: { name: string }
  }[]
}

interface FilterState {
  userId?: string
  specialtyId?: string
  patientId?: string
  startDate?: Date
  endDate?: Date
}

interface UnifiedFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  patients: Patient[]
  teamMembers: TeamMember[]
}

export function UnifiedFilters({ filters, onFilterChange, patients, teamMembers }: UnifiedFiltersProps) {
  const { t } = useI18n()
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const patientRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  const doctorSpecialties = useMemo(() => {
    if (!filters.userId) return []
    const doctor = teamMembers.find(m => m.id === filters.userId)
    return doctor?.specialties?.filter(s => s.specialtyId && s.specialty?.name).map(s => ({
      id: s.specialtyId,
      name: s.specialty.name,
    })) || []
  }, [filters.userId, teamMembers])

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients
    const q = patientSearch.toLowerCase()
    return patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q)
    )
  }, [patients, patientSearch])

  const selectedPatient = patients.find(p => p.id === filters.patientId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (patientRef.current && !patientRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false)
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      setPatientSearch(`${selectedPatient.firstName} ${selectedPatient.lastName}`)
    } else {
      setPatientSearch('')
    }
  }, [filters.patientId])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-container-lowest dark:bg-slate-800 p-4 rounded-2xl mb-6 border border-surface-container dark:border-slate-700"
    >
      <div className="flex flex-wrap items-end gap-3">
        {/* Patient Search-Select */}
        <div ref={patientRef} className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold uppercase text-on-surface-variant dark:text-slate-400 flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />
            {t('appointments.agenda.patient')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" />
            <input
              className="w-full bg-surface-container dark:bg-slate-700 border border-outline-variant dark:border-slate-600 rounded-xl py-2.5 pl-10 pr-8 text-sm text-on-surface dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder={t('appointments.form.selectPatient')}
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value)
                setShowPatientDropdown(true)
              }}
              onFocus={() => setShowPatientDropdown(true)}
            />
            {filters.patientId && (
              <button
                onClick={() => {
                  onFilterChange({ ...filters, patientId: undefined })
                  setPatientSearch('')
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <AnimatePresence>
              {showPatientDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 mt-1 w-full bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant dark:border-slate-600 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                >
                  {filteredPatients.length === 0 ? (
                    <div className="p-3 text-xs text-on-surface-variant dark:text-slate-500">
                      {t('common.noResults')}
                    </div>
                  ) : (
                    filteredPatients.map(patient => (
                      <button
                        key={patient.id}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary/10 dark:hover:bg-primary/5 transition-colors text-on-surface dark:text-white truncate"
                        onClick={() => {
                          onFilterChange({ ...filters, patientId: patient.id })
                          setPatientSearch(`${patient.firstName} ${patient.lastName}`)
                          setShowPatientDropdown(false)
                        }}
                      >
                        {patient.firstName} {patient.lastName}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Doctor Select */}
        <div className="min-w-[180px] flex-1">
          <label className="text-[10px] font-bold uppercase text-on-surface-variant dark:text-slate-400 flex items-center gap-1 mb-1">
            <Stethoscope className="w-3 h-3" />
            {t('appointments.agenda.doctor')}
          </label>
          <div className="relative">
            <select
              className="w-full bg-surface-container dark:bg-slate-700 border border-outline-variant dark:border-slate-600 rounded-xl py-2.5 pl-3 pr-8 text-sm text-on-surface dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
              value={filters.userId || ''}
              onChange={(e) => onFilterChange({ ...filters, userId: e.target.value || undefined, specialtyId: undefined })}
            >
              <option value="">{t('appointments.directory.allUsers')}</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Specialty Select (conditional) */}
        <div className="min-w-[180px] flex-1">
          <label className="text-[10px] font-bold uppercase text-on-surface-variant dark:text-slate-400 flex items-center gap-1 mb-1">
            <Stethoscope className="w-3 h-3" />
            {t('appointments.agenda.specialty')}
          </label>
          {filters.userId ? (
            doctorSpecialties.length > 0 ? (
              <div className="relative">
                <select
                  className="w-full bg-surface-container dark:bg-slate-700 border border-outline-variant dark:border-slate-600 rounded-xl py-2.5 pl-3 pr-8 text-sm text-on-surface dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                  value={filters.specialtyId || ''}
                  onChange={(e) => onFilterChange({ ...filters, specialtyId: e.target.value || undefined })}
                >
                  <option value="">Todas las del médico</option>
                  {doctorSpecialties.map(spec => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none" />
              </div>
            ) : (
              <div className="px-3 py-2.5 bg-surface-container/50 dark:bg-slate-700/50 border border-dashed border-outline-variant/50 dark:border-slate-600/50 rounded-xl text-xs text-on-surface-variant dark:text-slate-500">
                Sin especialidades asignadas
              </div>
            )
          ) : (
            <div className="px-3 py-2.5 bg-surface-container/50 dark:bg-slate-700/50 border border-dashed border-outline-variant/50 dark:border-slate-600/50 rounded-xl text-xs text-on-surface-variant dark:text-slate-500">
              Selecciona un médico primero
            </div>
          )}
        </div>

        {/* Date Range Picker */}
        <div ref={dateRef} className="min-w-[220px]">
          <label className="text-[10px] font-bold uppercase text-on-surface-variant dark:text-slate-400 flex items-center gap-1 mb-1">
            <Calendar className="w-3 h-3" />
            Rango de fechas
          </label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`w-full bg-surface-container dark:bg-slate-700 border rounded-xl py-2.5 px-3 text-sm text-left flex items-center justify-between transition-all ${
              filters.startDate
                ? 'border-primary ring-2 ring-primary/10'
                : 'border-outline-variant dark:border-slate-600'
            }`}
          >
            <span className="text-on-surface dark:text-white">
              {filters.startDate && filters.endDate
                ? `${filters.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${filters.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                : filters.startDate
                ? `${filters.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                : 'Seleccionar rango'}
            </span>
            {filters.startDate && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFilterChange({ ...filters, startDate: undefined, endDate: undefined })
                }}
                className="text-on-surface-variant hover:text-error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </button>
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 mt-2 bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-2xl border border-surface-container dark:border-slate-700 overflow-hidden"
              style={{ maxWidth: '520px' }}
            >
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowDatePicker(false)
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Cerrar
                </button>
              </div>
              <DateRange
                ranges={[{
                  startDate: filters.startDate || new Date(),
                  endDate: filters.endDate || new Date(),
                  key: 'selection',
                }]}
                onChange={(ranges) => {
                  if (ranges.selection?.startDate && ranges.selection?.endDate) {
                    onFilterChange({
                      ...filters,
                      startDate: ranges.selection.startDate,
                      endDate: ranges.selection.endDate,
                    })
                  }
                }}
                months={2}
                direction="horizontal"
                className="dark:reactDateRangeDark"
              />
            </motion.div>
          )}
        </div>

        {/* Clear All */}
        {(filters.userId || filters.specialtyId || filters.patientId || filters.startDate) && (
          <button
            onClick={() => onFilterChange({})}
            className="px-4 py-2.5 text-xs font-bold text-error hover:bg-error/5 rounded-xl transition-colors border border-error/20"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Active filter chips */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-surface-container dark:border-slate-700">
        {filters.patientId && selectedPatient && (
          <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/5 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-primary">Paciente:</span>
            <span className="text-xs font-semibold text-primary">{selectedPatient.firstName} {selectedPatient.lastName}</span>
          </div>
        )}
        {filters.userId && (
          <div className="flex items-center gap-2 bg-tertiary/10 dark:bg-tertiary/5 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-tertiary-container">Médico:</span>
            <span className="text-xs font-semibold text-tertiary-container">
              {teamMembers.find(m => m.id === filters.userId)?.firstName} {teamMembers.find(m => m.id === filters.userId)?.lastName}
            </span>
          </div>
        )}
        {filters.specialtyId && (
          <div className="flex items-center gap-2 bg-secondary-container/20 dark:bg-secondary/5 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-on-secondary-container">Especialidad:</span>
            <span className="text-xs font-semibold text-on-secondary-container">
              {doctorSpecialties.find(s => s.id === filters.specialtyId)?.name}
            </span>
          </div>
        )}
        {filters.startDate && filters.endDate && (
          <div className="flex items-center gap-2 bg-surface-container dark:bg-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-bold text-on-surface-variant">Fechas:</span>
            <span className="text-xs font-semibold text-on-surface-variant">
              {filters.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {filters.endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
