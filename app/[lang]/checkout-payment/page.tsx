'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FaLock, FaBrain, FaChartLine, FaCertificate, FaUsers, FaShieldAlt, FaCreditCard, FaStar } from 'react-icons/fa'

const reviews = [
  { name: 'María G.', rating: 5, text: 'Muy profesional y detallado. Me ayudó a entenderme mejor.', country: '🇪🇸' },
  { name: 'Carlos R.', rating: 5, text: 'Resultados precisos y el certificado es muy útil.', country: '🇲🇽' },
  { name: 'Ana P.', rating: 5, text: 'Excelente experiencia, lo recomiendo totalmente.', country: '🇦🇷' },
  { name: 'David M.', rating: 5, text: 'El análisis por categorías es muy completo.', country: '🇨🇴' },
  { name: 'Laura S.', rating: 5, text: 'Rápido, fácil y muy informativo.', country: '🇨🇱' },
]

export const dynamic = 'force-dynamic'

function CheckoutPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [testType, setTestType] = useState('iq')
  const [lang, setLang] = useState('es')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentReview, setCurrentReview] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const testConfig: any = {
    'iq': { title: 'Desbloquea tu Resultado de CI', subtitle: 'Acceso completo a tu análisis de CI', icon: <FaBrain className="text-4xl" /> },
    'personality': { title: 'Desbloquea tu Perfil de Personalidad', subtitle: 'Descubre los 5 rasgos de tu personalidad', icon: <FaUsers className="text-4xl" /> },
    'adhd': { title: 'Desbloquea tu Evaluación de TDAH', subtitle: 'Análisis completo de síntomas de TDAH', icon: <FaBrain className="text-4xl" /> },
    'anxiety': { title: 'Desbloquea tu Evaluación de Ansiedad', subtitle: 'Evaluación de niveles de ansiedad', icon: <FaChartLine className="text-4xl" /> },
    'depression': { title: 'Desbloquea tu Evaluación de Depresión', subtitle: 'Evaluación de síntomas depresivos', icon: <FaStar className="text-4xl" /> },
    'eq': { title: 'Desbloquea tu Inteligencia Emocional', subtitle: 'Descubre tu inteligencia emocional', icon: <FaChartLine className="text-4xl" /> },
  }

  useEffect(() => {
    const emailParam = searchParams.get('email') || ''
    const testTypeParam = searchParams.get('testType') || 'iq'
    const langParam = searchParams.get('lang') || 'es'

    setEmail(emailParam)
    setTestType(testTypeParam)
    setLang(langParam)

    if (!emailParam) {
      setError('Email no proporcionado')
    }
  }, [searchParams])

  const handleStripeCheckout = async () => {
    setIsLoading(true)
    setError('')

    try {
      let testData: any = {}
      const testResultsStr = localStorage.getItem('testResults')
      if (testResultsStr) {
        try {
          const testResults = JSON.parse(testResultsStr)
          testData = {
            answers: testResults.answers || [],
            timeElapsed: testResults.timeElapsed || 0,
            correctAnswers: testResults.correctAnswers || 0,
            categoryScores: testResults.categoryScores || {}
          }
        } catch (e) {
          console.error('Error parsing testResults:', e)
        }
      }

      const response = await fetch('/api/stripe/create-checkout', {
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error creando la sesión de pago')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibió URL de checkout')
      }
    } catch (error: any) {
      console.error('Stripe checkout error:', error)
      setError(error.message || 'Error al iniciar el pago. Inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  const config = testConfig[testType] || testConfig['iq']

  return (
    <div className="min-h-screen bg-secondary-950 neural-bg">
      {/* Header */}
      <header className="bg-secondary-900/80 backdrop-blur-xl border-b border-white/10 py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
                <path d="M30 8 C24 8, 18 10, 14.5 15 C11 20, 10 25, 11.5 30 C10 31, 8.5 33.5, 8 36.5 C7.5 40, 9 43, 11.5 45 C11 47, 11.5 50, 13.5 52 C15.5 54, 18.5 55, 21 54.5 C23 56.5, 26 57, 28.5 56 C29.5 55.5, 30 55, 30.5 54 L30.5 8 Z" fill="white" opacity="0.95"/>
                <path d="M33.5 8 C39.5 8, 45.5 10, 49 15 C52.5 20, 53.5 25, 52 30 C53.5 31, 55 33.5, 55.5 36.5 C56 40, 54.5 43, 52 45 C52.5 47, 52 50, 50 52 C48 54, 45 55, 42.5 54.5 C40.5 56.5, 37.5 57, 35 56 C34 55.5, 33.5 55, 33 54 L33 8 Z" fill="white" opacity="0.93"/>
                <path d="M29 54 C29 55, 29.5 57, 30 58.5 C30.5 59.5, 31 60, 32 60 C33 60, 33.5 59.5, 34 58.5 C34.5 57, 35 55, 35 54" fill="white" opacity="0.85"/>
                <path d="M32 9 C31.5 20, 32.5 35, 32 54" stroke="rgba(99,102,241,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M29 30 C25 29.5, 20 31, 16 35" stroke="rgba(99,102,241,0.45)" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M28 16 C23 15.5, 18 17, 16 20" stroke="rgba(99,102,241,0.35)" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M29 23 C24 22, 17 24, 13 27" stroke="rgba(99,102,241,0.35)" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M28 39 C24 38.5, 18 39, 12 42" stroke="rgba(99,102,241,0.35)" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M35 30 C39 29.5, 44 31, 48 35" stroke="rgba(99,102,241,0.45)" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M36 16 C41 15.5, 46 17, 48 20" stroke="rgba(99,102,241,0.35)" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M35 23 C40 22, 47 24, 51 27" stroke="rgba(99,102,241,0.35)" strokeWidth="1.1" strokeLinecap="round"/>
                <path d="M36 39 C40 38.5, 46 39, 52 42" stroke="rgba(99,102,241,0.35)" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Brain</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400"> Metric</span>
            </span>
          </div>
          <div className="text-sm text-gray-400">{email}</div>
        </div>
      </header>

      {/* Main */}
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-block p-5 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-2xl mb-4 text-primary-400 border border-primary-500/20">
              {config.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {config.title}
            </h1>
            <p className="text-xl text-gray-400">
              {config.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Info */}
            <div className="space-y-6 order-2 lg:order-1">
              {/* Pricing card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border-2 border-primary-500/30 p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Desbloquea tu Resultado Completo
                  </h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-gray-500 line-through text-2xl">19,99€</span>
                    <span className="text-6xl font-bold text-gradient">0,50€</span>
                  </div>
                  <div className="inline-block bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full font-semibold border border-primary-500/30">
                    ¡Ahorra 97%!
                  </div>
                </div>

                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <FaStar className="text-primary-400" />
                    Incluye Trial Premium de 2 Días
                  </h4>
                  <div className="text-gray-300 text-sm space-y-1">
                    <p>✅ Acceso completo a todos los tests</p>
                    <p>✅ Análisis detallado y comparativas</p>
                    <p>✅ Certificado descargable</p>
                    <p>✅ Después solo <strong className="text-white">9,99€/mes</strong></p>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Cancela en cualquier momento durante el trial
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">¿Qué Obtienes?</h3>
                <div className="space-y-4">
                  {[
                    { icon: <FaBrain />, title: 'Resultado Completo', desc: 'Tu puntuación exacta y análisis detallado' },
                    { icon: <FaChartLine />, title: 'Análisis por Categorías', desc: 'Gráficos y comparativas detalladas' },
                    { icon: <FaCertificate />, title: 'Certificado Oficial', desc: 'Descargable y compartible' },
                    { icon: <FaUsers />, title: 'Comparación Mundial', desc: 'Ve cómo te comparas con otros usuarios' },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>⭐</span> Lo que dicen nuestros usuarios
                </h3>
                <div className="relative overflow-hidden">
                  <div 
                    className="transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentReview * 100}%)` }}
                  >
                    <div className="flex">
                      {reviews.map((review, index) => (
                        <div key={index} className="w-full flex-shrink-0 px-1">
                          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400 text-sm">
                                {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                              </div>
                              <span className="text-lg">{review.country}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2 italic">&ldquo;{review.text}&rdquo;</p>
                            <p className="text-gray-500 text-xs font-semibold">— {review.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReview(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentReview ? 'bg-primary-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Payment */}
            <div className="lg:sticky lg:top-8 h-fit order-1 lg:order-2">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
                  <FaLock className="text-primary-400" /> Pago Seguro
                </h3>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm mb-6">
                    {error}
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/5">
                  <h4 className="font-bold text-white mb-3 text-sm">Resumen del Pedido</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Resultado del Test</span>
                      <span className="font-semibold text-white">0,50€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-400 block">Trial Premium (2 días)</span>
                        <span className="text-xs text-gray-500">Después 9,99€/mes</span>
                      </div>
                      <span className="font-semibold text-primary-400">GRATIS</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="font-bold text-white">Total Hoy</span>
                      <span className="text-3xl font-bold text-gradient">0,50€</span>
                    </div>
                  </div>
                </div>

                {/* Stripe Checkout Button */}
                <button
                  onClick={handleStripeCheckout}
                  disabled={isLoading || !email}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white transition-all duration-300 flex items-center justify-center gap-3 ${
                    isLoading || !email
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Redirigiendo a Stripe...
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      Pagar 0,50€ de forma segura
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  Serás redirigido a la pasarela segura de Stripe
                </p>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-5 pt-5 mt-5 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FaLock className="text-primary-400" />
                    <span>Pago Seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FaShieldAlt className="text-primary-400" />
                    <span>SSL Encriptado</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FaCreditCard className="text-primary-400" />
                    <span>PCI DSS</span>
                  </div>
                </div>

                {/* Stripe badge */}
                <div className="text-center mt-4">
                  <span className="text-xs text-gray-500">Powered by</span>
                  <span className="text-sm font-bold text-gray-400 ml-1">Stripe</span>
                </div>
              </div>

              {/* Guarantee */}
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <span className="font-semibold text-yellow-300 text-sm">Garantía de Devolución</span>
                  <a href={`/${lang}/reembolso`} className="text-xs text-yellow-400/70 underline">Ver política</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-950 border-t border-white/5 text-white py-8 px-4 mt-12">
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 mb-2">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPaymentContent />
    </Suspense>
  )
}
