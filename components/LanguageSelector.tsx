'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { languages } from '@/lib/i18n'
import { FaGlobe, FaChevronDown } from 'react-icons/fa'

export default function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = useState('es')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Extraer el idioma de la URL
    const pathSegments = pathname.split('/')
    const langFromPath = pathSegments[1]
    if (langFromPath && Object.keys(languages).includes(langFromPath)) {
      setCurrentLocale(langFromPath)
    }
  }, [pathname])

  const handleLanguageChange = (newLocale: string) => {
    setCurrentLocale(newLocale)
    setIsOpen(false)
    
    // Guardar en localStorage
    localStorage.setItem('mindmetric-locale', newLocale)
    
    // Construir nueva URL
    const pathSegments = pathname.split('/')
    pathSegments[1] = newLocale
    const newPath = pathSegments.join('/')
    
    router.push(newPath)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FaGlobe className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {languages[currentLocale as keyof typeof languages]?.flag} {languages[currentLocale as keyof typeof languages]?.name}
        </span>
        <FaChevronDown className={`text-gray-600 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {Object.entries(languages).map(([locale, { name, flag }]) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                  currentLocale === locale ? 'bg-[#e6f5f5] text-[#6366F1] font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{flag}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
