'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaCheckCircle, FaTag, FaHome } from 'react-icons/fa'

// Componente que usa useSearchParams envuelto en Suspense
function ExitoContent() {
  const router = useRouter()
  const { lang } = useParams()
  const searchParams = useSearchParams()
  const hasDiscount = searchParams.get('discount') === 'true'

  useEffect(() => {
    // Limpiar localStorage
    localStorage.removeItem('cancelEmail')
    localStorage.removeItem('cancelName')
    localStorage.removeItem('cancelReason')
  }, [])

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-6 md:py-10">
        <div className="container-custom max-w-5xl px-4">
          
          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center">
            
            {/* Icono y título compactos */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¡Genial! Descuento Aplicado
            </h1>

            <p className="text-sm md:text-base text-gray-600 mb-6">
              Has aceptado el descuento del 50% durante 3 meses. ¡Gracias por quedarte con nosotros!
            </p>

            {/* Información del descuento - Grid 2 columnas en desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              
              {/* Columna izquierda: Precios */}
              <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#6366F1]/20 border-2 border-[#6366F1] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaTag className="text-2xl text-[#6366F1]" />
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    Tu descuento ha sido aplicado
                  </h2>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Plan Quincenal</p>
                    <p className="text-xl font-bold text-[#0F172A]">
                      <span className="line-through text-gray-400 text-sm">9,99€</span>
                      {' → '}
                      <span className="text-[#6366F1]">4,99€</span>
                    </p>
                    <p className="text-xs text-gray-500">Ahorro: 15€ en 3 meses</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Plan Mensual</p>
                    <p className="text-xl font-bold text-[#0F172A]">
                      <span className="line-through text-gray-400 text-sm">19,99€</span>
                      {' → '}
                      <span className="text-[#6366F1]">9,99€</span>
                    </p>
                    <p className="text-xs text-gray-500">Ahorro: 30€ en 3 meses</p>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Beneficios */}
              <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#6366F1]/20 border-2 border-[#6366F1] rounded-xl p-4 flex flex-col justify-center">
                <div className="space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-[#6366F1] text-lg flex-shrink-0">✓</span>
                    <p className="text-gray-700 text-sm">
                      <strong>A partir de tu próxima factura</strong>, disfrutarás del 50% de descuento
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#6366F1] text-lg flex-shrink-0">✓</span>
                    <p className="text-gray-700 text-sm">
                      El descuento se aplicará <strong>automáticamente durante 3 meses</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#6366F1] text-lg flex-shrink-0">✓</span>
                    <p className="text-gray-700 text-sm">
                      Después, el precio volverá al normal (<strong>puedes cancelar antes</strong>)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#6366F1] text-lg flex-shrink-0">✓</span>
                    <p className="text-gray-700 text-sm">
                      Mantén <strong>todos tus beneficios premium</strong>
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Email de confirmación compacto */}
            <div className="bg-blue-50 border border-blue-300 rounded-xl p-3 mb-4 text-left">
              <h3 className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2">
                📧 Confirmación por email
              </h3>
              <p className="text-blue-800 text-xs">
                Te hemos enviado un email con todos los detalles. Revisa tu bandeja de entrada.
              </p>
            </div>

            {/* Botones de acción compactos */}
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/${lang}/cuenta`)}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#4F46E5] hover:to-[#058f6e] text-white py-3 px-6 rounded-xl font-bold text-base transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Ver Mi Cuenta
              </button>

              <button
                onClick={() => router.push(`/${lang}`)}
                className="text-gray-600 hover:text-gray-800 font-medium text-sm transition flex items-center justify-center gap-2"
              >
                <FaHome />
                Volver al Inicio
              </button>
            </div>

            {/* Mensaje de agradecimiento */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                💚 Gracias por confiar en Brain Metric y por quedarte con nosotros
              </p>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </>
  )
}

// Componente principal con Suspense
export default function ExitoCancelacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ExitoContent />
    </Suspense>
  )
}

