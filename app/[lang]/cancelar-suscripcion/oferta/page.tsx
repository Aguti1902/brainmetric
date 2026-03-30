'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaCrown, FaTag, FaStar, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa'

export default function OfertaCancelacionPage() {
  const router = useRouter()
  const { lang } = useParams()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Obtener email del localStorage o sessionStorage
    const email = localStorage.getItem('cancelEmail') || sessionStorage.getItem('userEmail')
    if (!email) {
      // Si no hay email, redirigir al formulario
      router.push(`/${lang}/cancelar-suscripcion`)
      return
    }
    setUserEmail(email)
  }, [router, lang])

  const handleAcceptDiscount = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/apply-retention-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          discountPercent: 50,
          durationMonths: 3
        })
      })

      if (response.ok) {
        // Redirigir a página de éxito con descuento
        router.push(`/${lang}/cancelar-suscripcion/exito?discount=true`)
      } else {
        alert('Error al aplicar el descuento. Por favor, contacta con soporte.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
      setLoading(false)
    }
  }

  const handleRejectOffer = () => {
    // Continuar al siguiente paso (confirmación)
    router.push(`/${lang}/cancelar-suscripcion/confirmar`)
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 md:py-10">
        <div className="container-custom max-w-7xl px-4">
          
          {/* Banner OFERTA LIMITADA */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-2 px-4 rounded-lg mb-4 shadow-lg animate-pulse">
            <p className="text-sm md:text-base font-bold tracking-wide">
              ⚡ ¡OFERTA LIMITADA SOLO HOY! ⚡
            </p>
          </div>

          {/* Header Principal + Contenido */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header compacto */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1a4a5e] px-6 py-6 text-white text-center">
              <div className="w-16 h-16 bg-[#6366F1] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl">
                <FaCrown className="text-3xl text-yellow-300" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                ¡Espera! Tenemos una oferta especial para ti
              </h1>
              <p className="text-sm md:text-base opacity-90">
                No queremos que te vayas sin ofrecerte lo mejor
              </p>
            </div>

            {/* Contenido en Grid 2 Columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              
              {/* COLUMNA IZQUIERDA: Oferta y Precios */}
              <div className="space-y-4">
                
                {/* Oferta Destacada */}
                <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#6366F1]/20 border-2 border-[#6366F1] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#6366F1] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <FaTag className="text-2xl text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#0F172A]">
                        50% de descuento
                      </h2>
                      <p className="text-sm text-gray-700">
                        Por los próximos 3 meses
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-3 bg-white rounded-lg border border-[#6366F1]/30 shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Plan Quincenal</p>
                      <p className="text-lg font-bold text-[#0F172A]">
                        <span className="line-through text-gray-400 text-sm">14,99€</span>
                      </p>
                      <p className="text-2xl font-bold text-[#6366F1]">4,99€</p>
                      <p className="text-xs text-gray-500 mt-1">cada 2 semanas</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-[#6366F1]/30 shadow-sm">
                      <p className="text-xs text-gray-600 mb-1">Plan Mensual</p>
                      <p className="text-lg font-bold text-[#0F172A]">
                        <span className="line-through text-gray-400 text-sm">29,99€</span>
                      </p>
                      <p className="text-2xl font-bold text-[#6366F1]">14,99€</p>
                      <p className="text-xs text-gray-500 mt-1">al mes</p>
                    </div>
                  </div>

                  <div className="bg-[#0F172A] rounded-lg p-2 text-center">
                    <p className="text-white text-sm font-semibold">
                      💎 Mantén todos tus beneficios premium
                    </p>
                  </div>
                </div>

                {/* Testimonios compactos */}
                <div className="space-y-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                      <p className="text-xs font-semibold text-gray-800">María G.</p>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      "El mejor precio que he visto. Vale totalmente la pena."
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                      <p className="text-xs font-semibold text-gray-800">Juan L.</p>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      "Estaba a punto de cancelar, pero esta oferta me convenció."
                    </p>
                  </div>
                </div>

              </div>

              {/* COLUMNA DERECHA: Advertencia y Botones */}
              <div className="space-y-4">
                
                {/* Beneficios que perderá */}
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2 text-base">
                    <FaExclamationTriangle className="text-lg" />
                    Si cancelas ahora perderás:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
                      <span className="text-red-700 text-sm">Tests ilimitados de CI, personalidad y habilidades</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
                      <span className="text-red-700 text-sm">Análisis detallado y seguimiento de evolución</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
                      <span className="text-red-700 text-sm">Certificados oficiales descargables</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold text-lg mt-0.5">✗</span>
                      <span className="text-red-700 text-sm">Dashboard avanzado con gráficos de progreso</span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-3">
                  <button
                    onClick={handleAcceptDiscount}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#058f6e] text-white py-4 px-6 rounded-xl font-bold text-base md:text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <FaStar className="text-yellow-300 text-lg" />
                        ¡Quiero el 50% de descuento!
                        <FaStar className="text-yellow-300 text-lg" />
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleRejectOffer}
                    disabled={loading}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold text-sm md:text-base transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    No gracias, continuar con la cancelación
                    <FaArrowRight />
                  </button>
                </div>

                {/* Nota informativa */}
                <div className="text-center">
                  <p className="text-xs text-[#0F172A] bg-[#6366F1]/10 py-2 px-4 rounded-lg inline-block">
                    🔒 El descuento se aplicará automáticamente
                  </p>
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

