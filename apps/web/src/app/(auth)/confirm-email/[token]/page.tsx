'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Status = 'loading' | 'success' | 'error'

export default function ConfirmEmailPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      confirmEmail()
    }
  }, [token])

  const confirmEmail = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/confirm-email/${token}`, {
        method: 'PUT',
      })
      const data = await res.json()

      if (res.ok && data.message) {
        setStatus('success')
        setMessage(data.message)
        setTimeout(() => {
          router.push('/login?confirmed=true')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Error al confirmar el email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Error de conexión. Intenta nuevamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface-container-low rounded-2xl p-8 shadow-lg border border-outline-variant"
      >
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface mb-2">
              Confirmando tu email...
            </h1>
            <p className="text-on-surface-variant">
              Por favor espera mientras verificamos tu correo electrónico.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface mb-2">
              ¡Email Confirmado!
            </h1>
            <p className="text-on-surface-variant mb-4">
              {message || 'Tu cuenta ha sido verificada exitosamente.'}
            </p>
            <p className="text-sm text-on-surface-variant mb-6">
              Redirigiendo a inicio de sesión...
            </p>
            <Link
              href="/login?confirmed=true"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Mail className="w-5 h-5" />
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-error" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface mb-2">
              Error de Confirmación
            </h1>
            <p className="text-on-surface-variant mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Crear Nueva Cuenta
              </Link>
              <Link
                href="/login"
                className="block w-full py-3 px-6 border border-outline-variant text-on-surface font-semibold rounded-xl hover:bg-surface-container transition-colors"
              >
                Ir a Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
