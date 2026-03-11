'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'

export const dynamic = 'force-dynamic'

const testConfig: Record<string, { title: string; subtitle: string; icon: string }> = {
  iq:          { title: 'Descubre tu nivel de inteligencia',      subtitle: 'Acceso completo a tu análisis de CI',       icon: '🧠' },
  personality: { title: 'Descubre tu perfil de personalidad',     subtitle: 'Conoce los 5 rasgos de tu personalidad',    icon: '🎭' },
  adhd:        { title: 'Descubre tu evaluación de TDAH',         subtitle: 'Análisis completo de síntomas de TDAH',     icon: '⚡' },
  anxiety:     { title: 'Descubre tu nivel de ansiedad',          subtitle: 'Evaluación personalizada de ansiedad',      icon: '💆' },
  depression:  { title: 'Descubre tu evaluación de depresión',    subtitle: 'Análisis de síntomas depresivos',           icon: '🌱' },
  eq:          { title: 'Descubre tu inteligencia emocional',     subtitle: 'Conoce tu cociente emocional completo',     icon: '❤️' },
}

function CheckoutPaymentContent() {
  const searchParams  = useSearchParams()
  const [email, setEmail]       = useState('')
  const [testType, setTestType] = useState('iq')
  const [lang, setLang]         = useState('es')
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [sessionError, setSessionError]     = useState('')

  // Cargar datos de URL params
  useEffect(() => {
    const e  = searchParams.get('email')    || ''
    const tt = searchParams.get('testType') || 'iq'
    const l  = searchParams.get('lang')     || 'es'
    setEmail(e)
    setTestType(tt)
    setLang(l)
  }, [searchParams])

  // Inicializar Stripe con la clave pública
  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (pk) setStripePromise(loadStripe(pk))
  }, [])

  // Crear la sesión embebida
  const fetchClientSecret = useCallback(async (): Promise<string> => {
    if (!email) throw new Error('Email no disponible')
    setLoadingSession(true)
    setSessionError('')
    try {
      let testData: any = {}
      try {
        const raw = localStorage.getItem('testResults')
        if (raw) {
          const p = JSON.parse(raw)
          testData = { answers: p.answers || [], timeElapsed: p.timeElapsed || 0, correctAnswers: p.correctAnswers || 0, categoryScores: p.categoryScores || {} }
        }
      } catch {}

      const res = await fetch('/api/stripe/create-embedded-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lang,
          testType,
          userName: email.split('@')[0],
          userIQ: localStorage.getItem('userIQ') || 100,
          testData,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error creando sesión de pago')
      setLoadingSession(false)
      return data.clientSecret as string
    } catch (e: any) {
      setSessionError(e.message || 'Error al cargar el checkout')
      setLoadingSession(false)
      throw e
    }
  }, [email, lang, testType])

  const config = testConfig[testType] || testConfig['iq']

  return (
    <div className="min-h-screen bg-secondary-950 neural-bg">

      {/* Header */}
      <header className="bg-secondary-900/80 backdrop-blur-xl border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🧠</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Brain</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400"> Metric</span>
            </span>
          </div>
          <div className="text-sm text-gray-400 truncate max-w-[200px]">{email}</div>
        </div>
      </header>

      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{config.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-gray-400 text-base">{config.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* LEFT — beneficios + resumen */}
            <div className="space-y-5 order-2 lg:order-1">

              {/* Resumen del pedido */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="text-base font-bold text-white mb-4">Resumen del pedido</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Acceso a tu resultado</span>
                    <span className="text-white font-bold">0,50€</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-gray-300">2 días Premium gratis</span>
                      <p className="text-xs text-gray-500 mt-0.5">Luego 19,99€/mes · Cancela cuando quieras</p>
                    </div>
                    <span className="text-primary-400 font-bold ml-4">GRATIS</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="font-bold text-white">Total hoy</span>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">0,50€</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Cancela antes de los 2 días y no se te cobrará nada más
                </p>
              </div>

              {/* Beneficios */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="text-base font-bold text-white mb-4">¿Qué incluye?</h3>
                <div className="space-y-3">
                  {[
                    { icon: '📊', title: 'Resultado completo y detallado' },
                    { icon: '🏆', title: 'Certificado oficial descargable' },
                    { icon: '🌍', title: 'Comparación mundial' },
                    { icon: '🔓', title: 'Acceso a todos los tests' },
                    { icon: '📈', title: 'Análisis por categorías' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl">{f.icon}</span>
                      <span className="text-gray-300 text-sm">{f.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Garantía */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                <span className="text-xl">🛡️</span>
                <span className="font-semibold text-yellow-300 text-sm ml-2">Garantía de devolución</span>
                <a href={`/${lang}/reembolso`} className="text-xs text-yellow-400/70 underline ml-2">Ver política</a>
              </div>
            </div>

            {/* RIGHT — Stripe Embedded Checkout */}
            <div className="order-1 lg:order-2">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">

                {sessionError ? (
                  <div className="p-8 text-center">
                    <p className="text-red-400 text-sm mb-4">{sessionError}</p>
                    <button
                      onClick={() => fetchClientSecret()}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : !email ? (
                  <div className="p-8 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stripePromise ? (
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ fetchClientSecret }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                ) : (
                  <div className="p-8 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-6 px-4 mt-8">
        <p className="text-center text-gray-500 text-sm">© 2026 Brain Metric. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default function CheckoutPayment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutPaymentContent />
    </Suspense>
  )
}
