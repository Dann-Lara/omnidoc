'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { Bell, Pill, CheckCheck, ChevronRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function useFetch(url: string | null) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!url) return
    let active = true

    const doFetch = async () => {
      try {
        const res = await fetch(url, { credentials: 'include' })
        if (active && res.ok) {
          setData(await res.json())
        }
      } catch {}
    }

    doFetch()
    return () => { active = false }
  }, [url])

  const mutate = useCallback(async () => {
    if (!url) return
    try {
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        setData(await res.json())
      }
    } catch {}
  }, [url])

  return { data, mutate }
}

function useNotificationSSE(onEvent: () => void) {
  const savedCallback = useRef(onEvent)
  savedCallback.current = onEvent

  useEffect(() => {
    const es = new EventSource(`${API_URL}/notifications/events`, { withCredentials: true })
    es.onmessage = () => savedCallback.current()
    return () => es.close()
  }, [])
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [shake, setShake] = useState(false)
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { t } = useI18n()
  const prevCount = useRef(0)

  const { data: countData, mutate: mutateCount } = useFetch(
    `${API_URL}/notifications/count`
  )

  const { data: notifications, mutate: mutateList } = useFetch(
    isOpen ? `${API_URL}/notifications` : null
  )

  const count = countData?.count ?? 0
  const notifs = Array.isArray(notifications) ? notifications : []

  useEffect(() => {
    if (count > prevCount.current && prevCount.current > 0) {
      setShake(true)
    }
    prevCount.current = count
  }, [count])

  useEffect(() => {
    if (isOpen) {
      mutateCount()
      mutateList()
    }
  }, [isOpen, mutateCount, mutateList])

  useNotificationSSE(useCallback(() => {
    mutateCount()
    if (isOpen) mutateList()
  }, [mutateCount, mutateList, isOpen]))

  const handleMarkAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
      credentials: 'include',
    })
    mutateCount()
    mutateList()
  }

  const handleNotificationClick = async (n: any) => {
    console.log('[NotificationClick]', { type: n.type, noteId: n.noteId, isRead: n.isRead })

    if (!n.isRead) {
      try {
        await fetch(`${API_URL}/notifications/${n.id}/read`, {
          method: 'PATCH',
          credentials: 'include',
        })
      } catch (err) {
        console.error('[NotificationClick] Failed to mark as read', err)
      }
      mutateCount()
      mutateList()
    }

    if (n.noteId) {
      if (n.type === 'dispensing_pending') {
        router.push(`/${slug}/pharmacy/dispensing/pending?noteId=${n.noteId}`)
      } else if (n.type === 'dispensing_completed') {
        router.push(`/${slug}/pharmacy/dispensing`)
      }
    }

    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={shake ? { x: [0, -4, 4, -4, 4, -2, 2, 0] } : {}}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => setShake(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-surface-container dark:hover:bg-slate-800 transition-colors relative text-on-surface-variant"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-surface-container-lowest dark:bg-slate-900 rounded-xl shadow-xl border border-outline-variant/10 dark:border-slate-700 overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10 dark:border-slate-700">
                <span className="text-sm font-bold text-on-surface dark:text-white">
                  {t('notifications.title')}
                </span>
                {count > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    {t('notifications.markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-on-surface-variant dark:text-slate-500">
                    {t('notifications.empty')}
                  </div>
                ) : (
                  notifs.map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-container dark:hover:bg-slate-800 transition-colors border-b border-outline-variant/5 dark:border-slate-700/50 last:border-b-0 text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary-container dark:bg-secondary/20 flex items-center justify-center shrink-0">
                        <Pill className="w-4 h-4 text-on-secondary-container dark:text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface dark:text-white truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-on-surface-variant dark:text-slate-400 truncate">{n.message}</p>
                        )}
                        <p className="text-[10px] text-on-surface-variant/60 dark:text-slate-500 mt-0.5">
                          {formatRelativeTime(n.createdAt, t)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-outline-variant/10 dark:border-slate-700">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push(`/${slug}/pharmacy/dispensing/pending`)
                  }}
                  className="w-full flex items-center justify-between text-xs font-medium text-primary hover:underline"
                >
                  {t('notifications.viewAll')}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatRelativeTime(dateStr: string, t: any): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return t('common.justNow')
  if (diffMin < 60) return t('common.minutesAgo').replace('{min}', String(diffMin))
  if (diffHours < 24) return t('common.hoursAgo').replace('{hours}', String(diffHours))
  if (diffDays < 2) return t('common.yesterday')
  return t('common.daysAgo').replace('{days}', String(diffDays))
}
