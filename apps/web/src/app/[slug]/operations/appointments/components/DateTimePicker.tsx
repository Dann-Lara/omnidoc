'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateTimePickerProps {
  date: string
  time: string
  onSelect: (date: string, time: string) => void
}

export function DateTimePicker({ date, time, onSelect }: DateTimePickerProps) {
  const { t } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (date) {
      return new Date(date + 'T00:00:00')
    }
    return new Date()
  })

  const availableSlots = ['09:15 AM', '10:30 AM', '11:45 AM', '02:15 PM']

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    const dateStr = selectedDate.toISOString().split('T')[0]
    onSelect(dateStr, time)
  }

  const handleTimeClick = (slot: string) => {
    onSelect(date, slot)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary tracking-tight">
          Clinical Hours
        </h2>
        <span className="text-xs font-bold text-surface-tint">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
      </div>

      {/* Calendar Widget */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
          </button>
          <span className="text-sm font-bold text-primary">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4 text-center">
          {['M', 'T', 'W', 'T2', 'F', 'S', 'S2'].map((d, index) => (
            <div key={`day-header-${index}`} className="text-[10px] font-extrabold text-outline uppercase tracking-widest">{d.replace('2', '')}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {blanks.map((blank) => (
            <div key={`blank-${blank}`} className="h-10" />
          ))}
          {days.map((day) => {
            const dateStr = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            ).toISOString().split('T')[0]
            const isSelected = date === dateStr
            const isToday = dateStr === new Date().toISOString().split('T')[0]
            
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDateClick(day)}
                className={`h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                  isSelected 
                    ? 'bg-primary text-white font-bold shadow-md' 
                    : isToday
                    ? 'bg-primary-container text-on-primary-container'
                    : 'hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {day}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 bg-surface-tint rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Available Slots */}
        <div className="mt-8 space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-outline ml-1">
            Available Slots
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => handleTimeClick(slot)}
                className={`py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                  time === slot
                    ? 'bg-primary-container text-white shadow-md ring-2 ring-primary ring-offset-2'
                    : 'bg-surface-container text-on-surface hover:bg-primary-container hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
