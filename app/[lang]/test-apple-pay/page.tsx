'use client'

import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useTranslations } from '@/hooks/useTranslations'
import Header from '@/components/Header'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function TestApplePayPage() {
  const { t, loading, lang } = useTranslations()
  const [canPay, setCanPay] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const testApplePay = async () => {
      try {
        addLog('🔍 Iniciando test de Apple Pay...')
        
        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Stripe no inicializado')
        }
        addLog('✅ Stripe inicializado correctamente')

        // Crear Payment Request
        const pr = stripe.paymentRequest({
          country: 'ES',
          currency: 'eur',
          total: {
            label: 'IQ Test Result',
            amount: 50, // 0.50€
          },
          requestPayerName: true,
          requestPayerEmail: true,
        })
        addLog('✅ Payment Request creado')

        // Verificar si puede hacer pagos
        const paymentMethod = await pr.canMakePayment()
        addLog(`📊 Resultado de canMakePayment: ${JSON.stringify(paymentMethod)}`)

        if (paymentMethod) {
          setCanPay(paymentMethod)
          addLog(`✅ Apple Pay DISPONIBLE: ${paymentMethod.applePay ? 'SÍ' : 'NO'}`)
          addLog(`✅ Google Pay DISPONIBLE: ${paymentMethod.googlePay ? 'SÍ' : 'NO'}`)
        } else {
          setCanPay(null)
          addLog('❌ canMakePayment devolvió null - Apple Pay NO disponible')
          setError('Apple Pay no está disponible en este dispositivo/navegador')
        }

      } catch (err: any) {
        addLog(`❌ Error: ${err.message}`)
        setError(err.message)
      }
    }

    testApplePay()
  }, [])

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🍎 Test de Apple Pay
            </h1>

            {/* Resultado */}
            <div className="mb-8">
              {canPay ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-green-900 mb-4">
                    ✅ Apple Pay ESTÁ DISPONIBLE
                  </h2>
                  <div className="space-y-2">
                    <p className="text-green-800">
                      <strong>Apple Pay:</strong> {canPay.applePay ? '✅ Disponible' : '❌ No disponible'}
                    </p>
                    <p className="text-green-800">
                      <strong>Google Pay:</strong> {canPay.googlePay ? '✅ Disponible' : '❌ No disponible'}
                    </p>
                    <p className="text-green-800">
                      <strong>Método completo:</strong> {JSON.stringify(canPay)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-red-900 mb-4">
                    ❌ Apple Pay NO DISPONIBLE
                  </h2>
                  <p className="text-red-800">
                    {error || 'Apple Pay no está disponible en este dispositivo/navegador'}
                  </p>
                </div>
              )}
            </div>

            {/* Logs */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Logs de Diagnóstico</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm text-gray-700 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Información del Dispositivo */}
            <div className="mt-6 bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">📱 Información del Dispositivo</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
                <p><strong>Plataforma:</strong> {typeof window !== 'undefined' ? navigator.platform : 'N/A'}</p>
                <p><strong>Idioma:</strong> {typeof window !== 'undefined' ? navigator.language : 'N/A'}</p>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">📝 Instrucciones</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                <li>Esta página prueba si Apple Pay está disponible usando el Payment Request API</li>
                <li>Si ves "✅ Apple Pay ESTÁ DISPONIBLE" → El problema es del Payment Element, no del dispositivo</li>
                <li>Si ves "❌ Apple Pay NO DISPONIBLE" → El problema es del dispositivo/navegador/dominio</li>
                <li>Comparte los logs con el desarrollador para diagnóstico</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

