'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Detectar idioma del navegador o usar español por defecto
    const browserLang = navigator.language.split('-')[0]
    const supportedLangs = ['es', 'en', 'fr', 'de', 'it', 'pt', 'sv', 'no']
    const defaultLang = supportedLangs.includes(browserLang) ? browserLang : 'es'
    
    // Verificar si hay idioma guardado en localStorage
    const savedLang = localStorage.getItem('brainmetric-locale')
    const finalLang = savedLang && supportedLangs.includes(savedLang) ? savedLang : defaultLang
    
    router.replace(`/${finalLang}`)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
