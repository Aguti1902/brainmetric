'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FaLock, FaBrain, FaChartLine, FaCertificate, FaUsers, FaShieldAlt, FaCreditCard, FaStar, FaCheck } from 'react-icons/fa'

export const dynamic = 'force-dynamic'

const reviews = [
  { name: 'María G.', rating: 5, text: 'Muy profesional y detallado. Me ayudó a entenderme mejor.', country: '🇪🇸' },
  { name: 'Carlos R.', rating: 5, text: 'Resultados precisos y el certificado es muy útil.', country: '🇲🇽' },
  { name: 'Ana P.', rating: 5, text: 'Excelente experiencia, lo recomiendo totalmente.', country: '🇦🇷' },
  { name: 'David M.', rating: 5, text: 'El análisis por categorías es muy completo.', country: '🇨🇴' },
  { name: 'Laura S.', rating: 5, text: 'Rápido, fácil y muy informativo.', country: '🇨🇱' },
]

const plans = [
  {
    id: 'monthly',
    name: 'Plan Mensual',
    price: '19,99€',
    period: '/mes',
    billing: 'Facturación mensual',
    badge: '⭐ Más popular',
    badgeColor: 'bg-primary-500',
    highlight: true,
  },
  {
    id: 'biweekly',
    name: 'Plan Quincenal',
    price: '9,99€',
    period: '/15 días',
    billing: 'Facturación cada 15 días',
    badge: '💡 Más flexible',
    badgeColor: 'bg-accent-500',
    highlight: false,
  },
]

const testConfig: Record<string, { title: string; subtitle: string; icon: string }> = {
  iq: { title: 'Desbloquea tu Resultado de CI', subtitle: 'Acceso completo a tu análisis de CI', icon: '🧠' },
  personality: { title: 'Desbloquea tu Perfil de Personalidad', subtitle: 'Descubre los 5 rasgos de tu personalidad', icon: '🎭' },
  adhd: { title: 'Desbloquea tu Evaluación de TDAH', subtitle: 'Análisis completo de síntomas de TDAH', icon: '⚡' },
  anxiety: { title: 'Desbloquea tu Evaluación de Ansiedad', subtitle: 'Evaluación de niveles de ansiedad', icon: '💆' },
  depression: { title: 'Desbloquea tu Evaluación de Depresión', subtitle: 'Evaluación de síntomas depresivos', icon: '🌱' },
  eq: { title: 'Desbloquea tu Inteligencia Emocional', subtitle: 'Descubre tu inteligencia emocional', icon: '❤️' },
}

function CheckoutPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [testType, setTestType] = useState('iq')
  const [lang, setLang] = useState('es')
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'biweekly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentReview, setCurrentReview] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCurrentReview(p => (p + 1) % reviews.length), 4500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const e = searchParams.get('email') || ''
    const tt = searchParams.get('testType') || 'iq'
    const l = searchParams.get('lang') || 'es'
    setEmail(e)
    setTestType(tt)
    setLang(l)
    if (!e) setError('Email no proporcionado')
  }, [searchParams])

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')
    try {
      let testData: any = {}
      const raw = localStorage.getItem('testResults')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          testData = {
            answers: parsed.answers || [],
            timeElapsed: parsed.timeElapsed || 0,
            correctAnswers: parsed.correctAnswers || 0,
            categoryScores: parsed.categoryScores || {},
          }
        } catch {}
      }

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lang,
          testType,
          planType: selectedPlan,
          userName: email.split('@')[0],
          userIQ: localStorage.getItem('userIQ') || 100,
          testData,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error creando la sesión de pago')
      if (data.url) window.location.href = data.url
      else throw new Error('No se recibió URL de checkout')
    } catch (e: any) {
      setError(e.message || 'Error al iniciar el pago. Inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  const config = testConfig[testType] || testConfig['iq']
  const activePlan = plans.find(p => p.id === selectedPlan)!

  return (
    <div className="min-h-screen bg-secondary-950 neural-bg">
      {/* Header */}
      <header className="bg-secondary-900/80 backdrop-blur-xl border-b border-white/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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

      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-block text-5xl mb-3">{config.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-gray-400 text-lg">{config.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT — info */}
            <div className="space-y-5 order-2 lg:order-1">

              {/* Features */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">¿Qué incluye tu suscripción?</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🧠', title: 'Resultado Completo', desc: 'Tu puntuación exacta y análisis detallado' },
                    { icon: '📊', title: 'Análisis por Categorías', desc: 'Gráficos y comparativas detalladas' },
                    { icon: '🏆', title: 'Certificado Oficial', desc: 'Descargable y compartible' },
                    { icon: '🌍', title: 'Comparación Mundial', desc: 'Ve cómo te comparas globalmente' },
                    { icon: '🔓', title: 'Acceso a Todos los Tests', desc: 'CI, Personalidad, TDAH, Ansiedad y más' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-2xl">{f.icon}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{f.title}</p>
                        <p className="text-gray-400 text-xs">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span>⭐</span> Lo que dicen nuestros usuarios
                </h3>
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500"
                    style={{ transform: `translateX(-${currentReview * 100}%)` }}
                  >
                    {reviews.map((r, i) => (
                      <div key={i} className="w-full flex-shrink-0">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex text-yellow-400 text-xs">{'★'.repeat(r.rating)}</div>
                            <span>{r.country}</span>
                          </div>
                          <p className="text-gray-300 text-sm italic">"{r.text}"</p>
                          <p className="text-gray-500 text-xs mt-1 font-semibold">— {r.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  {reviews.map((_, i) => (
                    <button key={i} onClick={() => setCurrentReview(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentReview ? 'bg-primary-500' : 'bg-gray-600'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — pago */}
            <div className="order-1 lg:order-2">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-7 shadow-2xl">

                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <FaLock className="text-primary-400" /> Elige tu plan
                </h3>

                {/* Selector de planes */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id as 'monthly' | 'biweekly')}
                      className={`relative rounded-xl p-4 text-left border-2 transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Badge */}
                      <span className={`absolute -top-2.5 left-3 text-xs px-2 py-0.5 rounded-full text-white font-semibold ${plan.badgeColor}`}>
                        {plan.badge}
                      </span>

                      {selectedPlan === plan.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}

                      <p className="font-bold text-white mt-1">{plan.name}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold text-primary-400">{plan.price}</span>
                        <span className="text-gray-400 text-xs">{plan.period}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{plan.billing}</p>
                    </button>
                  ))}
                </div>

                {/* Resumen */}
                <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-3">Resumen del pedido</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Acceso inicial (desbloquear resultado)</span>
                      <span className="text-white font-semibold">0,50€</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <span className="text-gray-400">{activePlan.name} — Trial 2 días</span>
                        <p className="text-xs text-gray-500">Luego {activePlan.price}{activePlan.period}</p>
                      </div>
                      <span className="text-primary-400 font-semibold">GRATIS</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                      <span className="font-bold text-white">Total hoy</span>
                      <span className="text-2xl font-bold text-primary-400">0,50€</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Cancela antes de los 2 días y no se te cobrará nada más.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isLoading || !email}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                    isLoading || !email
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Redirigiendo a Stripe...
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      Pagar 0,50€ y comenzar trial
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-2">
                  Serás redirigido a la pasarela segura de Stripe
                </p>

                {/* Badges seguridad */}
                <div className="flex items-center justify-center gap-5 pt-4 mt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FaLock className="text-primary-400" /><span>SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FaShieldAlt className="text-primary-400" /><span>Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FaCreditCard className="text-primary-400" /><span>PCI DSS</span>
                  </div>
                  <div className="text-xs text-gray-500">Powered by <strong className="text-gray-400">Stripe</strong></div>
                </div>
              </div>

              {/* Garantía */}
              <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                <span className="text-lg">🛡️</span>
                <span className="font-semibold text-yellow-300 text-sm ml-2">Garantía de devolución</span>
                <a href={`/${lang}/reembolso`} className="text-xs text-yellow-400/70 underline ml-2">Ver política</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-secondary-950 border-t border-white/5 py-6 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">© 2026 Brain Metric. Todos los derechos reservados.</p>
        </div>
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
