'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaCheckCircle, FaStar, FaHeart } from 'react-icons/fa'

export default function GraciasCancelacionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const [countdown, setCountdown] = useState(10)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Limpiar localStorage
    localStorage.removeItem('cancelEmail')
    localStorage.removeItem('cancelName')
    localStorage.removeItem('paymentCompleted')
    localStorage.removeItem('subscriptionId')
  }, [])

  // Countdown para redirección automática
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      handleRedirectToTrustpilot()
    }
  }, [countdown])

  const handleRedirectToTrustpilot = () => {
    if (redirecting) return
    
    setRedirecting(true)
    // Abrir Trustpilot en la misma pestaña
    window.location.href = 'https://www.trustpilot.com/evaluate/brainmetric.io'
  }

  const handleGoHome = () => {
    router.push(`/${lang}`)
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 md:py-10">
        <div className="container-custom max-w-6xl px-4">
          
          {/* Card Principal con Grid */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              
              {/* COLUMNA IZQUIERDA: Confirmación */}
              <div className="text-center lg:text-left space-y-4">
                
                {/* Icono y título */}
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-3">
                    <FaCheckCircle className="text-3xl text-green-600" />
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Suscripción Cancelada
                  </h1>

                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Lamentamos verte partir, pero respetamos tu decisión
                  </p>
                </div>

                {/* Información importante */}
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-4 text-left">
                  <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                    ℹ️ Información importante:
                  </h3>
                  <ul className="space-y-1.5 text-blue-800 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Tu suscripción seguirá activa hasta el final del período actual</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>No se realizarán más cobros después</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Tu historial se mantendrá por 30 días</span>
                    </li>
                  </ul>
                </div>

                {/* Mensaje de vuelta */}
                <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#6366F1]/5 border border-[#6366F1]/30 rounded-xl p-4 text-center">
                  <p className="text-gray-700 text-xs mb-2">
                    ¿Cambiaste de opinión? Siempre puedes volver
                  </p>
                  <a 
                    href={`/${lang}/pricing`}
                    className="text-[#6366F1] hover:text-[#4F46E5] font-semibold underline text-sm"
                  >
                    Ver planes disponibles →
                  </a>
                </div>

                {/* Testimonio compacto */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                    <p className="text-xs font-semibold text-gray-800">Carlos M.</p>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    "Volví después de 2 meses. Ojalá no hubiera cancelado."
                  </p>
                </div>

              </div>

              {/* COLUMNA DERECHA: Trustpilot */}
              <div className="bg-[#6366F1]/10 border-2 border-[#6366F1] rounded-xl p-6 flex flex-col justify-center">
                
                <FaHeart className="text-3xl text-[#6366F1] mx-auto mb-3" />
                
                <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-3 text-center">
                  Tu opinión es muy importante
                </h2>
                
                <p className="text-sm text-gray-700 mb-4 text-center">
                  ¿Nos dejas una reseña en Trustpilot? Tu feedback nos ayuda a mejorar.
                </p>

                {/* Logo Trustpilot */}
                <div className="bg-white rounded-xl p-4 mb-4 border border-[#6366F1]/30">
                  <img 
                    src="https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg" 
                    alt="Trustpilot" 
                    className="h-8 mx-auto mb-2"
                  />
                  <p className="text-xs text-gray-600 text-center">
                    Redirigiendo en{' '}
                    <span className="font-bold text-xl text-[#6366F1]">{countdown}</span>{' '}
                    segundos...
                  </p>
                  <div className="mt-3 bg-[#6366F1]/20 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#6366F1] h-full transition-all duration-1000"
                      style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Botones */}
                <div className="space-y-2">
                  <button
                    onClick={handleRedirectToTrustpilot}
                    disabled={redirecting}
                    className="w-full bg-gradient-to-r from-[#0F172A] to-[#1a4a5e] hover:from-[#1a4a5e] hover:to-[#0F172A] text-white py-3 px-6 rounded-xl font-bold text-sm md:text-base transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {redirecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Redirigiendo...
                      </>
                    ) : (
                      <>
                        <FaStar className="text-[#6366F1]" />
                        Dejar Reseña en Trustpilot
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGoHome}
                    className="w-full text-gray-600 hover:text-gray-800 font-medium text-xs transition"
                  >
                    Ir al inicio sin dejar reseña
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

