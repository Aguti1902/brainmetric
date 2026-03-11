'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function EncuestaSatisfaccionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('cancelEmail')
    if (!email) {
      router.push(`/${lang}/cancelar-suscripcion`)
      return
    }
    setUserEmail(email)
  }, [router, lang])

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score)
  }

  const handleContinue = async () => {
    if (selectedScore === null) {
      alert('Por favor, selecciona una puntuación')
      return
    }

    setSubmitting(true)

    try {
      // Guardar la encuesta
      await fetch('/api/satisfaction-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          score: selectedScore,
          timestamp: new Date().toISOString()
        })
      })

      // Continuar a página de gracias
      router.push(`/${lang}/cancelar-suscripcion/gracias`)
    } catch (error) {
      console.error('Error guardando encuesta:', error)
      // Continuar de todos modos
      router.push(`/${lang}/cancelar-suscripcion/gracias`)
    }
  }

  const handleSkip = () => {
    // Omitir y continuar
    router.push(`/${lang}/cancelar-suscripcion/gracias`)
  }

  const getScoreColor = (score: number) => {
    if (score <= 2) return 'bg-red-200 border-red-300 hover:bg-red-300'
    if (score <= 4) return 'bg-orange-200 border-orange-300 hover:bg-orange-300'
    if (score <= 6) return 'bg-yellow-200 border-yellow-300 hover:bg-yellow-300'
    if (score <= 8) return 'bg-lime-200 border-lime-300 hover:bg-lime-300'
    return 'bg-green-200 border-green-300 hover:bg-green-300'
  }

  const getScoreSelectedColor = (score: number) => {
    if (score <= 2) return 'bg-red-300 border-red-500'
    if (score <= 4) return 'bg-orange-300 border-orange-500'
    if (score <= 6) return 'bg-yellow-300 border-yellow-500'
    if (score <= 8) return 'bg-lime-300 border-lime-500'
    return 'bg-green-300 border-green-500'
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 md:py-10">
        <div className="container-custom max-w-5xl px-4">
          
          {/* Notificación compacta */}
          <div className="bg-blue-100 border border-blue-300 text-blue-800 text-center py-2 px-4 rounded-lg mb-4">
            <p className="font-medium text-sm">Se ha cancelado tu suscripción.</p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            
            {/* Título compacto */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
              Qué pena que te nos vayas
            </h1>
            
            <p className="text-sm md:text-base text-gray-600 text-center mb-6">
              En una escala del 0 al 10, ¿cuál es tu grado de satisfacción con Brain Metric?
            </p>

            {/* Escala de Satisfacción - Compacta */}
            <div className="border-2 border-gray-300 rounded-xl p-4 md:p-6 mb-6">
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreSelect(score)}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 flex items-center justify-center
                      text-lg md:text-xl font-bold transition-all transform hover:scale-110
                      ${selectedScore === score 
                        ? `${getScoreSelectedColor(score)} scale-110 shadow-md ring-2 ring-${score <= 2 ? 'red' : score <= 4 ? 'orange' : score <= 6 ? 'yellow' : score <= 8 ? 'lime' : 'green'}-400`
                        : getScoreColor(score)
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Gran insatisfacción</span>
                <span>Gran satisfacción</span>
              </div>
            </div>

            {/* Botones compactos */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                disabled={submitting || selectedScore === null}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 md:py-4 px-6 rounded-xl font-bold text-base md:text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  'Continuar'
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={submitting}
                className="w-full text-[#6366F1] hover:text-[#4F46E5] font-semibold text-sm md:text-base transition disabled:opacity-50"
              >
                Omitir
              </button>
            </div>

            {/* Mensajes de agradecimiento compactos */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600 text-xs">
                💙 Tu opinión nos ayuda a mejorar el servicio
              </p>
              <p className="text-gray-500 text-xs">
                Tus respuestas son anónimas
              </p>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

