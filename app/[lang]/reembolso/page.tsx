'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslations } from '@/hooks/useTranslations'

export default function ReembolsoPage() {
  const { lang } = useParams()
  const { t, loading } = useTranslations()

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-5xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Política de Reembolso
          </h1>
          
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>

            {/* 7. POLÍTICA DE REEMBOLSO */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. POLÍTICA DE REEMBOLSO</h2>

              {/* 7.1 Reembolsos del período de prueba (0,50€) */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7.1 Reembolsos del período de prueba (0,50€)</h3>
                
                <p className="text-gray-700 mb-4">
                  Puede optar a un reembolso completo dentro de los <strong>30 días posteriores a la compra</strong> si:
                </p>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>Usuario de prueba por primera vez</span>
                    </li>
                  <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>No se realizan reembolsos de pruebas anteriores en ninguna cuenta</span>
                  </li>
                  <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>No hay violaciones de los términos de servicio</span>
                  </li>
                  <li className="flex items-start gap-3">
                      <span className="text-green-600 text-xl">✓</span>
                      <span>Solicitud presentada a través de canales oficiales</span>
                  </li>
                </ul>
                </div>
              </div>

              {/* 7.2 Reembolsos de suscripciones regulares */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7.2 Reembolsos de suscripciones regulares</h3>
                
                <p className="text-gray-700 mb-4">
                  No es elegible para reembolsos excepto en estos casos específicos:
                </p>

                <div className="space-y-6">
                  {/* Indisponibilidad del servicio */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-[#6366F1]">→</span>
                      Indisponibilidad del servicio
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Tiempo de inactividad documentado superior a 24 horas consecutivas. No causado por mantenimiento programado ni por causas de fuerza mayor.
                </p>
              </div>

                  {/* Problemas técnicos */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-[#6366F1]">→</span>
                      Problemas técnicos
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Errores de la plataforma que impiden el acceso a funciones principales. Deben reportarse dentro de los 30 días posteriores al cargo y ser verificados por nuestro equipo técnico.
              </p>
                  </div>

                  {/* Errores de facturación */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-[#6366F1]">→</span>
                      Errores de facturación
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Cargos duplicados, monto incorrecto cobrado o transacciones no autorizadas.
                    </p>
              </div>

                  {/* Requisitos legales */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-[#6366F1]">→</span>
                      Requisitos legales
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Según lo requieran las leyes aplicables en su jurisdicción.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7.3 Casos no reembolsables */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7.3 Casos no reembolsables</h3>
              
                <p className="text-gray-700 mb-4">
                  Los siguientes productos no son elegibles explícitamente para reembolsos:
              </p>

                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Tiempo de suscripción parcial/no utilizado después de la cancelación</span>
                    </li>
                  <li className="flex items-start gap-3">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Rebajas de planes</span>
                  </li>
                  <li className="flex items-start gap-3">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Función no disponible durante el mantenimiento</span>
                </li>
                  <li className="flex items-start gap-3">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>Cambio de opinión o ya no necesita el servicio</span>
                </li>
                  <li className="flex items-start gap-3">
                      <span className="text-red-600 text-xl">✗</span>
                      <span>No cancelar antes de la renovación</span>
                </li>
              </ul>
                </div>
              </div>

              {/* 7.4 Proceso de reembolso */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7.4 Proceso de reembolso</h3>
                
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4">7.4.1. Presentar una solicitud a través de:</h4>
                  <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                      <span className="text-blue-600">•</span>
                      <span>Centro de ayuda</span>
                  </li>
                  <li className="flex items-start gap-3">
                      <span className="text-blue-600">•</span>
                      <span>Portal de autoservicio</span>
                  </li>
                  <li className="flex items-start gap-3">
                      <span className="text-blue-600">•</span>
                    <div>
                        <strong>Correo electrónico:</strong>{' '}
                        <a href="mailto:support@brainmetric.io" className="text-blue-600 underline hover:text-blue-800">
                          support@brainmetric.io
                        </a>
                    </div>
                  </li>
              </ul>
              </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4">7.4.2 Incluir:</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-[#6366F1]">✓</span>
                      <span>Correo electrónico de la cuenta</span>
                </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#6366F1]">✓</span>
                      <span>Detalles de la transacción</span>
                  </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#6366F1]">✓</span>
                      <span>Motivo del reembolso</span>
                  </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#6366F1]">✓</span>
                      <span>Documentación de apoyo</span>
                  </li>
                </ul>
                </div>

                <div className="bg-[#6366F1]/10 border-l-4 border-[#6366F1] p-6 rounded-r-lg">
                  <p className="font-semibold text-gray-900">
                    <strong>7.4.3 Tiempo de procesamiento:</strong> 3 días hábiles
                  </p>
                </div>
              </div>

              {/* 7.5 Métodos de pago de reembolso */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7.5 Métodos de pago de reembolso</h3>
              
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                  <ul className="space-y-3 text-gray-700">
                <li>
                      Todos los reembolsos se procesarán <strong>únicamente al método de pago original</strong> utilizado para la compra.
                </li>
                <li>
                      No podemos procesar reembolsos a métodos de pago o cuentas alternativas.
                </li>
                    <li>
                      Para tarjetas vencidas o canceladas, el reembolso se procesará a la tarjeta original y su institución financiera se encargará de acreditar su cuenta.
                  </li>
                    <li>
                      La capacidad de recibir reembolsos por tarjetas vencidas o canceladas está sujeta a las políticas de su institución financiera.
                  </li>
                </ul>
                </div>
              </div>

              {/* 7.6 Procesamiento de moneda */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7.6 Procesamiento de moneda</h3>
                
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">7.6.1 Monedas admitidas</h4>
                  <p className="text-gray-700 mb-4">
                    Procesamos pagos en moneda local para:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="font-semibold text-gray-900">Estados Unidos</p>
                      <p className="text-sm text-gray-600">USD</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="font-semibold text-gray-900">Unión Europea</p>
                      <p className="text-sm text-gray-600">EUR</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="font-semibold text-gray-900">Reino Unido</p>
                      <p className="text-sm text-gray-600">GBP</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="font-semibold text-gray-900">Canadá</p>
                      <p className="text-sm text-gray-600">CAD</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="font-semibold text-gray-900">Australia</p>
                      <p className="text-sm text-gray-600">AUD</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-4">
                    Para todas las demás regiones, los cargos se procesarán en USD.
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">7.6.2 Conversión de moneda</h4>
                  <ul className="space-y-3 text-gray-700 text-sm">
                    <li>• Los tipos de cambio los determina su banco o el emisor de su tarjeta.</li>
                    <li>• Cualquier tarifa de conversión de moneda cobrada por su banco no es reembolsable.</li>
                    <li>• Es posible que vea cargos por conversión de moneda en el estado de cuenta de su banco.</li>
                    <li>• Estos cargos de conversión son independientes de nuestros cargos por servicio y no están controlados por Brain Metric.</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-gray-700">
                      <strong>Nota:</strong> Si bien no cobramos comisiones adicionales por conversión de moneda, su banco o la entidad emisora de su tarjeta podrían aplicar sus propias comisiones o cargos. Consulte con su entidad financiera para obtener más información sobre sus políticas de transacciones internacionales.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] text-white rounded-xl p-8 mt-12">
              <h3 className="text-2xl font-bold mb-4">¿Necesitas ayuda?</h3>
              <p className="mb-6">
                Si tienes alguna pregunta sobre nuestra política de reembolso o necesitas asistencia con una solicitud, no dudes en contactarnos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:support@brainmetric.io" 
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold py-3 px-6 rounded-lg transition-all text-center"
                >
                  Enviar correo electrónico
                </a>
                <a 
                  href={`/${lang}/contacto`} 
                  className="bg-white text-[#0F172A] hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-all text-center"
                >
                  Formulario de contacto
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
