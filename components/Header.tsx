'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa'
import LanguageSelector from './LanguageSelector'
import { useTranslations } from '@/hooks/useTranslations'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t, lang } = useTranslations()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    setIsLoggedIn(!!token)

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.profile-dropdown')) {
        setIsProfileMenuOpen(false)
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isProfileMenuOpen])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setIsLoggedIn(false)
    router.push(`/${lang}`)
  }

  if (!t) return null

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-secondary-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
        : 'bg-transparent'
    }`}>
      <nav className="container-custom py-4">
        <div className="flex justify-between items-center">
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none">
                {/* Hemisferio izquierdo */}
                <path d="M 50 22 C 38 22, 26 28, 22 38 C 18 46, 19 54, 22 60 C 24 65, 26 68, 28 70 C 30 72, 33 73, 36 73 C 38 73, 40 72, 42 71 C 44 70, 46 69, 48 69 L 48 22 Z" fill="white" opacity="0.95"/>
                {/* Hemisferio derecho */}
                <path d="M 50 22 C 62 22, 74 28, 78 38 C 82 46, 81 54, 78 60 C 76 65, 74 68, 72 70 C 70 72, 67 73, 64 73 C 62 73, 60 72, 58 71 C 56 70, 54 69, 52 69 L 52 22 Z" fill="white" opacity="0.95"/>
                {/* Cerebelo izq */}
                <path d="M 36 73 C 34 74, 32 76, 32 79 C 32 82, 34 84, 37 84 C 40 84, 43 82, 45 80 C 47 78, 48 76, 48 74 L 48 69 C 46 69, 44 70, 42 71 C 40 72, 38 73, 36 73 Z" fill="white" opacity="0.85"/>
                {/* Cerebelo der */}
                <path d="M 64 73 C 66 74, 68 76, 68 79 C 68 82, 66 84, 63 84 C 60 84, 57 82, 55 80 C 53 78, 52 76, 52 74 L 52 69 C 54 69, 56 70, 58 71 C 60 72, 62 73, 64 73 Z" fill="white" opacity="0.85"/>
                {/* División central */}
                <line x1="50" y1="22" x2="50" y2="69" stroke="#6366F1" strokeWidth="1.5" opacity="0.35"/>
                {/* Surcos izq */}
                <path d="M 30 36 C 32 34, 36 33, 40 35" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <path d="M 24 48 C 27 46, 32 45, 37 47" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <path d="M 24 59 C 27 57, 32 56, 38 58" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                {/* Surcos der */}
                <path d="M 70 36 C 68 34, 64 33, 60 35" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <path d="M 76 48 C 73 46, 68 45, 63 47" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <path d="M 76 59 C 73 57, 68 56, 62 58" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Brain</span>
              <span className="text-gradient"> Metric</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <LanguageSelector />
            
            {isLoggedIn ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
                >
                  <FaUser />
                  <span>{t.nav.profile || 'Mi Perfil'}</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass py-2 shadow-xl">
                    <Link
                      href={`/${lang}/cuenta`}
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t.nav.myAccount || 'Mi Cuenta'}
                    </Link>
                    <Link
                      href={`/${lang}/tests`}
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {t.nav.myTests || 'Mis Tests'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"
                    >
                      <FaSignOutAlt />
                      {t.nav.logout || 'Cerrar Sesión'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${lang}/test`} className="btn-primary text-sm py-2.5 px-6">
                {t.nav.startTest}
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 glass p-4 rounded-xl">
            <div className="pb-2 border-b border-white/10">
              <LanguageSelector />
            </div>
            
            {isLoggedIn ? (
              <>
                <Link
                  href={`/${lang}/cuenta`}
                  className="block text-gray-300 hover:text-primary-400 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.nav.myAccount || 'Mi Cuenta'}
                </Link>
                <Link
                  href={`/${lang}/tests`}
                  className="block text-gray-300 hover:text-primary-400 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.nav.myTests || 'Mis Tests'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left text-red-400 hover:text-red-300 transition flex items-center gap-2"
                >
                  <FaSignOutAlt />
                  {t.nav.logout || 'Cerrar Sesión'}
                </button>
              </>
            ) : (
              <Link
                href={`/${lang}/test`}
                className="block btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.nav.startTest}
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
