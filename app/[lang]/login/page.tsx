'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')
  
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string || 'es'
  const { t } = useTranslations()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        localStorage.setItem('userEmail', data.user.email)
        localStorage.setItem('paymentCompleted', 'true')
        router.push(`/${lang}/cuenta`)
      } else {
        setError(data.error || t?.login?.errorLogin || 'Error al iniciar sesión')
      }
    } catch {
      setError(t?.login?.errorConnection || 'Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setForgotPasswordMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, lang }),
      })

      const data = await response.json()

      if (response.ok) {
        setForgotPasswordMessage(t?.login?.resetSent || 'Se ha enviado un enlace de recuperación a tu email.')
        setShowForgotPassword(false)
        setForgotPasswordEmail('')
      } else {
        setForgotPasswordMessage(data.error || t?.login?.resetError || 'Error al enviar el email de recuperación.')
      }
    } catch {
      setForgotPasswordMessage(t?.login?.errorConnection || 'Error de conexión. Inténtalo de nuevo.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-secondary-950 neural-bg flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-500/30 mb-4">
              <FaLock className="text-2xl text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t?.login?.title || 'Iniciar Sesión'}
            </h1>
            <p className="text-gray-400">
              {t?.login?.subtitle || 'Accede a tu dashboard personal'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            {forgotPasswordMessage && (
              <div className={`border px-4 py-3 rounded-xl mb-6 text-sm ${
                forgotPasswordMessage.includes('enviado') || forgotPasswordMessage.includes('sent')
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {forgotPasswordMessage}
              </div>
            )}

            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t?.login?.email || 'Email'}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder={t?.login?.emailPlaceholder || 'tu@email.com'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t?.login?.password || 'Contraseña'}
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder={t?.login?.passwordPlaceholder || 'Tu contraseña'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-primary-400 hover:text-primary-300 text-sm transition"
                  >
                    {t?.login?.forgotPassword || '¿Has olvidado tu contraseña?'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t?.login?.loggingIn || 'Iniciando sesión...'}
                    </div>
                  ) : (
                    t?.login?.loginButton || 'Iniciar Sesión'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <h3 className="text-white font-semibold mb-1">{t?.login?.forgotPassword || '¿Olvidaste tu contraseña?'}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {lang === 'es' ? 'Te enviaremos un enlace para restablecerla.' : 'We\'ll send you a link to reset it.'}
                  </p>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t?.login?.forgotEmailLabel || 'Email'}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder={t?.login?.emailPlaceholder || 'tu@email.com'}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 btn-primary py-3 font-semibold disabled:opacity-50"
                  >
                    {forgotPasswordLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t?.login?.sending || 'Enviando...'}
                      </div>
                    ) : (
                      t?.login?.sendReset || 'Enviar enlace'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotPasswordEmail('')
                      setForgotPasswordMessage('')
                    }}
                    className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 py-3 rounded-xl font-semibold transition"
                  >
                    {t?.login?.cancel || 'Cancelar'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-gray-500">
                {t?.login?.noAccount || '¿No tienes cuenta?'}{' '}
                <Link href={`/${lang}/test`} className="text-primary-400 hover:text-primary-300 transition font-medium">
                  {lang === 'es' ? 'Realiza el test' : 'Take the test'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
