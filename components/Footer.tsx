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
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
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
