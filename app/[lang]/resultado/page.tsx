'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MinimalHeader from '@/components/MinimalHeader'
import { getIQCategory, getIQDescription, visualQuestions as questions } from '@/lib/visual-questions'
import { FaFacebook, FaTwitter, FaLinkedin, FaDownload, FaTrophy, FaBrain, FaLightbulb, FaEye, FaSearch, FaBolt, FaChartBar, FaMemory } from 'react-icons/fa'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { useTranslations } from '@/hooks/useTranslations'
import { getTestHistory } from '@/lib/test-history'

function ResultadoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, loading, lang } = useTranslations()
  const [userIQ, setUserIQ] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [verifyingPayment, setVerifyingPayment] = useState(false)

  useEffect(() => {
    const sessionId      = searchParams.get('session_id')
    const paymentIntentId = searchParams.get('payment_intent')
    const redirectStatus  = searchParams.get('redirect_status')
    const paymentParam    = searchParams.get('payment')

    // Redireccionado desde Stripe con payment_intent (nuevo flujo PaymentElement)
    if (paymentIntentId && (redirectStatus === 'succeeded' || paymentParam === 'success')) {
      setVerifyingPayment(true)
      verifyPaymentIntent(paymentIntentId)
      return
    }

    // Redireccionado desde Stripe Checkout (flujo anterior — mantener compatibilidad)
    if (sessionId && paymentParam === 'success') {
      setVerifyingPayment(true)
      verifyStripeSession(sessionId)
      return
    }

    // Si ya tiene paymentCompleted en localStorage, mostrar resultado
    const paymentCompleted = localStorage.getItem('paymentCompleted')
    if (!paymentCompleted) {
      router.push(`/${lang}/test`)
      return
    }

    loadResults()
  }, [router, lang, searchParams])

  const verifyPaymentIntent = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`/api/stripe/verify-payment-intent?payment_intent=${paymentIntentId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error('❌ Error verificando payment intent:', data.error)
        const paymentCompleted = localStorage.getItem('paymentCompleted')
        if (paymentCompleted) {
          setVerifyingPayment(false)
          loadResults()
          return
        }
        router.push(`/${lang}/resultado-estimado`)
        return
      }

      if (data.token) localStorage.setItem('auth_token', data.token)
      localStorage.setItem('paymentCompleted', 'true')
      if (data.user?.email)    localStorage.setItem('userEmail', data.user.email)
      if (data.user?.userName) localStorage.setItem('userName',  data.user.userName)

      const url = new URL(window.location.href)
      url.searchParams.delete('payment_intent')
      url.searchParams.delete('payment_intent_client_secret')
      url.searchParams.delete('redirect_status')
      url.searchParams.delete('payment')
      window.history.replaceState({}, '', url.toString())

      fireConversionEvents()
      setVerifyingPayment(false)
      loadResults()
    } catch (err) {
      console.error('❌ Error en verificación de payment intent:', err)
      setVerifyingPayment(false)
      loadResults()
    }
  }

  const verifyStripeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      const data = await response.json()

      if (data.retry) {
        setTimeout(() => verifyStripeSession(sessionId), 2000)
        return
      }

      if (!response.ok || !data.success) {
        console.error('❌ Error verificando sesión:', data.error)
        const paymentCompleted = localStorage.getItem('paymentCompleted')
        if (paymentCompleted) {
          setVerifyingPayment(false)
          loadResults()
          return
        }
        router.push(`/${lang}/resultado-estimado`)
        return
      }

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('paymentCompleted', 'true')
      if (data.user?.email) localStorage.setItem('userEmail', data.user.email)
      if (data.user?.userName) localStorage.setItem('userName', data.user.userName)

      const url = new URL(window.location.href)
      url.searchParams.delete('session_id')
      url.searchParams.delete('payment')
      window.history.replaceState({}, '', url.toString())

      fireConversionEvents()
      setVerifyingPayment(false)
      loadResults()
    } catch (err) {
      console.error('❌ Error en verificación:', err)
      setVerifyingPayment(false)
      loadResults()
    }
  }

  const fireConversionEvents = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'purchase', {
        transaction_id: localStorage.getItem('transactionId'),
        value: 0.50,
        currency: 'EUR',
      })
      ;(window as any).gtag('event', 'conversion', {
        send_to: 'AW-17232820139/qMCRCP_NnK4bEKvvn5lA',
        value: 0.50,
        currency: 'EUR',
        transaction_id: localStorage.getItem('transactionId') || '',
      })
    }
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'Purchase', { value: 0.50, currency: 'EUR' })
    }
  }

  const loadResults = () => {
    const testType = localStorage.getItem('testType') || localStorage.getItem('currentTestType') || 'iq'

    if (testType !== 'iq') {
      localStorage.setItem('isPremiumTest', 'true')
      router.push(`/${lang}/tests/${testType}/results`)
      return
    }

    const viewTestId = localStorage.getItem('viewTestId')
    if (viewTestId) {
      const history = getTestHistory()
      const specificTest = history.tests.find(t => t.id === viewTestId)
      if (specificTest) {
        setUserIQ(specificTest.iq)
        setCorrectAnswers(specificTest.correctAnswers)
        setUserEmail(history.email || localStorage.getItem('userEmail') || '')
        setUserName(history.userName || localStorage.getItem('userName') || 'Usuario')
        setIsLoading(false)
        localStorage.removeItem('viewTestId')
        return
      }
    }

    const iq = parseInt(localStorage.getItem('userIQ') || '0')
    const correct = parseInt(localStorage.getItem('correctAnswers') || '0')
    const email = localStorage.getItem('userEmail') || ''
    const name = localStorage.getItem('userName') || 'Usuario'

    setUserIQ(iq)
    setCorrectAnswers(correct)
    setUserEmail(email)
    setUserName(name)
    setIsLoading(false)
  }

  useEffect(() => {
    if (!verifyingPayment && userIQ) {
      fireConversionEvents()
    }
  }, [verifyingPayment, userIQ])

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(`¡Acabo de descubrir que mi CI es ${userIQ}! Descubre el tuyo en Brain Metric`)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Mi CI es ${userIQ}! 🧠 Descubre el tuyo en`)}&url=${encodeURIComponent(window.location.origin)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const downloadCertificate = async () => {
    if (!t) return
    
    // Importar jsPDF dinámicamente para evitar problemas con SSR
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // ── Colores corporativos ──────────────────────────────────────────────────
    const darkBg:    [number, number, number] = [15,  23,  42]  // #0F172A
    const darkCard:  [number, number, number] = [30,  27,  75]  // #1E1B4B
    const indigo:    [number, number, number] = [99, 102, 241]  // #6366F1
    const indigoLt:  [number, number, number] = [165,180,252]   // #A5B4FC
    const white:     [number, number, number] = [255,255,255]
    const grayLt:    [number, number, number] = [203,213,225]   // #CBD5E1

    // ── Fondo oscuro completo ─────────────────────────────────────────────────
    doc.setFillColor(...darkBg)
    doc.rect(0, 0, 297, 210, 'F')

    // Franja de acento superior
    doc.setFillColor(...darkCard)
    doc.rect(0, 0, 297, 48, 'F')

    // Borde exterior indigo sutil
    doc.setLineWidth(0.8)
    doc.setDrawColor(...indigo)
    doc.rect(6, 6, 285, 198)

    // ── Cargar logo blanco ────────────────────────────────────────────────────
    try {
      const logoImg = new window.Image()
      logoImg.crossOrigin = 'anonymous'
      logoImg.src = '/images/BRAINMETRIC/Logo_blanco.png'
      await new Promise((resolve) => {
        logoImg.onload = resolve
        logoImg.onerror = resolve  // continuar aunque falle
      })
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        // Logo centrado en la franja superior - proporcional
        const logoH = 18
        const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH
        doc.addImage(logoImg, 'PNG', 148.5 - logoW / 2, 15, logoW, logoH)
      }
    } catch { /* continuar sin logo */ }

    // ── Línea separadora bajo franja ──────────────────────────────────────────
    doc.setLineWidth(0.4)
    doc.setDrawColor(...indigo)
    doc.line(30, 49, 267, 49)

    // ── Título certificado ────────────────────────────────────────────────────
    doc.setFontSize(22)
    doc.setTextColor(...white)
    doc.setFont('helvetica', 'bold')
    const certificateTitle = t.certificate?.title || 'INTELLIGENCE CERTIFICATE'
    doc.text(certificateTitle.toUpperCase(), 148.5, 63, { align: 'center' })

    // ── "Se certifica que" ────────────────────────────────────────────────────
    doc.setFontSize(11)
    doc.setTextColor(...grayLt)
    doc.setFont('helvetica', 'normal')
    const certifyText = t.certificate?.certifies || 'This certifies that'
    doc.text(certifyText, 148.5, 74, { align: 'center' })

    // ── Nombre del usuario ────────────────────────────────────────────────────
    doc.setFontSize(26)
    doc.setTextColor(...indigoLt)
    doc.setFont('helvetica', 'bold')
    doc.text(userName, 148.5, 86, { align: 'center' })

    // Línea bajo el nombre
    doc.setLineWidth(0.3)
    doc.setDrawColor(...indigo)
    doc.line(80, 90, 217, 90)

    // ── Textos descriptivos ───────────────────────────────────────────────────
    doc.setFontSize(10.5)
    doc.setTextColor(...grayLt)
    doc.setFont('helvetica', 'normal')
    const completedText = t.certificate?.completed || 'has successfully completed the intelligence test'
    const obtainedText  = t.certificate?.obtained  || 'obtaining an Intelligence Quotient of'
    doc.text(completedText, 148.5, 99, { align: 'center' })
    doc.text(obtainedText,  148.5, 107, { align: 'center' })

    // ── IQ Score grande ───────────────────────────────────────────────────────
    // Fondo pill para el IQ
    doc.setFillColor(...darkCard)
    doc.roundedRect(108, 111, 81, 36, 5, 5, 'F')
    doc.setLineWidth(0.5)
    doc.setDrawColor(...indigo)
    doc.roundedRect(108, 111, 81, 36, 5, 5, 'S')

    doc.setFontSize(52)
    doc.setTextColor(...white)
    doc.setFont('helvetica', 'bold')
    doc.text(userIQ.toString(), 148.5, 138, { align: 'center' })

    // ── Categoría ─────────────────────────────────────────────────────────────
    doc.setFontSize(13)
    doc.setTextColor(...indigo)
    doc.setFont('helvetica', 'bold')
    const categoryLabel = t.certificate?.category || 'Category'
    doc.text(`${categoryLabel}: ${category}`, 148.5, 155, { align: 'center' })

    // ── Estadísticas ──────────────────────────────────────────────────────────
    doc.setFontSize(9.5)
    doc.setTextColor(...grayLt)
    doc.setFont('helvetica', 'normal')
    const correctLabel   = t.certificate?.correctAnswers || 'correct answers'
    const percentileLabel = t.certificate?.percentile    || 'Percentile'
    doc.text(`${correctAnswers}/${questions.length} ${correctLabel} (${percentageCorrect}%)`, 148.5, 163, { align: 'center' })
    doc.text(`${percentileLabel}: ${percentile}th`, 148.5, 170, { align: 'center' })

    // ── Fecha ─────────────────────────────────────────────────────────────────
    const localeMap: Record<string, string> = {
      es:'es-ES', en:'en-US', fr:'fr-FR', de:'de-DE',
      it:'it-IT', pt:'pt-PT', sv:'sv-SE', no:'no-NO', uk:'uk-UA'
    }
    const fecha = new Date().toLocaleDateString(localeMap[lang] || 'en-US', {
      year:'numeric', month:'long', day:'numeric'
    })
    const dateLabel = t.certificate?.issueDate || 'Issue date'
    doc.setFontSize(9)
    doc.setTextColor(...grayLt)
    doc.text(`${dateLabel}: ${fecha}`, 148.5, 178, { align: 'center' })

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.setFillColor(...darkCard)
    doc.rect(0, 184, 297, 26, 'F')

    doc.setLineWidth(0.3)
    doc.setDrawColor(...indigo)
    doc.line(30, 184, 267, 184)

    doc.setFontSize(8)
    doc.setTextColor(...indigoLt)
    doc.setFont('helvetica', 'bold')
    const footerText = t.certificate?.footer || 'Brain Metric · Professional Intelligence Assessment'
    doc.text(footerText, 148.5, 193, { align: 'center' })

    doc.setFontSize(7.5)
    doc.setTextColor(...grayLt)
    doc.setFont('helvetica', 'normal')
    doc.text('brainmetric.io', 148.5, 200, { align: 'center' })

    // ── Guardar ───────────────────────────────────────────────────────────────
    const fileName = t.certificate?.fileName || 'Certificate_IQ'
    doc.save(`${fileName}_${userName.replace(/\s+/g, '_')}_${userIQ}.pdf`)
  }

  if (isLoading || loading || !t || verifyingPayment) {
    return (
      <>
        <MinimalHeader email={userEmail} />
        <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">
              {verifyingPayment ? 'Verificando pago...' : 'Cargando...'}
            </p>
          </div>
        </div>
      </>
    )
  }

  const category = getIQCategory(userIQ, lang)
  const description = getIQDescription(userIQ, lang)

  // Datos para los gráficos
  const distributionData = t ? [
    { name: `${t.result.veryLow} (<70)`, value: 2.2, color: '#ef4444', range: '<70' },
    { name: `${t.result.low} (70-85)`, value: 13.6, color: '#f97316', range: '70-85' },
    { name: `${t.result.average} (85-115)`, value: 68, color: '#6366F1', range: '85-115' },
    { name: `${t.result.superior} (115-130)`, value: 13.6, color: '#8b5cf6', range: '115-130' },
    { name: `${t.result.verySuperior} (>130)`, value: 2.2, color: '#10b981', range: '>130' }
  ] : []

  // Calcular porcentaje de respuestas correctas
  const percentageCorrect = Math.round((correctAnswers / questions.length) * 100)

  // Categorías cognitivas con puntuaciones simuladas basadas en el rendimiento
  const baseScore = (correctAnswers / questions.length) * 100
  const cognitiveCategories = t ? [
    { name: t.result.logicalReasoning, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'brain' },
    { name: t.result.visualPerception, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'eye' },
    { name: t.result.patternRecognition, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'search' },
    { name: t.result.abstractThinking, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'lightbulb' },
    { name: t.result.workingMemory, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'memory' },
    { name: t.result.processingSpeed, score: parseFloat(Math.min(100, baseScore + (Math.random() * 10 - 5)).toFixed(2)), icon: 'bolt' }
  ] : []

  const performanceData = t ? [
    { 
      category: t.result.easyQuestions, 
      correctas: Math.min(7, correctAnswers), 
      incorrectas: Math.max(0, 7 - Math.min(7, correctAnswers)),
      total: 7 
    },
    { 
      category: t.result.mediumQuestions, 
      correctas: Math.max(0, Math.min(7, correctAnswers - 7)), 
      incorrectas: Math.max(0, 7 - Math.max(0, Math.min(7, correctAnswers - 7))),
      total: 7 
    },
    { 
      category: t.result.hardQuestions, 
      correctas: Math.max(0, correctAnswers - 14), 
      incorrectas: Math.max(0, 6 - Math.max(0, correctAnswers - 14)),
      total: 6 
    }
  ] : []

  const COLORS = ['#ef4444', '#f97316', '#6366F1', '#8b5cf6', '#10b981']
  
  // Determinar posición en la curva de distribución
  const getUserPercentile = (iq: number) => {
    if (iq < 70) return 2
    if (iq < 85) return 16
    if (iq < 100) return 50
    if (iq < 115) return 84
    if (iq < 130) return 98
    return 99
  }

  const percentile = getUserPercentile(userIQ)

  return (
    <>
      <MinimalHeader email={userEmail} />
      
      <div className="min-h-screen bg-secondary-950 neural-bg py-12">
        <div className="container-custom max-w-7xl">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/40 rounded-xl p-4 mb-6 text-center animate-fadeIn shadow-md backdrop-blur-sm">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-300 mb-1">
              {t.result.congratulations}, {userName}!
            </h2>
            <p className="text-green-400 text-sm">
              {t.result.analysisComplete} <strong className="text-green-200">{userEmail}</strong>
            </p>
          </div>

          {/* Main IQ Score Card - Hero */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-8 animate-fadeIn">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#0F172A] p-6 md:p-12 text-white text-center relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white opacity-5 rounded-full -mr-16 md:-mr-32 -mt-16 md:-mt-32"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-white opacity-5 rounded-full -ml-12 md:-ml-24 -mb-12 md:-mb-24"></div>
              
              <div className="relative z-10">
                <div className="inline-block p-4 md:p-6 bg-white/10 backdrop-blur-sm rounded-full mb-4 md:mb-6">
                  <FaBrain className="text-4xl md:text-7xl" />
              </div>
                
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8">
                  {t.result.yourIQ}
              </h1>
                
                {/* IQ Score - Grande y prominente */}
                <div className="relative mb-6 md:mb-8">
                  {/* Badge Top X% - Separado del número */}
                  <div className="mb-4 md:mb-6">
                    <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold shadow-lg">
                      {t.result.topPercent} {100 - percentile}%
                    </div>
                  </div>
                  
                  {/* Número de CI */}
                  <div className="text-7xl md:text-9xl lg:text-[200px] font-black leading-none mb-4 md:mb-6">
                    {userIQ}
                  </div>
                  
                  {/* Categoría - Debajo del número */}
                  <div className="text-lg md:text-2xl lg:text-3xl font-semibold bg-white/20 backdrop-blur-sm inline-block px-6 md:px-10 py-3 md:py-4 rounded-full">
                    {category}
                  </div>
                </div>
                
                {/* Estadísticas */}
                <div className="flex items-center justify-center gap-2 md:gap-3 text-sm md:text-xl mb-4 md:mb-6">
                  <FaTrophy className="text-yellow-300 text-lg md:text-2xl" />
                  <span className="font-semibold">{correctAnswers}/{questions.length} {t.result.answersCorrect} ({percentageCorrect}%)</span>
            </div>

                <div className="text-sm md:text-lg opacity-90">
                  {t.result.percentileText} <strong>{percentile}</strong> {t.result.ofPopulation}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-8 md:p-12">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  {t.result.analysisTitle}
              </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                {description}
              </p>
              </div>
            </div>
          </div>

          {/* Cognitive Categories Analysis */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-4 md:p-8 lg:p-12 mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3 text-center flex items-center justify-center gap-2 md:gap-3">
              <span className="text-2xl md:text-3xl lg:text-4xl">🧠</span>
              {t.result.cognitiveTitle}
            </h2>
            <p className="text-sm md:text-base text-gray-400 text-center mb-4 md:mb-8">
              {t.result.cognitiveSubtitle}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {cognitiveCategories.map((cat, index) => {
                const IconComponent = cat.icon === 'brain' ? FaBrain :
                                      cat.icon === 'eye' ? FaEye :
                                      cat.icon === 'search' ? FaSearch :
                                      cat.icon === 'lightbulb' ? FaLightbulb :
                                      cat.icon === 'memory' ? FaMemory :
                                      FaBolt;
                
                return (
                  <div key={index} className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10 hover:border-[#6366F1]/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <IconComponent className="text-2xl md:text-3xl lg:text-4xl text-[#6366F1]" />
                      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-[#6366F1]">{cat.score}%</span>
                    </div>
                    <h4 className="font-bold text-white mb-2 text-sm md:text-base">{cat.name}</h4>
                    <div className="w-full bg-white/10 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] h-2 md:h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${cat.score}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8">
              {/* Distribution Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl p-4 md:p-8">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 text-center">
                  {t.result.distributionTitle}
                </h3>
              <p className="text-gray-400 text-center mb-4 md:mb-6 text-xs md:text-sm">
                {t.result.distributionSubtitle}
              </p>
              <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${value}%`}
                    outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              <div className="mt-6 space-y-3 bg-white/5 rounded-xl p-4">
                  {distributionData.map((item, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded ${
                      userIQ >= parseInt(item.range.replace(/[<>]/g, '').split('-')[0] || '0') ? 'bg-[#6366F1]/20 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-gray-200">{item.name}</span>
                    </div>
                    <span className="text-gray-300">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl p-4 md:p-8">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 text-center">
                {t.result.performanceTitle}
                </h3>
              <p className="text-gray-400 text-center mb-4 md:mb-6 text-xs md:text-sm">
                {t.result.performanceSubtitle}
              </p>
              <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={performanceData}>
                  <XAxis dataKey="category" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 8]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(99,102,241,0.5)', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                          <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(value) => value === 'correctas' ? t.result.correct : t.result.incorrect} />
                  <Bar dataKey="correctas" fill="#6366F1" name={t.result.correct} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="incorrectas" fill="#ef4444" name={t.result.incorrect} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              
              {/* Summary */}
              <div className="mt-6 bg-white/5 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{correctAnswers}</div>
                    <div className="text-xs text-gray-400">{t.result.correct}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{questions.length - correctAnswers}</div>
                    <div className="text-xs text-gray-400">{t.result.incorrect}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#6366F1]">{percentageCorrect}%</div>
                    <div className="text-xs text-gray-400">{t.result.accuracy}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] p-6 md:p-8 text-white text-center border-b border-white/10">
              <FaDownload className="text-4xl md:text-6xl mx-auto mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{t.result.certificateTitle}</h2>
              <p className="text-sm md:text-base lg:text-lg opacity-90">{t.result.certificateSubtitle}</p>
            </div>
            <div className="p-4 md:p-8">
              {/* Certificate Preview */}
              <div className="border-2 border-[#6366F1]/60 rounded-xl p-8 bg-white/5 mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t.certificate.title}</h3>
                  <p className="text-gray-400 mb-4">{t.certificate.certifies}</p>
                  <p className="text-3xl font-bold text-[#6366F1] mb-4">{userName}</p>
                  <p className="text-gray-400 mb-2">{t.certificate.completed}</p>
                  <p className="text-gray-400 mb-4">{t.certificate.obtained}</p>
                  <div className="text-6xl font-black text-white mb-4">{userIQ}</div>
                  <p className="text-lg font-semibold text-gray-200 mb-6">{t.certificate.category}: {category}</p>
                  <p className="text-sm text-gray-500">
                    {t.certificate.issueDate}: {new Date().toLocaleDateString(
                      lang === 'es' ? 'es-ES' : 
                      lang === 'en' ? 'en-US' : 
                      lang === 'fr' ? 'fr-FR' : 
                      lang === 'de' ? 'de-DE' : 
                      lang === 'it' ? 'it-IT' : 
                      lang === 'pt' ? 'pt-PT' : 
                      lang === 'sv' ? 'sv-SE' : 'no-NO',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </p>
                </div>
              </div>
              
              <button
                onClick={downloadCertificate}
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#04775c] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                <FaDownload className="text-2xl" />
                {t.result.downloadCertificate}
              </button>
              </div>
            </div>

            {/* Share Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-4 md:p-8 lg:p-12 mb-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
                {t.result.shareTitle}
              </h2>
              <p className="text-gray-400 text-sm md:text-base lg:text-lg">
                {t.result.shareSubtitle}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <button
                  onClick={shareOnFacebook}
                className="flex items-center gap-2 md:gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                <FaFacebook className="text-xl md:text-2xl" />
                  Facebook
                </button>
                <button
                  onClick={shareOnTwitter}
                className="flex items-center gap-2 md:gap-3 bg-sky-500 hover:bg-sky-600 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                <FaTwitter className="text-xl md:text-2xl" />
                  Twitter
                </button>
                <button
                  onClick={shareOnLinkedIn}
                className="flex items-center gap-2 md:gap-3 bg-blue-700 hover:bg-blue-800 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                <FaLinkedin className="text-xl md:text-2xl" />
                  LinkedIn
                </button>
            </div>
          </div>


        </div>
      </div>
    </>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando resultado...</p>
        </div>
      </div>
    }>
      <ResultadoContent />
    </Suspense>
  )
}

