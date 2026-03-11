// app/[lang]/checkout/checkout-router.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import { useTranslations } from '@/hooks/useTranslations'

export default function CheckoutRouter() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userIQ, setUserIQ] = useState<number | null>(null)
  const [status, setStatus] = useState('Inicializando...')
  const [error, setError] = useState('')

  useEffect(() => {
    const initCheckout = async () => {
      try {
        // Cargar datos del usuario
        const storedEmail = localStorage.getItem('userEmail')
        const storedUserName = localStorage.getItem('userName')
        const storedIQ = localStorage.getItem('userIQ')
        const testType = localStorage.getItem('testType') || 'iq'

        // Validar que al menos haya email (requerido para todos los tests)
        if (!storedEmail) {
          router.push(`/${lang}/resultado-estimado`)
          return
        }

        setEmail(storedEmail)
        setUserName(storedUserName || 'Usuario')
        
        // Solo setear IQ si es test de IQ y existe el valor
        if (storedIQ) {
          setUserIQ(parseInt(storedIQ))
        }

        setStatus('Redirigiendo al checkout...')

        router.push(`/${lang}/checkout-payment?` + new URLSearchParams({
          email: storedEmail,
          testType: testType,
          lang: lang || 'es'
        }).toString())

      } catch (error: any) {
        console.error('❌ Error en checkout:', error)
        setError(error.message || 'Error al inicializar el checkout')
        setStatus('Error')
      }
    }

    initCheckout()
  }, [router, lang])

  return (
    <>
      <MinimalHeader email={email} />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t?.checkout?.error || 'Error'}
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push(`/${lang}/resultado-estimado`)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t?.checkout?.tryAgain || 'Volver a intentar'}
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t?.checkout?.preparing || 'Preparando pago...'}
              </h2>
              <p className="text-gray-600 mb-2">{status}</p>
              <p className="text-sm text-gray-500">
                {t?.checkout?.pleaseWait || 'Por favor, espera un momento'}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

