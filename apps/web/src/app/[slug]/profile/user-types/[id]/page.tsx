'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { Loader2, AlertTriangle } from 'lucide-react'
import UserTypeForm from '../components/UserTypeForm'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface UserTypeConfig {
  type: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  icon: string
  dashboard: string
  permissions: string[]
  canHaveSpecialties: boolean
}

export default function EditUserTypePage() {
  const { t } = useI18n()
  const params = useParams()
  const slug = params?.slug as string
  const id = params?.id as string

  const [userType, setUserType] = useState<UserTypeConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/team/user-types`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.[id]) {
          setUserType(data[id])
        } else {
          setNotFound(true)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !userType) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <AlertTriangle className="w-12 h-12 text-on-surface-variant/40 mb-4" />
        <p className="text-on-surface-variant font-medium mb-1">
          Tipo de usuario no encontrado
        </p>
        <p className="text-on-surface-variant/60 text-sm mb-6">
          El tipo &quot;{id}&quot; no existe o ha sido eliminado
        </p>
        <Link
          href={`/${slug}/profile/user-types`}
          className="text-primary font-semibold hover:underline"
        >
          Volver al listado
        </Link>
      </motion.div>
    )
  }

  return <UserTypeForm initialData={userType} typeKey={id} />
}
