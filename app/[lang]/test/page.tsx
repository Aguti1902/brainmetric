'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { visualQuestions, calculateIQ } from '@/lib/visual-questions'
import Header from '@/components/Header'
import TestHeader from '@/components/TestHeader'
import VisualCell from '@/components/VisualCell'
import { FaClock, FaUser, FaBrain, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'
import { saveTestResult, calculateCategoryScores, updateUserInfo } from '@/lib/test-history'

// Milestone slides shown at question checkpoints
const MILESTONE_DATA = [
  {
    triggerAfterQ: 4, // after answering Q5 (0-indexed)
    percent: 25,
    icon: '🧠',
    emoji_bg: 'from-indigo-500 to-violet-600',
    title: '¡Gran inicio!',
    subtitle: 'Tu cerebro está procesando los patrones correctamente.',
    fact: 'El coeficiente intelectual mide habilidades cognitivas clave: razonamiento lógico, memoria de trabajo y velocidad de procesamiento.',
    tag: 'Nivel inicial completado',
  },
  {
    triggerAfterQ: 9, // after Q10
    percent: 50,
    icon: '⚡',
    emoji_bg: 'from-violet-500 to-purple-600',
    title: '¡A mitad de camino!',
    subtitle: 'Tu velocidad de respuesta es excelente. Sigue así.',
    fact: 'Las personas con alto IQ tienden a encontrar conexiones entre conceptos aparentemente no relacionados, lo que se llama "pensamiento lateral".',
    tag: 'Fase de matrices completada',
  },
  {
    triggerAfterQ: 14, // after Q15
    percent: 75,
    icon: '🔥',
    emoji_bg: 'from-purple-500 to-indigo-600',
    title: '¡Casi terminado!',
    subtitle: 'Solo 5 preguntas más para conocer tu resultado.',
    fact: 'El razonamiento abstracto es uno de los mejores predictores del rendimiento académico y profesional, independientemente de la educación.',
    tag: 'Nivel avanzado en curso',
  },
  {
    triggerAfterQ: 17, // after Q18
    percent: 90,
    icon: '🏆',
    emoji_bg: 'from-indigo-400 to-violet-500',
    title: '¡Increíble progreso!',
    subtitle: 'Solo 2 preguntas más. Tu resultado está casi listo.',
    fact: 'Los tests de matrices progresivas son considerados la medida más pura de inteligencia fluida, libre de influencias culturales o educativas.',
    tag: 'Tramo final',
  },
]

export default function TestPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [userName, setUserName] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(20).fill(null))
  const [timeRemaining, setTimeRemaining] = useState(20 * 60)
  const [startTime, setStartTime] = useState<number>(0)
  const [showTooFastModal, setShowTooFastModal] = useState(false)
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null)
  const [milestoneEntering, setMilestoneEntering] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName')
    if (savedUserName) setUserName(savedUserName)
  }, [])

  useEffect(() => {
    if (!hasStarted) return
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
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

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('userName', userName)
      setStartTime(Date.now())
      setHasStarted(true)
    }
  }

  const animateSlide = (direction: 'left' | 'right', callback: () => void) => {
    setSlideDirection(direction)
    setIsTransitioning(true)
    setTimeout(() => {
      callback()
      setSlideDirection(direction === 'left' ? 'right' : 'left')
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideDirection(null)
      }, 300)
    }, 250)
  }

  const handleOptionSelect = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)

    if (currentQuestion === visualQuestions.length - 1) {
      const timeElapsed = Date.now() - startTime
      if (timeElapsed < 60 * 1000) {
        setShowTooFastModal(true)
        return
      }
      setShowFinishConfirmModal(true)
      return
    }

    // Check if this question triggers a milestone slide
    const milestoneIndex = MILESTONE_DATA.findIndex(m => m.triggerAfterQ === currentQuestion)
    if (milestoneIndex !== -1) {
      setTimeout(() => {
        setActiveMilestone(milestoneIndex)
        setTimeout(() => setMilestoneEntering(true), 50)
      }, 300)
      return
    }

    setTimeout(() => {
      animateSlide('left', () => setCurrentQuestion(currentQuestion + 1))
    }, 200)
  }

  const handleMilestoneContinue = () => {
    setMilestoneEntering(false)
    setTimeout(() => {
      setActiveMilestone(null)
      animateSlide('left', () => setCurrentQuestion(currentQuestion + 1))
    }, 400)
  }

  const handleFinishTest = async () => {
    let correctCount = 0
    answers.forEach((answer, index) => {
      if (answer === visualQuestions[index].correctAnswer) correctCount++
    })

    const iq = calculateIQ(correctCount)
    const timeElapsed = (20 * 60) - timeRemaining
    const categoryScores = calculateCategoryScores(answers, visualQuestions)
    
    localStorage.setItem('userIQ', iq.toString())
    localStorage.setItem('correctAnswers', correctCount.toString())
    localStorage.setItem('userName', userName)
    localStorage.removeItem('isPremiumTest')
    
    const testResults = { answers, timeElapsed, completedAt: new Date().toISOString(), userName }
    localStorage.setItem('testResults', JSON.stringify(testResults))

    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const response = await fetch('/api/save-test-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ iq, correctAnswers: correctCount, timeElapsed, answers, categoryScores })
        })
        if (response.ok) console.log('Test result saved')
      } catch (error) {
        console.error('Error saving test result:', error)
      }
    }
    
    router.push(`/${lang}/analizando`)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      animateSlide('right', () => setCurrentQuestion(currentQuestion - 1))
    }
  }

  const handleNext = () => {
    if (currentQuestion < visualQuestions.length - 1) {
      animateSlide('left', () => setCurrentQuestion(currentQuestion + 1))
    } else {
      const timeElapsed = Date.now() - startTime
      if (timeElapsed < 60 * 1000) {
        setShowTooFastModal(true)
        return
      }
      setShowFinishConfirmModal(true)
    }
  }

  const question = visualQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / visualQuestions.length) * 100
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']
  const answeredCount = answers.filter(a => a !== null).length

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">{t ? t.test.loading : 'Loading...'}</p>
          </div>
        </div>
      </>
    )
  }

  if (!hasStarted) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center py-8 neural-bg">
          <div className="container-custom max-w-2xl">
            <div className="glass p-12 text-center animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
                <FaBrain className="text-4xl text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                <span className="text-white">Brain</span>
                <span className="text-gradient"> Metric</span>
                {' '}{t.test.title}
              </h1>
              
              <p className="text-xl text-gray-400 mb-8">
                {t.test.welcomeSubtitle}
              </p>

              <form onSubmit={handleStart} className="max-w-md mx-auto">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={t.test.namePlaceholder}
                  className="w-full px-6 py-4 text-lg bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500 mb-6"
                  required
                  autoFocus
                />

                <button type="submit" className="w-full btn-primary text-xl py-4">
                  {t.test.startButton}
                </button>
              </form>

              <div className="mt-8 glass p-6 text-left border-l-4 border-primary-500">
                <h3 className="font-bold text-white mb-3">{t.test.instructionsTitle}</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li dangerouslySetInnerHTML={{ __html: `• ${t.test.instruction1}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t.test.instruction2}` }} />
                  <li dangerouslySetInnerHTML={{ __html: `• ${t.test.instruction3}` }} />
                  <li>• {t.test.instruction4}</li>
                  <li>• {t.test.instruction5}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <TestHeader 
        timeRemaining={timeRemaining}
        currentQuestion={currentQuestion}
        totalQuestions={visualQuestions.length}
        userName={userName}
        t={t}
      />
      
      <div className="min-h-screen bg-secondary-950 neural-bg py-2 lg:py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Progress section with question indicators */}
          <div className="mb-3 lg:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">
                Pregunta {currentQuestion + 1} de {visualQuestions.length}
              </span>
              <span className="text-xs text-gray-400">
                {answeredCount}/{visualQuestions.length} respondidas
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 lg:h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Question dot indicators */}
            <div className="flex gap-1 mt-3 justify-center flex-wrap">
              {visualQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const dir = idx > currentQuestion ? 'left' : 'right'
                    animateSlide(dir, () => setCurrentQuestion(idx))
                  }}
                  className={`w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full transition-all duration-200 ${
                    idx === currentQuestion
                      ? 'bg-primary-500 scale-125 shadow-lg shadow-primary-500/40'
                      : answers[idx] !== null
                      ? 'bg-primary-500/40 hover:bg-primary-500/60'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title={`Pregunta ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Main content with slide animation */}
          <div
            ref={contentRef}
            className={`transition-all duration-300 ease-out ${
              isTransitioning && slideDirection === 'left' ? 'opacity-0 -translate-x-12' :
              isTransitioning && slideDirection === 'right' ? 'opacity-0 translate-x-12' :
              'opacity-100 translate-x-0'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 items-stretch">
              {/* Matrix panel */}
              <div className="glass p-4 lg:p-6 flex flex-col">
                <h3 className="text-sm lg:text-base font-semibold text-gray-300 mb-2 lg:mb-3 text-center">
                  {t.test.completeSequence}
                </h3>
                
                <div className="grid grid-cols-3 gap-1.5 lg:gap-2 w-full max-w-[280px] lg:max-w-[340px] mx-auto p-1 lg:p-2 flex-1">
                  {question.matrix.flat().map((cell, index) => (
                    <VisualCell 
                      key={`${currentQuestion}-${index}`}
                      cell={cell} 
                      size={80}
                      isHighlighted={cell.type === 'empty'}
                    />
                  ))}
                </div>
              </div>

              {/* Options panel */}
              <div className="glass p-4 lg:p-6 border-2 border-primary-500/30 flex flex-col">
                <h3 className="text-sm lg:text-base font-semibold text-gray-300 mb-2 lg:mb-3 text-center">
                  {t.test.chooseAnswer}
                </h3>
                
                <div className="grid grid-cols-3 gap-1.5 lg:gap-2 w-full max-w-[280px] lg:max-w-[340px] mx-auto p-1 lg:p-2 flex-1">
                  {question.options.map((option, index) => (
                    <div key={`${currentQuestion}-opt-${index}`} className="flex flex-col items-center gap-1 lg:gap-1.5">
                      <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold transition-all duration-200 ${
                        answers[currentQuestion] === index
                          ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {optionLetters[index]}
                      </div>
                      <div 
                        className={`w-full aspect-square cursor-pointer transition-all duration-200 rounded-xl ${
                          answers[currentQuestion] === index ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-secondary-950' : ''
                        }`}
                        onClick={() => handleOptionSelect(index)}
                      >
                        <VisualCell cell={option} isOption={true} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center mt-3 lg:mt-6 gap-3 lg:gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-xs lg:text-sm transition-all ${
                currentQuestion === 0 
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                  : 'glass text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FaChevronLeft className="text-xs" />
              <span className="hidden sm:inline">{t.test.previous}</span>
            </button>

            <div className="px-5 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold text-sm lg:text-base shadow-lg shadow-primary-500/25">
              {currentQuestion + 1}/{visualQuestions.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 lg:gap-2 px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-xs lg:text-sm transition-all glass text-gray-300 hover:text-white hover:bg-white/10"
            >
              <span className="hidden sm:inline">{currentQuestion === visualQuestions.length - 1 ? t.test.finish : t.test.next}</span>
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Finish confirmation modal */}
      {showFinishConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-lg w-full p-8 animate-fade-in border border-primary-500/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t.test.confirmFinishTitle}
              </h3>
              <p className="text-gray-400 mb-8">
                {t.test.confirmFinishMessage}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowFinishConfirmModal(false)}
                  className="flex-1 btn-secondary py-3"
                >
                  {t.test.goBack}
                </button>
                <button
                  onClick={() => { setShowFinishConfirmModal(false); handleFinishTest() }}
                  className="flex-1 btn-primary py-3"
                >
                  {t.test.getResults}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anti-bot modal */}
      {showTooFastModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-md w-full p-8 animate-fade-in border border-yellow-500/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                <FaClock className="text-3xl text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t?.test?.tooFastTitle}
              </h3>
              <p className="text-gray-400 mb-8">
                {t?.test?.tooFastMessage}
              </p>
              <button
                onClick={() => setShowTooFastModal(false)}
                className="w-full btn-primary py-3"
              >
                {t?.test?.understood}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MILESTONE SLIDES ── */}
      {activeMilestone !== null && (() => {
        const ms = MILESTONE_DATA[activeMilestone]
        const circumference = 2 * Math.PI * 42
        const dashOffset = circumference * (1 - ms.percent / 100)
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(2,6,23,0.96)',
              backdropFilter: 'blur(24px)',
              transition: 'opacity 0.4s ease',
              opacity: milestoneEntering ? 1 : 0,
            }}
          >
            {/* Background orbs */}
            <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

            <div
              className="relative max-w-md w-full text-center"
              style={{
                transition: 'transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.4s ease',
                transform: milestoneEntering ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
                opacity: milestoneEntering ? 1 : 0,
              }}
            >
              {/* Tag pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                {ms.tag}
              </div>

              {/* Progress ring */}
              <div className="relative w-44 h-44 mx-auto mb-8">
                <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                  <defs>
                    <linearGradient id="milestoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="6" />
                  {/* Progress arc */}
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#milestoneGrad)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={milestoneEntering ? dashOffset : circumference}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1) 0.2s', filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' }}
                  />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-1">{ms.icon}</span>
                  <span className="text-3xl font-extrabold text-white leading-none">{ms.percent}%</span>
                  <span className="text-xs text-gray-400 mt-0.5">completado</span>
                </div>
              </div>

              {/* Title & subtitle */}
              <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight">{ms.title}</h2>
              <p className="text-gray-400 text-base mb-6">{ms.subtitle}</p>

              {/* Fact card */}
              <div className="rounded-2xl p-5 mb-8 text-left"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderLeft: '4px solid #6366f1' }}>
                <p className="text-primary-400 text-xs font-bold uppercase tracking-widest mb-2">¿Sabías que?</p>
                <p className="text-gray-300 text-sm leading-relaxed">{ms.fact}</p>
              </div>

              {/* CTA */}
              <button
                onClick={handleMilestoneContinue}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-3"
              >
                Continuar el test
                <svg viewBox="0 0 20 20" className="w-5 h-5 fill-white">
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                </svg>
              </button>

              {/* Question counter */}
              <p className="text-gray-600 text-xs mt-4">
                Pregunta {currentQuestion + 2} de {visualQuestions.length} a continuación
              </p>
            </div>
          </div>
        )
      })()}
    </>
  )
}
