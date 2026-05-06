'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

interface CalendarGridProps {
  selectedDate: string
  onSelect: (date: string) => void
  minDate?: string
  availableSlots?: Record<string, string[]>
}

export function CalendarGrid({ selectedDate, onSelect, minDate, availableSlots }: CalendarGridProps) {
  const { t, lang } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: adjustedFirstDay }, (_, i) => i)

  const months = lang === 'en' ? MONTHS_EN : MONTHS_ES

  const goPrev = () => setCurrentMonth(new Date(year, month - 1, 1))
  const goNext = () => setCurrentMonth(new Date(year, month + 1, 1))

  const isDisabled = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (minDate && dateStr < minDate) return true
    return false
  }

  const hasSlots = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return availableSlots?.[dateStr] && availableSlots[dateStr].length > 0
  }

  const slotCount = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return availableSlots?.[dateStr]?.length || 0
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
        </button>
        <span className="font-bold text-primary text-sm">
          {months[month]} {year}
        </span>
        <button
          onClick={goNext}
          className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-on-surface-variant" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] font-extrabold text-on-surface-variant/60 uppercase tracking-widest py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="h-9" />
        ))}
        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDate === dateStr
          const isToday = dateStr === todayStr
          const disabled = isDisabled(day)
          const slots = hasSlots(day)
          const count = slotCount(day)

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={`h-9 flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all relative
                ${isSelected
                  ? 'bg-primary text-white font-bold shadow-md'
                  : isToday
                    ? 'bg-primary-container/50 text-primary font-semibold ring-1 ring-primary/20'
                    : disabled
                      ? 'text-on-surface-variant/20 cursor-not-allowed'
                      : 'text-on-surface hover:bg-surface-container-high'
                }`}
            >
              {day}
              {slots && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 bg-primary rounded-full" />
              )}
              {slots && isSelected && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-secondary text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
