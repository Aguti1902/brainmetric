'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

export const dynamic = 'force-dynamic'

const TIMER_SECONDS = 5 * 60 // 5 minutos

const reviews = [
  { name: 'Laura S.',     flag: '🇪🇸', stars: 5, text: '"Rápido, fácil y muy informativo. Me sorprendió mi puntuación."' },
  { name: 'Carlos M.',    flag: '🇲🇽', stars: 5, text: '"El análisis es muy detallado. Lo recomiendo a todos."' },
  { name: 'Ana R.',       flag: '🇦🇷', stars: 5, text: '"Nunca pensé que sería tan preciso. ¡Increíble!"' },
  { name: 'David P.',     flag: '🇨🇴', stars: 5, text: '"El certificado quedó genial. Mi jefe quedó impresionado."' },
  { name: 'Sofía T.',     flag: '🇪🇸', stars: 5, text: '"Muy buena experiencia. La comparativa mundial es lo mejor."' },
]

function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window === 'undefined') return seconds
    const saved = sessionStorage.getItem('checkout_timer')
    if (saved) {
      const remaining = Math.floor((parseInt(saved) - Date.now()) / 1000)
      return remaining > 0 ? remaining : 0
    }
    const end = Date.now() + seconds * 1000
    sessionStorage.setItem('checkout_timer', String(end))
    return seconds
  })

  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  return { mm, ss, expired: timeLeft === 0, timeLeft }
}

const testConfig: Record<string, { title: string; subtitle: string; icon: string }> = {
  iq:          { title: 'Descubre tu nivel de inteligencia',   subtitle: 'Acceso completo a tu análisis de CI',       icon: '🧠' },
  personality: { title: 'Descubre tu perfil de personalidad', subtitle: 'Conoce los 5 rasgos de tu personalidad',    icon: '🎭' },
  adhd:        { title: 'Descubre tu evaluación de TDAH',     subtitle: 'Análisis completo de síntomas de TDAH',     icon: '⚡' },
  anxiety:     { title: 'Descubre tu nivel de ansiedad',      subtitle: 'Evaluación personalizada de ansiedad',      icon: '💆' },
  depression:  { title: 'Descubre tu evaluación de depresión', subtitle: 'Análisis de síntomas depresivos',          icon: '🌱' },
  eq:          { title: 'Descubre tu inteligencia emocional', subtitle: 'Conoce tu cociente emocional completo',     icon: '❤️' },
}

const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#7C3AED',
    colorBackground: '#1a1a2e',
    colorText: '#F9FAFB',
    colorTextSecondary: '#9CA3AF',
    colorTextPlaceholder: '#6B7280',
    colorDanger: '#F87171',
    borderRadius: '10px',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    fontSizeSm: '13px',
    spacingUnit: '4px',
    gridRowSpacing: '16px',
    gridColumnSpacing: '16px',
  },
  rules: {
    '.Input': {
      backgroundColor: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#F9FAFB',
      boxShadow: 'none',
      padding: '12px 14px',
    },
    '.Input:focus': {
      border: '1px solid #7C3AED',
      boxShadow: '0 0 0 3px rgba(124,58,237,0.2)',
      outline: 'none',
    },
    '.Input::placeholder': { color: '#6B7280' },
    '.Label': { color: '#D1D5DB', fontWeight: '500', fontSize: '13px' },
    '.Tab': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#D1D5DB',
    },
    '.Tab:hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: '#F9FAFB' },
    '.Tab--selected': {
      backgroundColor: 'rgba(124,58,237,0.25)',
      border: '1px solid #7C3AED',
      color: '#F9FAFB',
    },
    '.Error': { color: '#F87171' },
    '.Block': {
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    },
  },
}

