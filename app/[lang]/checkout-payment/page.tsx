'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FaLock, FaBrain, FaChartLine, FaShieldAlt, FaCreditCard, FaStar } from 'react-icons/fa'

export const dynamic = 'force-dynamic'

const reviews = [
  { name: 'María G.', rating: 5, text: 'Muy profesional y detallado. Me ayudó a entenderme mejor.', country: '🇪🇸' },
  { name: 'Carlos R.', rating: 5, text: 'Resultados precisos y el certificado es muy útil.', country: '🇲🇽' },
  { name: 'Ana P.', rating: 5, text: 'Excelente experiencia, lo recomiendo totalmente.', country: '🇦🇷' },
  { name: 'David M.', rating: 5, text: 'El análisis por categorías es muy completo.', country: '🇨🇴' },
  { name: 'Laura S.', rating: 5, text: 'Rápido, fácil y muy informativo.', country: '🇨🇱' },
]

const testConfig: Record<string, { title: string; subtitle: string; icon: string }> = {
  iq:          { title: 'Desbloquea tu Resultado de CI',          subtitle: 'Acceso completo a tu análisis de CI',          icon: '🧠' },
  personality: { title: 'Desbloquea tu Perfil de Personalidad',   subtitle: 'Descubre los 5 rasgos de tu personalidad',     icon: '🎭' },
  adhd:        { title: 'Desbloquea tu Evaluación de TDAH',       subtitle: 'Análisis completo de síntomas de TDAH',        icon: '⚡' },
  anxiety:     { title: 'Desbloquea tu Evaluación de Ansiedad',   subtitle: 'Evaluación de niveles de ansiedad',            icon: '💆' },
  depression:  { title: 'Desbloquea tu Evaluación de Depresión',  subtitle: 'Evaluación de síntomas depresivos',            icon: '🌱' },
  eq:          { title: 'Desbloquea tu Inteligencia Emocional',   subtitle: 'Descubre tu inteligencia emocional',           icon: '❤️' },
}

function CheckoutPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail]           = useState('')
  const [testType, setTestType]     = useState('iq')
  const [lang, setLang]             = useState('es')
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState('')
  const [currentReview, setCurrentReview] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCurrentReview(p => (p + 1) % reviews.length), 4500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const e  = searchParams.get('email')    || ''
    const tt = searchParams.get('testType') || 'iq'
    const l  = searchParams.get('lang')     || 'es'
    setEmail(e); setTestType(tt); setLang(l)
    if (!e) setError('Email no proporcionado')
  }, [searchParams])

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')
    try {
      let testData: any = {}
      try {
        const raw = localStorage.getItem('testResults')
        if (raw) {
          const p = JSON.parse(raw)
          testData = { answers: p.answers || [], timeElapsed: p.timeElapsed || 0, correctAnswers: p.correctAnswers || 0, categoryScores: p.categoryScores || {} }
        }
      } catch {}

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, lang, testType,
          planType: 'monthly',
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
      setError(e.message || 'Error al iniciar el pago.')
      setIsLoading(false)
    }
  }

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

      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-10">
            <div className="text-5xl mb-3">{config.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{config.title}</h1>
            <p className="text-gray-400 text-lg">{config.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* LEFT — beneficios + reviews */}
            <div className="space-y-5 order-2 lg:order-1">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">¿Qué incluye tu suscripción?</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🧠', title: 'Resultado Completo',       desc: 'Tu puntuación exacta y análisis detallado' },
                    { icon: '📊', title: 'Análisis por Categorías',   desc: 'Gráficos y comparativas detalladas' },
                    { icon: '🏆', title: 'Certificado Oficial',       desc: 'Descargable y compartible' },
                    { icon: '🌍', title: 'Comparación Mundial',       desc: 'Ve cómo te comparas globalmente' },
                    { icon: '🔓', title: 'Acceso a Todos los Tests',  desc: 'CI, Personalidad, TDAH, Ansiedad y más' },
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
                <h3 className="text-sm font-bold text-white mb-3">⭐ Lo que dicen nuestros usuarios</h3>
                <div className="overflow-hidden">
                  <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentReview * 100}%)` }}>
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
                  <FaLock className="text-primary-400" /> Pago Seguro
                </h3>

                {/* Resumen del pedido */}
                <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-3">Resumen del pedido</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Acceso inicial (desbloquear resultado)</span>
                      <span className="text-white font-semibold">0,50€</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-gray-400">Trial Premium — 2 días gratis</span>
                        <p className="text-xs text-gray-500 mt-0.5">Luego 19,99€/mes · Cancela cuando quieras</p>
                      </div>
                      <span className="text-primary-400 font-semibold ml-4">GRATIS</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="font-bold text-white text-base">Total hoy</span>
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">0,50€</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
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
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirigiendo a Stripe...</>
                  ) : (
                    <><FaCreditCard /> Pagar 0,50€ y comenzar trial</>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-2">Serás redirigido a la pasarela segura de Stripe</p>

                <div className="flex items-center justify-center gap-5 pt-4 mt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400"><FaLock className="text-primary-400" /><span>SSL</span></div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400"><FaShieldAlt className="text-primary-400" /><span>Seguro</span></div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400"><FaCreditCard className="text-primary-400" /><span>PCI DSS</span></div>
                  <div className="text-xs text-gray-500">Powered by <strong className="text-gray-400">Stripe</strong></div>
                </div>
              </div>

              <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                <span className="text-lg">🛡️</span>
                <span className="font-semibold text-yellow-300 text-sm ml-2">Garantía de devolución</span>
                <a href={`/${lang}/reembolso`} className="text-xs text-yellow-400/70 underline ml-2">Ver política</a>
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
