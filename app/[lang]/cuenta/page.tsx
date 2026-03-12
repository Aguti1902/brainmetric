'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaUser, FaEnvelope, FaCrown, FaCalendar, FaBrain, FaTrophy, FaChartLine, FaStar, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'
import { getTestHistory, getTestStatistics, getEvolutionData } from '@/lib/test-history'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import SubscriptionCancelFlow from '@/components/SubscriptionCancelFlow'
import AchievementBadges from '@/components/AchievementBadges'
import AllTestsComparison from '@/components/AllTestsComparison'

export default function CuentaPage() {
  const router = useRouter()
  const { lang } = useParams()
  const { t, loading: translationsLoading } = useTranslations()
  const [userData, setUserData] = useState({ email: '', userName: '', hasSubscription: false })
  const [stats, setStats] = useState({
    totalTests: 0, averageIQ: 0, highestIQ: 0, lowestIQ: 0,
    averageCorrect: 0, improvement: 0, lastTestDate: null as string | null
  })
  const [evolutionData, setEvolutionData] = useState<any[]>([])
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false)
  const [subscriptionError, setSubscriptionError] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem('auth_token')
      const userData_new = localStorage.getItem('user_data')

      if (token && userData_new) {
        try {
          const parsedUser = JSON.parse(userData_new)
          try {
            const response = await fetch('/api/user-stats', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
              const data = await response.json()
              setUserData({
                email: parsedUser.email,
                userName: parsedUser.userName,
                hasSubscription: parsedUser.subscriptionStatus === 'active' || parsedUser.subscriptionStatus === 'trial'
              })
              setStats(data.stats)
              setEvolutionData(data.evolutionData)
              setTestHistory(data.testResults)
              setIsLoading(false)
              return
            }
          } catch {}

          const history = getTestHistory()
          setUserData({ email: parsedUser.email, userName: parsedUser.userName, hasSubscription: true })
          setStats(getTestStatistics())
          setEvolutionData(getEvolutionData())
          setTestHistory(history.tests)
          setIsLoading(false)
          return
        } catch {}
      }

      const email = localStorage.getItem('userEmail')
      const paymentCompleted = localStorage.getItem('paymentCompleted')
      if (!email || !paymentCompleted) {
        router.push(`/${lang}/login`)
        return
      }

      const history = getTestHistory()
      setUserData({ email: history.email || email, userName: history.userName, hasSubscription: true })
      setStats(getTestStatistics())
      setEvolutionData(getEvolutionData())
      setTestHistory(history.tests)
      setIsLoading(false)
    }
    loadUserData()
  }, [router, lang])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setPasswordMessage('Las contraseñas no coinciden'); return }
    if (newPassword.length < 8) { setPasswordMessage('La contraseña debe tener al menos 8 caracteres'); return }
    setPasswordLoading(true)
    setPasswordMessage('')
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await response.json()
      if (response.ok) {
        setPasswordMessage('✅ Contraseña cambiada exitosamente')
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
        setTimeout(() => { setShowChangePassword(false); setPasswordMessage('') }, 2000)
      } else {
        setPasswordMessage(data.error || 'Error al cambiar la contraseña')
      }
    } catch { setPasswordMessage('Error de conexión.') } finally { setPasswordLoading(false) }
  }

  const handleAcceptDiscount = async () => {
    setApplyingDiscount(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/apply-retention-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({ email: userData.email, discountPercent: 50, durationMonths: 3 })
      })
      const data = await response.json()
      if (response.ok) { alert('¡Descuento aplicado! Tu próxima factura tendrá un 50% de descuento durante 3 meses.'); setShowSubscriptionModal(false) }
      else { alert(data.error || 'Error al aplicar el descuento.') }
    } catch { alert('Error de conexión.') } finally { setApplyingDiscount(false) }
  }

  const handleConfirmCancel = async () => {
    setSubscriptionLoading(true); setSubscriptionError('')
    try {
      const token = localStorage.getItem('auth_token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST', headers,
        body: JSON.stringify({ email: userData.email }),
      })
      const data = await response.json()
      if (response.ok) { setSubscriptionSuccess(true); setUserData(prev => ({ ...prev, hasSubscription: false })) }
      else { setSubscriptionError(data.error || 'Error al cancelar la suscripción') }
    } catch { setSubscriptionError('Error de conexión.') } finally { setSubscriptionLoading(false) }
  }

  const handleViewResult = (testId?: string) => {
    if (testId) localStorage.setItem('viewTestId', testId)
    router.push(`/${lang}/resultado`)
  }

  const handleNewTest = (e?: React.MouseEvent) => {
    e?.preventDefault(); e?.stopPropagation()
    localStorage.removeItem('testResults')
    router.push(`/${lang}/test-premium`)
  }

  const getIQCategory = (iq: number) => {
    if (iq < 70) return { label: t?.result?.veryLow || 'Muy Bajo', color: 'text-red-400' }
    if (iq < 85) return { label: t?.result?.low || 'Bajo', color: 'text-orange-400' }
    if (iq < 115) return { label: t?.result?.average || 'Promedio', color: 'text-blue-400' }
    if (iq < 130) return { label: t?.result?.superior || 'Superior', color: 'text-green-400' }
    return { label: t?.result?.verySuperior || 'Muy Superior', color: 'text-purple-400' }
  }

  const getImprovementIcon = () => {
    if (stats.improvement > 0) return <FaArrowUp className="text-green-400" />
    if (stats.improvement < 0) return <FaArrowDown className="text-red-400" />
    return <FaMinus className="text-gray-500" />
  }

  if (isLoading || translationsLoading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-secondary-950 neural-bg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">{t ? t.account.loading : 'Cargando...'}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-secondary-950 neural-bg py-12">
        <div className="container-custom max-w-7xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{t.account.title}</h1>
            <p className="text-gray-400">{t.account.welcomeBack}, <span className="text-primary-400 font-medium">{userData.userName || t.account.premiumUser}</span></p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: <FaBrain className="text-2xl text-blue-400" />, label: t.account.testsCompleted, value: stats.totalTests, tag: t.account.total, color: 'blue' },
              { icon: <FaTrophy className="text-2xl text-purple-400" />, label: 'CI Promedio', value: stats.averageIQ || stats.highestIQ || 0, tag: t.account.average, color: 'purple' },
              { icon: <FaStar className="text-2xl text-green-400" />, label: t.account.bestScore, value: stats.highestIQ, tag: t.account.maximum, color: 'green' },
              { icon: <FaChartLine className="text-2xl text-orange-400" />, label: stats.improvement > 0 ? t.account.improvementPoints : stats.improvement < 0 ? t.account.declinePoints : t.account.noChange, value: Math.abs(stats.improvement), tag: t.account.progress, color: 'orange', extra: getImprovementIcon() },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${item.color}-500/10 rounded-lg flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-semibold text-${item.color}-400 bg-${item.color}-500/10 px-3 py-1 rounded-full`}>
                    {item.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-3xl font-bold text-white">{item.value}</div>
                  {item.extra}
                </div>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Evolution Chart */}
          {evolutionData.length > 1 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <FaChartLine className="text-3xl text-primary-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.account.evolutionTitle}</h2>
                  <p className="text-gray-400">{t.account.evolutionSubtitle}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis domain={[70, 150]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Line type="monotone" dataKey="iq" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', r: 6 }} activeDot={{ r: 8 }} name="CI" />
                  <Line type="monotone" dataKey="correctAnswers" stroke="#a5b4fc" strokeWidth={2} dot={{ fill: '#a5b4fc', r: 4 }} name="Respuestas Correctas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">

              {/* User Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/30">
                    <FaUser className="text-2xl text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{userData.userName}</h3>
                    <p className="text-sm text-gray-400">{t.account.premiumUser}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <FaEnvelope className="text-primary-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{t.account.email}</p>
                      <p className="font-medium text-gray-200 text-sm truncate">{userData.email}</p>
                    </div>
                  </div>
                  {stats.lastTestDate && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <FaCalendar className="text-primary-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">{t.account.lastTest || 'Último Test'}</p>
                        <p className="font-medium text-gray-200 text-sm">
                          {new Date(stats.lastTestDate).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleNewTest} className="w-full mt-6 btn-primary py-3 flex items-center justify-center gap-2">
                  <FaBrain />
                  {t.account.takeNewTest}
                </button>
              </div>

              {/* Subscription */}
              <div className="bg-gradient-to-br from-primary-600/20 to-indigo-600/20 border border-primary-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaCrown className="text-3xl text-yellow-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.account.premium}</h3>
                    <p className="text-sm text-primary-300">{t.account.active}</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4 text-sm text-gray-300">
                  {[t.account.unlimitedTests, t.account.detailedStats, t.account.progressTracking, t.account.prioritySupport].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-yellow-400">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setShowSubscriptionModal(true); setSubscriptionSuccess(false); setSubscriptionError('') }}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                  {t.account.manageSubscription}
                </button>
              </div>

              {/* Change Password */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{t.account.security}</h3>
                </div>

                {!showChangePassword ? (
                  <button onClick={() => setShowChangePassword(true)} className="w-full btn-primary py-2.5 font-semibold">
                    {t.account.changePassword}
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {[
                      { label: t.account.currentPassword, value: currentPassword, setter: setCurrentPassword },
                      { label: t.account.newPassword, value: newPassword, setter: setNewPassword },
                      { label: t.account.confirmPassword, value: confirmPassword, setter: setConfirmPassword },
                    ].map((field, i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
                        <input
                          type="password"
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          required
                          minLength={i > 0 ? 8 : undefined}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                        />
                      </div>
                    ))}
                    {passwordMessage && (
                      <div className={`text-sm p-3 rounded-lg ${passwordMessage.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                        {passwordMessage}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button type="submit" disabled={passwordLoading} className="flex-1 btn-primary py-2.5 disabled:opacity-50 font-semibold">
                        {passwordLoading ? `${t.account.savePassword}...` : t.account.savePassword}
                      </button>
                      <button type="button" onClick={() => { setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordMessage('') }}
                        className="flex-1 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 py-2.5 rounded-xl font-semibold transition">
                        {t.account.cancelChange}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Test History */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.account.testHistoryTitle}</h2>
                    <p className="text-gray-400">{t.account.testHistorySubtitle}</p>
                  </div>
                  {testHistory.length > 0 && (
                    <span className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full font-semibold text-sm">
                      {testHistory.length} {testHistory.length === 1 ? 'Test' : 'Tests'}
                    </span>
                  )}
                </div>

                {testHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FaBrain className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">{t.account.noTestsYet}</p>
                    <button onClick={handleNewTest} className="btn-primary px-6 py-3">
                      {t.account.startFirstTest}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {testHistory.map((test, index) => {
                      const category = getIQCategory(test.iq)
                      const isLatest = index === 0
                      return (
                        <div
                          key={test.id}
                          className={`p-5 rounded-xl border-2 transition hover:bg-white/5 cursor-pointer ${isLatest ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/10 bg-white/3'}`}
                          onClick={() => handleViewResult(test.id)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLatest ? 'bg-primary-500/20' : 'bg-white/5'}`}>
                                <FaTrophy className={`text-2xl ${isLatest ? 'text-primary-400' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-white">Test #{testHistory.length - index}</h3>
                                  {isLatest && (
                                    <span className="bg-primary-500/20 text-primary-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-primary-500/30">
                                      {t.account.mostRecent}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400">
                                  {new Date(test.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t.account.yourIQ}</p>
                              <p className="text-2xl font-bold text-white">{test.iq}</p>
                              <p className={`text-xs font-semibold ${category.color}`}>{category.label}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t.account.correctAnswers}</p>
                              <p className="text-2xl font-bold text-white">{test.correctAnswers}/20</p>
                              <p className="text-xs text-gray-400">{Math.round((test.correctAnswers / 20) * 100)}% {t.account.accuracy}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">{t.account.time}</p>
                              <p className="text-2xl font-bold text-white">{Math.floor(test.timeElapsed / 60)}'</p>
                              <p className="text-xs text-gray-400">{test.timeElapsed % 60}s</p>
                            </div>
                          </div>

                          {index > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-sm">
                              <span className="text-gray-500">{t.account.comparedToPrevious}</span>
                              {test.iq > testHistory[index - 1].iq ? (
                                <><FaArrowUp className="text-green-400" /><span className="font-semibold text-green-400">+{test.iq - testHistory[index - 1].iq} {t.account.points}</span></>
                              ) : test.iq < testHistory[index - 1].iq ? (
                                <><FaArrowDown className="text-red-400" /><span className="font-semibold text-red-400">{test.iq - testHistory[index - 1].iq} {t.account.points}</span></>
                              ) : (
                                <><FaMinus className="text-gray-500" /><span className="font-semibold text-gray-500">{t.account.noChange}</span></>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Tests Comparison */}
          <div className="mb-8"><AllTestsComparison /></div>

          {/* Achievement Badges */}
          <div className="mb-8"><AchievementBadges stats={stats} /></div>

          {/* Available Tests */}
          <div className="mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">{t?.account?.availableTests || 'Tests Disponibles'}</h2>
              <p className="text-gray-400 mb-6">{t?.account?.availableTestsSubtitle || 'Realiza diferentes evaluaciones para conocerte mejor'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { href: `/${lang}/tests/adhd`, icon: 'A', color: 'blue', title: t?.tests?.adhd?.title || 'Test TDAH', sub: 'DSM-5', desc: t?.tests?.adhd?.description || 'Evalúa síntomas de TDAH' },
                  { href: `/${lang}/tests/anxiety`, icon: '😰', color: 'yellow', title: t?.tests?.anxiety?.title || 'Test Ansiedad', sub: 'GAD-7', desc: t?.tests?.anxiety?.description || 'Mide niveles de ansiedad' },
                  { href: `/${lang}/tests/depression`, icon: '😔', color: 'purple', title: t?.tests?.depression?.title || 'Test Depresión', sub: 'PHQ-9', desc: t?.tests?.depression?.description || 'Evalúa síntomas depresivos' },
                  { href: `/${lang}/tests/personality`, icon: '👤', color: 'pink', title: t?.tests?.personality?.title || 'Test Personalidad', sub: 'Big Five', desc: t?.tests?.personality?.description || 'Descubre tu perfil' },
                  { href: `/${lang}/tests/eq`, icon: '💚', color: 'green', title: t?.tests?.eq?.title || 'Inteligencia Emocional', sub: 'EQ Test', desc: t?.tests?.eq?.description || 'Mide tu capacidad emocional' },
                  { href: `/${lang}/test`, icon: '🧠', color: 'orange', title: t?.account?.iqTest || 'Test de CI', sub: 'IQ Test', desc: t?.account?.iqTestDesc || 'Evalúa tu coeficiente intelectual' },
                ].map((item, i) => (
                  <Link key={i} href={item.href}
                    className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 bg-${item.color}-500/20 rounded-lg flex items-center justify-center text-${item.color}-400 text-xl font-bold border border-${item.color}-500/30`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary-300 transition">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.sub}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">{t.account.needHelp}</h3>
              <p className="text-gray-400 mb-4">{t.account.needHelpDesc}</p>
              <button onClick={() => router.push(`/${lang}/contacto`)} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2 rounded-lg font-semibold transition">
                {t.account.contact}
              </button>
            </div>
            <div className="bg-gradient-to-r from-primary-600/30 to-indigo-600/30 border border-primary-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">{t.account.wantToImprove}</h3>
              <p className="text-gray-300 mb-4 opacity-90">{t.account.practiceKey}</p>
              <button onClick={handleNewTest} className="btn-primary px-6 py-2 font-semibold">
                {t.account.startNow}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionCancelFlow
        isOpen={showSubscriptionModal}
        onClose={() => { setShowSubscriptionModal(false); setSubscriptionSuccess(false); setSubscriptionError('') }}
        onConfirm={handleConfirmCancel}
        onAcceptDiscount={handleAcceptDiscount}
        loading={subscriptionLoading || applyingDiscount}
        success={subscriptionSuccess}
        error={subscriptionError}
      />

      <Footer />
    </>
  )
}
