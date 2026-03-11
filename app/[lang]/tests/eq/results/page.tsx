'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { EQResult, getEQInterpretation, getOverallEQLevel } from '@/lib/eq-questions'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'
import { FaBrain, FaTrophy } from 'react-icons/fa'

export default function EQResultsPage() {
  const { lang } = useParams()
  const router = useRouter()
  const [results, setResults] = useState<EQResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar que el pago esté completado o sea test premium
    const paymentCompleted = localStorage.getItem('paymentCompleted')
    const isPremiumTest = localStorage.getItem('isPremiumTest')
    
    if (!paymentCompleted && isPremiumTest !== 'true') {
      router.push(`/${lang}/tests/eq`)
      return
    }

    // Cargar resultados
    const eqResults = localStorage.getItem('eqResults')
    if (eqResults) {
      const parsed = JSON.parse(eqResults)
      if (parsed.results) {
        setResults(parsed.results)
      } else {
        router.push(`/${lang}/tests`)
      }
    } else {
      router.push(`/${lang}/tests`)
    }
    setLoading(false)
  }, [router, lang])

  if (loading || !results) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
        </div>
      </>
    )
  }

  const radarData = [
    { dimension: 'Autoconciencia', value: results.selfAwareness, fullMark: 100 },
    { dimension: 'Autorregulación', value: results.selfRegulation, fullMark: 100 },
    { dimension: 'Motivación', value: results.motivation, fullMark: 100 },
    { dimension: 'Empatía', value: results.empathy, fullMark: 100 },
    { dimension: 'Habilidades Sociales', value: results.socialSkills, fullMark: 100 }
  ]

  const overallLevel = getOverallEQLevel(results.overallEQ)

  const dimensions = [
    {
      name: 'Autoconciencia',
      key: 'selfAwareness',
      score: results.selfAwareness,
      icon: '🧠',
      color: 'from-purple-500 to-purple-600',
      description: 'Capacidad de reconocer y comprender tus propias emociones'
    },
    {
      name: 'Autorregulación',
      key: 'selfRegulation',
      score: results.selfRegulation,
      icon: '🎯',
      color: 'from-blue-500 to-blue-600',
      description: 'Control y gestión de emociones e impulsos'
    },
    {
      name: 'Motivación',
      key: 'motivation',
      score: results.motivation,
      icon: '🚀',
      color: 'from-yellow-500 to-yellow-600',
      description: 'Impulso interno para alcanzar objetivos'
    },
    {
      name: 'Empatía',
      key: 'empathy',
      score: results.empathy,
      icon: '❤️',
      color: 'from-pink-500 to-pink-600',
      description: 'Comprensión de las emociones de los demás'
    },
    {
      name: 'Habilidades Sociales',
      key: 'socialSkills',
      score: results.socialSkills,
      icon: '🤝',
      color: 'from-green-500 to-green-600',
      description: 'Capacidad de construir y mantener relaciones'
    }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
        <div className="container-custom max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-green-500 to-green-700 rounded-full mb-6">
              <span className="text-5xl">💚</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Tu Inteligencia Emocional
            </h1>
            <p className="text-xl text-gray-600">
              Resultados basados en el modelo de Inteligencia Emocional
            </p>
          </div>

          {/* Overall Score */}
          <div className={`bg-gradient-to-r ${overallLevel.color} rounded-2xl shadow-2xl p-12 text-white mb-8 text-center`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaTrophy className="text-5xl" />
              <h2 className="text-4xl font-bold">{overallLevel.title}</h2>
            </div>
            <div className="text-7xl font-black mb-4">{results.overallEQ}</div>
            <p className="text-sm opacity-90 mb-4">EQ General (de 100)</p>
            <p className="text-xl opacity-95 max-w-3xl mx-auto">
              {overallLevel.description}
            </p>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Perfil de Inteligencia Emocional
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="dimension" 
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                <Radar
                  name="Tu EQ"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6 mb-8">
            {dimensions.map((dim) => (
              <div key={dim.key} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${dim.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{dim.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold">{dim.name}</h3>
                        <p className="text-white/90 text-sm">{dim.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-5xl font-black">{dim.score}</div>
                      <div className="text-sm font-semibold opacity-90">/ 100</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`bg-gradient-to-r ${dim.color} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Análisis:</h4>
                    <p className="text-gray-700 text-sm">
                      {getEQInterpretation(dim.key, dim.score)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Practical Tips */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] rounded-2xl shadow-2xl p-12 text-white mb-8">
            <h2 className="text-4xl font-bold mb-6 text-center">Desarrolla tu Inteligencia Emocional</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-bold text-xl mb-3 text-[#6366F1]">Fortalezas</h3>
                <ul className="space-y-2 text-sm">
                  {dimensions
                    .filter(d => d.score >= 70)
                    .map(d => (
                      <li key={d.key} className="flex items-center gap-2">
                        <span className="text-[#6366F1]">✓</span>
                        <span>{d.name} ({d.score}%)</span>
                      </li>
                    ))}
                  {dimensions.filter(d => d.score >= 70).length === 0 && (
                    <li className="opacity-75">Perfil equilibrado</li>
                  )}
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="font-bold text-xl mb-3 text-yellow-300">Áreas de Mejora</h3>
                <ul className="space-y-2 text-sm">
                  {dimensions
                    .filter(d => d.score < 55)
                    .map(d => (
                      <li key={d.key} className="flex items-center gap-2">
                        <span className="text-yellow-300">→</span>
                        <span>{d.name} ({d.score}%)</span>
                      </li>
                    ))}
                  {dimensions.filter(d => d.score < 55).length === 0 && (
                    <li className="opacity-75">Buen desempeño en todas las áreas</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 text-gray-800 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">💡 Consejos para mejorar tu EQ:</h3>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Practica mindfulness:</strong> Aumenta tu autoconciencia emocional</li>
                <li>• <strong>Lleva un diario emocional:</strong> Registra y analiza tus emociones diarias</li>
                <li>• <strong>Escucha activa:</strong> Presta atención completa cuando otros hablan</li>
                <li>• <strong>Pausa antes de reaccionar:</strong> Toma 5 segundos antes de responder emocionalmente</li>
                <li>• <strong>Lee sobre lenguaje corporal:</strong> Mejora tu capacidad de leer emociones</li>
                <li>• <strong>Busca feedback:</strong> Pregunta a personas de confianza sobre tus habilidades emocionales</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push(`/${lang}/tests`)}
                className="flex items-center justify-center gap-2 bg-white text-[#0F172A] hover:bg-gray-100 px-8 py-4 rounded-lg font-bold transition-all"
              >
                <FaBrain />
                Hacer Otro Test
              </button>
              <button
                onClick={() => router.push(`/${lang}/cuenta`)}
                className="flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-4 rounded-lg font-bold transition-all"
              >
                Ver Mi Historial
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

