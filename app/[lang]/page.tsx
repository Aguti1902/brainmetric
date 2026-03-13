'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { FaBrain, FaChartLine, FaCertificate, FaUserFriends, FaLock, FaCheckCircle, FaChevronLeft, FaChevronRight, FaArrowRight, FaStar } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import HeroAnimation from '@/components/HeroAnimation'

export default function Home() {
  const { t, loading, lang } = useTranslations()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!t?.testimonials?.reviews || t?.testimonials?.reviews?.length === 0) return
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => {
        const totalReviews = t?.testimonials?.reviews?.length || 1
        const maxIndex = Math.max(0, totalReviews - 3)
        return prev >= maxIndex ? 0 : Math.min(maxIndex, prev + 3)
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [t?.testimonials?.reviews])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [loading])

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden neural-bg">
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary-500/10 rounded-full blur-[120px] animate-float"></div>
            <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-accent-500/8 rounded-full blur-[150px] animate-float" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[200px]"></div>
          </div>

          <div className="container-custom relative z-10 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-6">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                  <span className="text-primary-300 text-sm font-medium">Evaluación Científica de Inteligencia</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-white">{t.hero.title} </span>
                  <span className="text-gradient">{t.hero.titleHighlight}</span>
                </h1>

                <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl">
                  {t.hero.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Link href={`/${loading ? 'es' : (t ? lang : 'es')}/test`} className="btn-primary text-center text-lg py-4 px-10">
                    {t.hero.cta}
                  </Link>
                  <a href={`/${loading ? 'es' : (t ? lang : 'es')}#como-funciona`} className="btn-secondary text-center text-lg py-4 px-10">
                    {t.hero.ctaSecondary}
                  </a>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-primary-400" />
                    <span>{t.hero.secure}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-primary-400" />
                    <span>{t.hero.validated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-primary-400" />
                    <span>{t.hero.instant}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <HeroAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* Cómo Funciona */}
        <section id="como-funciona" className={`py-24 relative transition-all duration-700 ${visibleSections.has('como-funciona') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t.howItWorks.title}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"></div>
              
              {[
                { num: '1', title: t.howItWorks.step1, desc: t.howItWorks.step1Desc },
                { num: '2', title: t.howItWorks.step2, desc: t.howItWorks.step2Desc },
                { num: '3', title: t.howItWorks.step3, desc: t.howItWorks.step3Desc },
              ].map((step, idx) => (
                <div key={idx} className="text-center relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-primary-500/25">
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Características */}
        <section id="features" className={`py-24 relative transition-all duration-700 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/20 to-transparent pointer-events-none"></div>
          <div className="container-custom relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t.features.title}
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <FaBrain />, title: t.features.validated, desc: t.features.validatedDesc },
                { icon: <FaUserFriends />, title: t.features.users, desc: t.features.usersDesc },
                { icon: <FaLock />, title: t.features.secure, desc: t.features.secureDesc },
                { icon: <FaChartLine />, title: t.features.analysis, desc: t.features.analysisDesc },
                { icon: <FaCertificate />, title: t.features.certificate, desc: t.features.certificateDesc },
                { icon: <FaCheckCircle />, title: t.features.instant, desc: t.features.instantDesc },
              ].map((feat, idx) => (
                <div key={idx} className="card group hover:bg-white/10">
                  <div className="text-3xl text-primary-400 mb-4 group-hover:text-primary-300 transition-colors">{feat.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feat.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section id="testimonios" className={`py-24 transition-all duration-700 ${visibleSections.has('testimonios') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container-custom max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t.testimonials.title}
              </h2>
              <p className="text-xl text-gray-400">
                {t.testimonials.subtitle}
              </p>
            </div>

            <div className="relative px-16">
              <div className="overflow-hidden py-4">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * (100 / 3)}%)` }}
                >
                  {t?.testimonials?.reviews?.map((review: any, index: number) => (
                    <div key={index} className="w-1/3 flex-shrink-0 px-3">
                      <div className="glass p-6 h-full">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                            {review.initials}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-bold text-white">{review.name}</h4>
                            <div className="text-yellow-400 text-sm">★★★★★</div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm italic leading-relaxed">
                          &ldquo;{review.text}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const totalReviews = t?.testimonials?.reviews?.length || 1
                  const maxIndex = Math.max(0, totalReviews - 3)
                  setCurrentTestimonial((prev) => (prev === 0 ? maxIndex : Math.max(0, prev - 3)))
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 glass hover:bg-primary-500/20 text-gray-400 hover:text-white p-3 rounded-full transition-all duration-300 z-10"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => {
                  const totalReviews = t?.testimonials?.reviews?.length || 1
                  const maxIndex = Math.max(0, totalReviews - 3)
                  setCurrentTestimonial((prev) => (prev >= maxIndex ? 0 : Math.min(maxIndex, prev + 3)))
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 glass hover:bg-primary-500/20 text-gray-400 hover:text-white p-3 rounded-full transition-all duration-300 z-10"
              >
                <FaChevronRight />
              </button>

              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil((t?.testimonials?.reviews?.length || 0) / 3) }).map((_, groupIndex) => (
                  <button
                    key={groupIndex}
                    onClick={() => setCurrentTestimonial(groupIndex * 3)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      Math.floor(currentTestimonial / 3) === groupIndex
                        ? 'bg-primary-500 w-8' 
                        : 'bg-gray-600 w-2 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="pricing" className={`py-24 transition-all duration-700 ${visibleSections.has('pricing') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t.pricing.title}
              </h2>
              <p className="text-xl text-gray-400">
                {t.pricing.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Plan Quincenal */}
              <div className="group glass p-8 hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">{t.pricing?.quincenal?.title}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold text-white leading-none">€{t.pricing?.quincenal?.price}</span>
                    <span className="text-gray-400 text-lg font-normal ml-1">{t.pricing?.quincenal?.period}</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 flex-1">
                  {t.pricing?.quincenal?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/${lang}/test`} className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 border border-white/10 mt-auto">
                  {t.pricing?.button}
                </Link>
              </div>

              {/* Plan Mensual - Destacado */}
              <div className="group relative p-8 rounded-2xl overflow-hidden border-2 border-primary-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col bg-gradient-to-br from-primary-950/80 to-secondary-900/80 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 pointer-events-none"></div>
                
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-1 rounded-full font-bold text-xs tracking-wide shadow-lg">
                    {t.pricing?.mensual?.badge}
                  </div>
                </div>

                <div className="absolute top-20 right-10 w-32 h-32 bg-primary-500 rounded-full opacity-10 blur-3xl"></div>
                
                <div className="relative z-10 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">{t.pricing?.mensual?.title}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold text-white leading-none">€{t.pricing?.mensual?.price}</span>
                    <span className="text-gray-400 text-lg font-normal ml-1">{t.pricing?.mensual?.period}</span>
                  </div>
                </div>
                
                <div className="relative z-10 space-y-3 mb-8 flex-1">
                  {t.pricing?.mensual?.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/${lang}/test`} className="relative z-10 block w-full btn-primary text-center py-4 mt-auto">
                  {t.pricing?.button}
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              {t.pricing?.note}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className={`py-24 transition-all duration-700 ${visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container-custom max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t.faq.title}
              </h2>
              <p className="text-xl text-gray-400">
                {t.faq.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              {[
                { q: t.faq.q1, a: t.faq.a1 },
                { q: t.faq.q2, a: t.faq.a2 },
                { q: t.faq.q3, a: t.faq.a3 },
                { q: t.faq.q4, a: t.faq.a4 },
                { q: t.faq.q5, a: t.faq.a5 },
                { q: t.faq.q6, a: t.faq.a6 },
              ].map((faq, idx) => (
                <div key={idx} className="glass p-6 hover:border-primary-500/20 transition-all duration-300">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-start gap-3">
                    <span className="text-primary-400 font-bold flex-shrink-0">?</span>
                    {faq.q}
                  </h3>
                  <p className="text-gray-400 ml-7 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Datos de interés */}
        <section id="stats" className={`py-24 transition-all duration-700 ${visibleSections.has('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container-custom max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t.interestData?.title}
              </h2>
              <p className="text-xl text-gray-400">
                {t.interestData?.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="glass p-8">
                <h3 className="text-xl font-bold text-white mb-6">{t.interestData?.ageChart}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { age: '< 18', iq: 95 },
                    { age: '18-39', iq: 105 },
                    { age: '40-59', iq: 98 },
                    { age: '60-79', iq: 90 },
                    { age: '+80', iq: 80 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="age" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                    <YAxis domain={[0, 120]} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="iq" fill="url(#barGradient)" radius={[8, 8, 0, 0]} name="CI promedio" />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass p-8">
                <h3 className="text-xl font-bold text-white mb-6">{t.interestData?.countryChart}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { country: 'China', flag: '🇨🇳', iq: 105 },
                    { country: 'Estonia', flag: '🇪🇪', iq: 100 },
                    { country: 'Reino Unido', flag: '🇬🇧', iq: 99 },
                    { country: 'Australia', flag: '🇦🇺', iq: 99 },
                    { country: 'Canadá', flag: '🇨🇦', iq: 99 },
                    { country: 'EE. UU.', flag: '🇺🇸', iq: 97 },
                    { country: 'Ucrania', flag: '🇺🇦', iq: 92 },
                    { country: 'Argentina', flag: '🇦🇷', iq: 86 }
                  ].map((item) => (
                    <div key={item.country} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.flag}</span>
                        <span className="font-medium text-gray-300 text-sm">{item.country}</span>
                      </div>
                      <div className="text-xl font-bold text-gradient">
                        {item.iq}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass p-6 max-w-4xl mx-auto border-l-4 border-primary-500">
              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">📊 </strong>{t.interestData?.note}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-600/20 pointer-events-none"></div>
          <div className="absolute inset-0 neural-bg pointer-events-none"></div>
          <div className="container-custom text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t.cta.title}
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              {t.cta.subtitle}
            </p>
            <Link href={`/${lang}/test`} className="btn-primary text-lg py-4 px-12 inline-block">
              {t.cta.button}
            </Link>
            <p className="mt-6 text-sm text-gray-400">
              {t.cta.details}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
