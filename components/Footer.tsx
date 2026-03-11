'use client'

import Link from 'next/link'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function Footer() {
  const { t, lang } = useTranslations()

  if (!t) return null

  return (
    <footer className="bg-secondary-950 border-t border-white/5">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none">
                  <path d="M 50 22 C 38 22, 26 28, 22 38 C 18 46, 19 54, 22 60 C 24 65, 26 68, 28 70 C 30 72, 33 73, 36 73 C 38 73, 40 72, 42 71 C 44 70, 46 69, 48 69 L 48 22 Z" fill="white" opacity="0.95"/>
                  <path d="M 50 22 C 62 22, 74 28, 78 38 C 82 46, 81 54, 78 60 C 76 65, 74 68, 72 70 C 70 72, 67 73, 64 73 C 62 73, 60 72, 58 71 C 56 70, 54 69, 52 69 L 52 22 Z" fill="white" opacity="0.95"/>
                  <path d="M 36 73 C 34 74, 32 76, 32 79 C 32 82, 34 84, 37 84 C 40 84, 43 82, 45 80 C 47 78, 48 76, 48 74 L 48 69 C 46 69, 44 70, 42 71 C 40 72, 38 73, 36 73 Z" fill="white" opacity="0.85"/>
                  <path d="M 64 73 C 66 74, 68 76, 68 79 C 68 82, 66 84, 63 84 C 60 84, 57 82, 55 80 C 53 78, 52 76, 52 74 L 52 69 C 54 69, 56 70, 58 71 C 60 72, 62 73, 64 73 Z" fill="white" opacity="0.85"/>
                  <path d="M 30 36 C 32 34, 36 33, 40 35" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
                  <path d="M 24 48 C 27 46, 32 45, 37 47" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
                  <path d="M 70 36 C 68 34, 64 33, 60 35" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
                  <path d="M 76 48 C 73 46, 68 45, 63 47" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
                </svg>
              </div>
              <span className="text-lg font-bold">
                <span className="text-white">Brain</span>
                <span className="text-gradient"> Metric</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              {t.footer.description}
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-400 transition">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.links}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}`} className="text-gray-400 hover:text-primary-400 transition text-sm">
                  {t.footer.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/test`} className="text-gray-400 hover:text-primary-400 transition text-sm">
                  {t.footer.startTest}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/cancelar-suscripcion`} className="text-red-400/70 hover:text-red-400 transition text-sm">
                  {t.footer.cancelPlan}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contacto`} className="text-gray-400 hover:text-primary-400 transition text-sm">
                  {t.footer.contact}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/login`} className="text-gray-400 hover:text-primary-400 transition text-sm">
                  {t.footer.login || 'Iniciar Sesión'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/terminos`} className="text-gray-400 hover:text-primary-400 transition text-sm">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacidad`} className="text-gray-400 hover:text-primary-400 transition text-sm">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/reembolso`} className="text-gray-400 hover:text-primary-400 transition text-sm">
                  {t.footer.refund}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Brain Metric. {t.footer.allRightsReserved}.</p>
        </div>
      </div>
    </footer>
  )
}
