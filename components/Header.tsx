'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa'
import LanguageSelector from './LanguageSelector'
import BrainLogo from './BrainLogo'
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
            <BrainLogo />
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