// ─── Formulario de pago (debe estar dentro de <Elements>) ────────────────────
function PaymentForm({
  lang,
  onError,
}: {
  lang: string
  onError: (msg: string) => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const router   = useRouter()

  const [loading,   setLoading]   = useState(false)
  const [cardReady, setCardReady] = useState(false)

  const returnUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${lang}/resultado?payment=success`
    : `https://brainmetric.io/${lang}/resultado?payment=success`

  const handlePayment = async () => {
    if (!stripe || !elements || loading) return
    setLoading(true)
    onError('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Error al procesar el pago')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      router.push(`/${lang}/resultado?payment=success&payment_intent=${paymentIntent.id}`)
    }
  }

  return (
    <div className="space-y-4">

      {/* PaymentElement con wallets habilitados — muestra Apple Pay / Google Pay automáticamente */}
      <div className={`transition-opacity duration-300 ${cardReady ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <PaymentElement
          onReady={() => setCardReady(true)}
          options={{
            layout: { type: 'tabs', defaultCollapsed: false },
            wallets: { applePay: 'auto', googlePay: 'auto' },
            paymentMethodOrder: ['apple_pay', 'google_pay', 'card'],
          }}
        />
      </div>

      {!cardReady && (
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || !elements || loading || !cardReady}
        className="w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-200
          bg-gradient-to-r from-primary-600 to-accent-500
          hover:from-primary-500 hover:to-accent-400
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-primary-900/40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            Procesando...
          </span>
        ) : (
          '🧠 Descubre tu CI ahora'
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        Al continuar aceptas los{' '}
        <a href={`/${lang}/terminos`} className="underline hover:text-gray-300">Términos</a> y la{' '}
        <a href={`/${lang}/privacidad`} className="underline hover:text-gray-300">Política de privacidad</a>
      </p>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
function CheckoutPaymentContent() {
  const searchParams = useSearchParams()

  const [email,          setEmail]          = useState('')
  const [testType,       setTestType]       = useState('iq')
  const [lang,           setLang]           = useState('es')
  const [clientSecret,   setClientSecret]   = useState('')
  const [stripePromise,  setStripePromise]  = useState<Promise<StripeType | null> | null>(null)
  const [sessionError,   setSessionError]   = useState('')
  const [loadingSession, setLoadingSession] = useState(true)
  const initRef = useRef(false)

  useEffect(() => {
    setEmail(searchParams.get('email')    || '')
    setTestType(searchParams.get('testType') || 'iq')
    setLang(searchParams.get('lang')     || 'es')
  }, [searchParams])

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (pk) setStripePromise(loadStripe(pk))
  }, [])

  useEffect(() => {
    if (!email || initRef.current) return
    initRef.current = true

    const init = async () => {
      try {
        let testData: Record<string, unknown> = {}
        try {
          const raw = localStorage.getItem('testResults')
          if (raw) {
            const p = JSON.parse(raw)
            testData = {
              answers: p.answers || [],
              timeElapsed: p.timeElapsed || 0,
              correctAnswers: p.correctAnswers || 0,
            }
          }
        } catch {}

        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            lang,
            testType,
            userName: email.split('@')[0],
            userIQ: localStorage.getItem('userIQ') || 0,
            testData,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error creando sesión')
        setClientSecret(data.clientSecret)
      } catch (e: any) {
        setSessionError(e.message || 'Error al cargar el checkout')
      } finally {
        setLoadingSession(false)
      }
    }

    init()
  }, [email, lang, testType])

  const config = testConfig[testType] || testConfig['iq']
  const { mm, ss } = useCountdown(TIMER_SECONDS)
  const [reviewIdx, setReviewIdx] = useState(0)

  // Rotar reseñas cada 4 s
  useEffect(() => {
    const id = setInterval(() => setReviewIdx(i => (i + 1) % reviews.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-secondary-950 neural-bg">

      {/* Header */}
      <header className="bg-secondary-900/80 backdrop-blur-xl border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/BRAINMETRIC/LOGO.png"
            alt="Brain Metric"
            className="h-9 w-auto object-contain"
          />
          {email && <div className="text-sm text-gray-400 truncate max-w-[200px]">{email}</div>}
        </div>
      </header>

      <div className="py-8 px-4 pb-16">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{config.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-gray-400">{config.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* LEFT — resumen + beneficios + reseñas */}
            <div className="space-y-5 order-2 lg:order-1">

              {/* Resumen del pedido */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="font-bold text-white mb-4">Resumen del pedido</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Acceso a tu resultado</span>
                    <span className="font-bold text-white">0,50€</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-gray-300">2 días Premium gratis</span>
                      <p className="text-xs text-gray-500 mt-0.5">Luego 29,99€/mes · Cancela cuando quieras</p>
                    </div>
                    <span className="text-primary-400 font-bold ml-4 flex-shrink-0">GRATIS</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between">
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
                <h3 className="font-bold text-white mb-4">¿Qué incluye?</h3>
                <div className="space-y-3">
                  {[
                    { icon: '📊', label: 'Resultado completo y detallado' },
                    { icon: '🏆', label: 'Certificado oficial descargable' },
                    { icon: '🌍', label: 'Comparación mundial' },
                    { icon: '🔓', label: 'Acceso a todos los tests' },
                    { icon: '📈', label: 'Análisis por categorías' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3">
                      <span className="text-xl w-7 text-center">{f.icon}</span>
                      <span className="text-gray-300 text-sm">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reseñas de usuarios */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⭐</span>
                  <h3 className="font-bold text-white">Lo que dicen nuestros usuarios</h3>
                  <span className="ml-auto text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                    4.9 / 5
                  </span>
                </div>

                {/* Reseña activa con transición */}
                <div className="relative min-h-[90px]">
                  {reviews.map((r, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 transition-all duration-500 ${
                        i === reviewIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-semibold">{r.name}</span>
                            <span>{r.flag}</span>
                            <span className="text-yellow-400 text-xs">{'★'.repeat(r.stars)}</span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{r.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Puntos de navegación */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {reviews.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReviewIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        i === reviewIdx ? 'bg-primary-400 w-4' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Garantía */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center text-sm">
                <span className="text-xl">🛡️</span>
                <span className="font-semibold text-yellow-300 ml-2">Garantía de devolución</span>
                <a href={`/${lang}/reembolso`} className="text-xs text-yellow-400/70 underline ml-2">Ver política</a>
              </div>
            </div>

            {/* RIGHT — Stripe */}
            <div className="order-1 lg:order-2">

              {/* Tarjeta de oferta con contador */}
              <div className="mb-4 rounded-2xl p-4 border transition-all duration-500 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border-violet-500/30">
                <div className="flex items-center justify-between gap-4">
                    {/* Precios */}
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">🎉 Precio especial de lanzamiento</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-500 line-through text-base">29,99€</span>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300">
                          0,50€
                        </span>
                      </div>
                      <p className="text-xs text-violet-400/80 mt-0.5">Ahorra 29,49€ hoy</p>
                    </div>
                    {/* Contador */}
                    <div className="text-center flex-shrink-0">
                      <p className="text-xs text-gray-400 mb-1">Expira en</p>
                      <div className={`font-mono font-black text-2xl tracking-widest px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 ${
                        parseInt(mm) === 0 ? 'text-red-400 animate-pulse' : 'text-white'
                      }`}>
                        {mm}:{ss}
                      </div>
                    </div>
                  </div>
              </div>

              <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg">🔒</span>
                  <h2 className="font-bold text-white">Pago seguro</h2>
                  <span className="ml-auto text-xs text-gray-500">
                    Powered by <strong className="text-gray-400">Stripe</strong>
                  </span>
                </div>

                {sessionError ? (
                  <div className="text-center py-6">
                    <p className="text-red-400 text-sm mb-4">{sessionError}</p>
                    <button
                      onClick={() => {
                        initRef.current = false
                        setSessionError('')
                        setLoadingSession(true)
                        setClientSecret('')
                      }}
                      className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-500"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : loadingSession || !clientSecret || !stripePromise ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-4">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Preparando pago seguro...</p>
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: stripeAppearance,
                      locale: (
                        lang === 'es' ? 'es' :
                        lang === 'fr' ? 'fr' :
                        lang === 'de' ? 'de' :
                        lang === 'pt' ? 'pt-BR' :
                        lang === 'it' ? 'it' : 'en'
                      ) as any,
                    }}
                  >
                    <PaymentForm lang={lang} onError={setSessionError} />
                  </Elements>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                <span>🔒 SSL</span>
                <span>✅ PCI DSS</span>
                <span>🛡️ Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-5 px-4">
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
