'use client'

import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaBrain, FaUser, FaHeart, FaSmile, FaChartLine } from 'react-icons/fa'

export default function TestsPage() {
  const { lang } = useParams()
  const router = useRouter()

  const tests = [
    {
      id: 'personality',
      title: 'Test de Personalidad',
      subtitle: 'Big Five (OCEAN)',
      description: 'Descubre los 5 rasgos fundamentales de tu personalidad: Apertura, Responsabilidad, Extroversión, Amabilidad y Neuroticismo.',
      icon: <FaUser className="text-5xl" />,
      color: 'from-purple-500 to-purple-700',
      questions: 44,
      time: '10-15 min',
      route: '/tests/personality',
      available: true
    },
    {
      id: 'adhd',
      title: 'Test de TDAH',
      subtitle: 'Evaluación de Atención',
      description: 'Evalúa síntomas de Trastorno por Déficit de Atención e Hiperactividad basado en criterios DSM-5.',
      icon: <FaBrain className="text-5xl" />,
      color: 'from-blue-500 to-blue-700',
      questions: 18,
      time: '5-8 min',
      route: '/tests/adhd',
      available: true
    },
    {
      id: 'anxiety',
      title: 'Test de Ansiedad',
      subtitle: 'GAD-7',
      description: 'Mide el nivel de ansiedad generalizada con la escala clínica GAD-7 validada internacionalmente.',
      icon: <FaHeart className="text-5xl" />,
      color: 'from-red-500 to-red-700',
      questions: 7,
      time: '2-3 min',
      route: '/tests/anxiety',
      available: true
    },
    {
      id: 'depression',
      title: 'Test de Depresión',
      subtitle: 'PHQ-9',
      description: 'Evaluación del estado de ánimo y síntomas depresivos usando el cuestionario PHQ-9.',
      icon: <FaSmile className="text-5xl" />,
      color: 'from-gray-500 to-gray-700',
      questions: 9,
      time: '3-5 min',
      route: '/tests/depression',
      available: true
    },
    {
      id: 'eq',
      title: 'Inteligencia Emocional',
      subtitle: 'Test EQ',
      description: 'Mide tu capacidad para reconocer, comprender y gestionar emociones propias y ajenas.',
      icon: <FaChartLine className="text-5xl" />,
      color: 'from-green-500 to-green-700',
      questions: 33,
      time: '8-10 min',
      route: '/tests/eq',
      available: true
    }
  ]

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container-custom max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] rounded-full mb-6">
              <FaBrain className="text-5xl text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Tests de Evaluación
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre más sobre ti con nuestros tests científicamente validados. 
              Evalúa tu personalidad, atención, emociones y más.
            </p>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
                  test.available 
                    ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => test.available && router.push(`/${lang}${test.route}`)}
              >
                {/* Header con gradiente */}
                <div className={`bg-gradient-to-r ${test.color} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10 flex items-center justify-center mb-4">
                    {test.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">
                    {test.title}
                  </h3>
                  <p className="text-center text-white/90 text-sm font-medium">
                    {test.subtitle}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 min-h-[80px]">
                    {test.description}
                  </p>

                  {/* Info badges */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">📝</span>
                      <span className="text-sm font-medium text-gray-700">
                        {test.questions} preguntas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">⏱️</span>
                      <span className="text-sm font-medium text-gray-700">
                        {test.time}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  {test.available ? (
                    <button
                      className={`w-full bg-gradient-to-r ${test.color} text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105`}
                    >
                      Comenzar Test
                    </button>
                  ) : (
                    <div className="w-full bg-gray-200 text-gray-500 font-bold py-3 px-6 rounded-xl text-center">
                      Próximamente
                    </div>
                  )}
                </div>

                {/* Badge "Premium" si aplica */}
                {test.available && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    PREMIUM
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] rounded-2xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              ¿Por qué hacer estos tests?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Nuestros tests están basados en investigaciones científicas y te ayudan a conocerte mejor, 
              identificar áreas de mejora y tomar decisiones más informadas sobre tu bienestar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl mb-3">🔬</div>
                <h3 className="font-bold mb-2">Científicamente Validados</h3>
                <p className="text-sm opacity-90">
                  Basados en investigaciones y estándares internacionales
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold mb-2">Resultados Detallados</h3>
                <p className="text-sm opacity-90">
                  Análisis completo con gráficos y recomendaciones personalizadas
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="font-bold mb-2">100% Privado</h3>
                <p className="text-sm opacity-90">
                  Tus resultados son confidenciales y solo tú puedes verlos
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => router.push(`/${lang}/cuenta`)}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
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

