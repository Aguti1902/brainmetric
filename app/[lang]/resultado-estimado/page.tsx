'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import { visualQuestions as questions, calculateIQ } from '@/lib/visual-questions'
import { FaLock, FaChartLine, FaCertificate, FaShare, FaCheckCircle } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function ResultadoEstimadoPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [estimatedIQ, setEstimatedIQ] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [testType, setTestType] = useState<string>('iq')

  const testConfig: any = {
    'iq': { title: 'Test de CI Completado', subtitle: 'Tu Coeficiente Intelectual', icon: '🧠' },
    'personality': { title: 'Test de Personalidad Completado', subtitle: 'Análisis Big Five (OCEAN)', icon: '🎯' },
    'adhd': { title: 'Test de TDAH Completado', subtitle: 'Evaluación de Atención', icon: '🎯' },
    'anxiety': { title: 'Test de Ansiedad Completado', subtitle: 'Análisis GAD-7', icon: '💙' },
    'depression': { title: 'Test de Depresión Completado', subtitle: 'Análisis PHQ-9', icon: '🌟' },
    'eq': { title: 'Test de Inteligencia Emocional Completado', subtitle: 'Análisis EQ', icon: '❤️' },
  }

  useEffect(() => {
    const testResultsStr = localStorage.getItem('testResults')
    if (!testResultsStr) {
      router.push('/test')
      return
    }

    const testResults = JSON.parse(testResultsStr)
    const testType = testResults.type || localStorage.getItem('currentTestType') || 'iq'
    const answers = testResults.answers
    const name = testResults.userName || localStorage.getItem('userName') || 'Usuario'

    if (testType === 'iq' || !testType) {
      let correctAnswers = 0
      answers.forEach((answer: number | null, index: number) => {
        if (questions[index] && answer === questions[index].correctAnswer) {
          correctAnswers++
        }
      })
      const iq = calculateIQ(correctAnswers)
      setEstimatedIQ(iq)
      localStorage.setItem('userIQ', iq.toString())
      localStorage.setItem('correctAnswers', correctAnswers.toString())
    } else {
      setEstimatedIQ(null)
    }

    setUserName(name)
    setTestType(testType)
    setIsLoading(false)
    localStorage.setItem('testType', testType)
  }, [router])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleCheckout = async () => {
    if (!email) {
      setEmailError(t.estimatedResult.emailRequired || 'Por favor, introduce tu correo electrónico')
      return
    }
    if (!validateEmail(email)) {
      setEmailError(t.estimatedResult.emailInvalid || 'Por favor, introduce un correo electrónico válido')
      return
    }
    if (!agreedToTerms) {
      alert(t.estimatedResult.termsRequired || 'Por favor, acepta los términos y condiciones para continuar')
      return
    }

    localStorage.setItem('userEmail', email)
    localStorage.setItem('testType', testType)
    
    router.push(`/${lang}/checkout-payment?` + new URLSearchParams({
      email, testType, lang: lang || 'es'
    }).toString())
  }

  if (isLoading || loading || !t) {
    return (
      <>
        <MinimalHeader />
        <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">{t ? t.test.loading : 'Loading...'}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MinimalHeader />
      
      <div className="min-h-screen bg-secondary-950 neural-bg py-12">
        <div className="container-custom max-w-4xl">
          <div className="glass p-8 mb-8 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-yellow-500/10 rounded-2xl mb-4 border border-yellow-500/20">
                <FaLock className="text-4xl text-yellow-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                {userName}, {testConfig[testType]?.title || t.estimatedResult.title}
              </h1>
              <p className="text-xl text-gray-400">
                {testConfig[testType]?.subtitle || t.estimatedResult.subtitle}
              </p>
            </div>

            {/* Blurred Result */}
            <div className="relative mb-8">
              <div className="blur-sm pointer-events-none">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-8 text-white text-center">
                  {testType === 'iq' && estimatedIQ ? (
                    <>
                      <div className="text-6xl font-bold mb-2">{estimatedIQ}</div>
                      <div className="text-2xl">{t.estimatedResult.estimatedIQ}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">{testConfig[testType]?.icon || '🧠'}</div>
                      <div className="text-3xl font-bold mb-2">{testConfig[testType]?.title || 'Test Completado'}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass p-6 text-center max-w-md border border-primary-500/30">
                  <FaLock className="text-3xl text-primary-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t.estimatedResult.unlockTitle}
                  </h3>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                {t.estimatedResult.unlockSubtitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <FaCheckCircle className="text-primary-400 text-xl mt-1" />, title: t.estimatedResult.feature1, desc: t.estimatedResult.feature2 },
                  { icon: <FaChartLine className="text-primary-400 text-xl mt-1" />, title: t.estimatedResult.feature3, desc: 'Comparativas globales' },
                  { icon: <FaCertificate className="text-primary-400 text-xl mt-1" />, title: t.estimatedResult.feature4, desc: 'Descargable' },
                  { icon: <FaShare className="text-primary-400 text-xl mt-1" />, title: t.estimatedResult.feature5, desc: 'Tests ilimitados' },
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feat.icon}
                    <div>
                      <h4 className="font-semibold text-white">{feat.title}</h4>
                      <p className="text-sm text-gray-400">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Section */}
            <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-2xl p-8 mb-8 border-2 border-primary-500/30">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {testType === 'iq' ? (
                    <>Descubre tu <span className="text-gradient">¡Capacidad Intelectual!</span></>
                  ) : testType === 'personality' ? (
                    <>Descubre tu <span className="text-gradient">¡Personalidad!</span></>
                  ) : (
                    <>{t.estimatedResult.mainTitle} <span className="text-gradient">{t.estimatedResult.mainTitleHighlight}</span></>
                  )}
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  {t.estimatedResult.mainSubtitle}
                </p>
              </div>

              <div className="max-w-lg mx-auto">
                <div className="mb-6">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                    placeholder={t.estimatedResult.emailPlaceholder || "Email"}
                    className={`w-full px-6 py-4 text-lg bg-white/5 border-2 rounded-xl focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all ${
                      emailError 
                        ? 'border-red-500/50 focus:ring-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  />
                  {emailError && <p className="text-red-400 text-sm mt-2">⚠️ {emailError}</p>}
                </div>

                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded focus:ring-primary-500 cursor-pointer accent-primary-500"
                    />
                    <span className="text-gray-400 text-sm leading-relaxed">
                      {t.estimatedResult.acceptTerms}{' '}
                      <a href={`/${lang}/terminos`} target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">
                        {t.estimatedResult.termsLink}
                      </a>
                      {' '}{t.estimatedResult.and}{' '}
                      <a href={`/${lang}/privacidad`} target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">
                        {t.estimatedResult.privacyLink}
                      </a>.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={!email || !agreedToTerms}
                  className={`w-full text-xl font-bold py-4 px-8 rounded-xl transition-all duration-300 ${
                    email && agreedToTerms
                      ? 'btn-primary cursor-pointer'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t.estimatedResult.unlockButton}
                </button>
                
                <p className="text-sm text-gray-500 text-center mt-4">
                  🔒 {t.estimatedResult.securePayment}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { emoji: '🔒', title: t.estimatedResult.trust1Title, desc: t.estimatedResult.trust1Desc },
              { emoji: '⚡', title: t.estimatedResult.trust2Title, desc: t.estimatedResult.trust2Desc },
              { emoji: '✓', title: t.estimatedResult.trust3Title, desc: t.estimatedResult.trust3Desc },
            ].map((trust, idx) => (
              <div key={idx} className="glass p-4 text-center">
                <div className="text-3xl mb-2">{trust.emoji}</div>
                <h4 className="font-semibold text-white">{trust.title}</h4>
                <p className="text-sm text-gray-400">{trust.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
