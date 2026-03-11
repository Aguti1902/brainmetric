'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { calculateIQ, type VisualQuestion } from '@/lib/visual-questions'
import Header from '@/components/Header'
import VisualCell from '@/components/VisualCell'
import { FaClock, FaUser } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'
import { saveTestResult, calculateCategoryScores, updateUserInfo } from '@/lib/test-history'

export default function TestPremiumPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [hasStarted, setHasStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(20).fill(null))
  const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes in seconds
  const [startTime, setStartTime] = useState<number>(0)
  const [showTooFastModal, setShowTooFastModal] = useState(false)
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false)
  const [visualQuestions, setVisualQuestions] = useState<VisualQuestion[]>([])
  const [questionsLoaded, setQuestionsLoaded] = useState(false)

  // Cargar las preguntas dinámicamente
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { visualQuestions: questions } = await import('@/lib/visual-questions')
        console.log('Preguntas cargadas:', questions.length)
        setVisualQuestions(questions)
        setQuestionsLoaded(true)
        
        // Resetear el estado del test cuando se cargan las preguntas
        setCurrentQuestion(0)
        setAnswers(Array(questions.length).fill(null))
        setTimeRemaining(20 * 60)
        setShowFinishConfirmModal(false)
        setShowTooFastModal(false)
      } catch (error) {
        console.error('Error cargando preguntas:', error)
      }
    }
    loadQuestions()
  }, [])

  useEffect(() => {
    // Verificar que el usuario es premium
    const paymentCompleted = localStorage.getItem('paymentCompleted')
    const userEmail = localStorage.getItem('userEmail')
    
    if (!paymentCompleted || !userEmail) {
      router.push(`/${lang}/test`)
      return
    }

    // Iniciar test automáticamente para usuarios premium
    setStartTime(Date.now())
    setHasStarted(true)
  }, [router, lang])

  useEffect(() => {
    if (!hasStarted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Tiempo agotado - finalizar automáticamente
          handleFinishTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)

    // Si es la última pregunta, auto-finalizar el test
    if (currentQuestion === visualQuestions.length - 1) {
      setTimeout(() => {
        // Finalizar automáticamente con las respuestas actualizadas
        handleFinishTestWithAnswers(newAnswers)
      }, 300)
    } else {
      // Auto-avanzar a la siguiente pregunta
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    }
  }

  const handleFinishTestWithAnswers = (finalAnswers: (number | null)[]) => {
    try {
      // Verificar que tenemos los datos necesarios
      if (!visualQuestions || visualQuestions.length === 0) {
        console.error('visualQuestions no está disponible')
        alert('Error: No se pudieron cargar las preguntas. Por favor, recarga la página.')
        return
      }

      // Calcular respuestas correctas usando las respuestas finales
      let correctCount = 0
      finalAnswers.forEach((answer, index) => {
        if (answer !== null && visualQuestions[index] && answer === visualQuestions[index].correctAnswer) {
          correctCount++
        }
      })

      const iq = calculateIQ(correctCount)
      const timeElapsed = (20 * 60) - timeRemaining
      
      // Obtener datos del usuario desde localStorage
      const userName = localStorage.getItem('userName') || 'Usuario Premium'
      const email = localStorage.getItem('userEmail') || ''
      
      // Actualizar información del usuario
      updateUserInfo(userName, email)
      
      // Calcular categoryScores de forma segura
      let categoryScores
      try {
        categoryScores = calculateCategoryScores(finalAnswers, visualQuestions)
      } catch (error) {
        console.error('Error calculando categoryScores:', error)
        categoryScores = {
          logicalReasoning: 0,
          visualPerception: 0,
          patternRecognition: 0,
          abstractThinking: 0,
          workingMemory: 0,
          processingSpeed: 0
        }
      }
      
      // Guardar resultado en el historial
      saveTestResult({
        iq,
        correctAnswers: correctCount,
        totalQuestions: 20,
        timeElapsed,
        answers: finalAnswers,
        categoryScores
      })
      
      // Mantener compatibilidad con sistema antiguo
      const testResults = {
        answers: finalAnswers,
        timeElapsed,
        completedAt: new Date().toISOString(),
        userName
      }
      localStorage.setItem('testResults', JSON.stringify(testResults))
      localStorage.setItem('userIQ', iq.toString())
      localStorage.setItem('correctAnswers', correctCount.toString())
      
      // Marcar que este es un test premium para evitar la pantalla de checkout
      localStorage.setItem('isPremiumTest', 'true')
      
      console.log('Test completado exitosamente, redirigiendo...')
      
      // Redirigir directamente a análisis (sin checkout, ya es premium)
      router.push(`/${lang}/analizando`)
    } catch (error) {
      console.error('Error al finalizar el test:', error)
      alert('Hubo un error al procesar tus resultados. Por favor, inténtalo de nuevo.')
    }
  }

  const handleFinishTest = () => {
    handleFinishTestWithAnswers(answers)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < visualQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Si está en la última pregunta, verificar anti-bot y mostrar modal
      const timeElapsed = Date.now() - startTime
      const oneMinute = 60 * 1000
      
      if (timeElapsed < oneMinute) {
        setShowTooFastModal(true)
        return
      }
      
      // Mostrar modal de confirmación
      setShowFinishConfirmModal(true)
    }
  }

  // Verificar que tenemos datos antes de renderizar
  if (loading || !t || !questionsLoaded || !visualQuestions || visualQuestions.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t ? t.test.loading : 'Loading...'}</p>
          </div>
        </div>
      </>
    )
  }

  const question = visualQuestions[currentQuestion]
  
  // Validación de la pregunta actual
  if (!question || !question.matrix || !question.options) {
    console.error('Question data is invalid:', question, 'currentQuestion:', currentQuestion, 'total questions:', visualQuestions.length)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t ? t.test.loading : 'Loading...'}</p>
          </div>
        </div>
      </>
    )
  }
  
  const progress = ((currentQuestion + 1) / visualQuestions.length) * 100
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']

  // Aplanar la matriz 3x3 en un array 1D para renderizar
  const flatMatrix = question.matrix.flat()
  const userName = localStorage.getItem('userName') || 'Usuario Premium'

  // Pantalla del test
  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header del test */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                {t.test.hello}, {userName} 👋
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {t.test.question} {currentQuestion + 1} {t.test.of} {visualQuestions.length}
              </h2>
            </div>
            
            <div className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-lg ${
              timeRemaining < 60 ? 'bg-red-100 text-red-600' :
              timeRemaining < 300 ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <FaClock />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mb-8 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-8">
            {/* Matriz 3x3 - Izquierda */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {t.test.completeSequence}
              </h3>
              
              <div className="grid grid-cols-3 gap-3 flex-1">
                {flatMatrix.map((cell, index) => (
                  <div 
                    key={index}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                      index === 8 
                        ? 'border-4 border-dashed border-[#6366F1] bg-[#e6f5f5]' 
                        : 'border-2 border-gray-300 bg-white'
                    }`}
                  >
                    {index === 8 ? (
                      <span className="text-5xl font-bold text-[#6366F1]">?</span>
                    ) : (
                      <VisualCell cell={cell} size={80} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Opciones - Derecha */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {t.test.chooseAnswer}
              </h3>
              
              <div className="grid grid-cols-3 gap-3 flex-1 content-center">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`aspect-square rounded-lg transition-all duration-200 relative ${
                      answers[currentQuestion] === index
                        ? 'border-4 border-[#6366F1] bg-[#e6f5f5] ring-4 ring-[#6366F1]/20 scale-105'
                        : 'border-2 border-gray-300 bg-white hover:border-[#6366F1] hover:shadow-lg'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <VisualCell cell={option} size={80} />
                    </div>
                    <div className="absolute top-2 left-2 bg-[#6366F1] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md">
                      {optionLetters[index]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentQuestion === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-[#0F172A] border-2 border-[#0F172A] hover:bg-[#0F172A] hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t.test.previous}
            </button>

            <div className="px-6 py-3 bg-[#6366F1] text-white rounded-full font-bold text-lg shadow-md">
              {currentQuestion + 1}/{visualQuestions.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all bg-[#0F172A] text-white hover:bg-[#1E1B4B] shadow-md hover:shadow-lg"
            >
              {currentQuestion === visualQuestions.length - 1 ? t.test.finish : t.test.next}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación finalizar */}
      {showFinishConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fadeIn">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t.test.confirmFinishTitle}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {t.test.confirmFinishMessage}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFinishConfirmModal(false)}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-all duration-200"
                >
                  {t.test.goBack}
                </button>
                <button
                  onClick={() => {
                    setShowFinishConfirmModal(false)
                    handleFinishTest()
                  }}
                  className="flex-1 bg-[#0F172A] hover:bg-[#1E1B4B] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {t.test.getResults}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal anti-bot */}
      {showTooFastModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaClock className="text-3xl text-yellow-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t?.test?.tooFastTitle}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {t?.test?.tooFastMessage}
              </p>
              
              <button
                onClick={() => setShowTooFastModal(false)}
                className="w-full bg-[#0F172A] hover:bg-[#1E1B4B] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t?.test?.understood}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
