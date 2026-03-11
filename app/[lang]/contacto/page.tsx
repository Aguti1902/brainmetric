'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FaPaperPlane } from 'react-icons/fa'
import { useTranslations } from '@/hooks/useTranslations'

export default function ContactoPage() {
  const { t, loading, lang } = useTranslations()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lang
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        
        // Resetear el estado después de 5 segundos
        setTimeout(() => setSubmitStatus('idle'), 5000)
      } else {
        console.error('Error del servidor:', data.error)
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error al enviar:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t.contact.title}
            </h1>
            <p className="text-xl text-gray-600">
              {t.contact.subtitle}
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            {submitStatus === 'success' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-green-800 font-semibold">
                  ✓ {t.contact.successMessage}
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-red-800 font-semibold">
                  ✗ {t.contact.errorMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                    {t.contact.name} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                    placeholder={t.contact.namePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                    {t.contact.email} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                    placeholder={t.contact.emailPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">
                  {t.contact.subject} *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                >
                  <option value="">{t.contact.subjectSelect}</option>
                  <option value={t.contact.subjectTech}>{t.contact.subjectTech}</option>
                  <option value={t.contact.subjectBilling}>{t.contact.subjectBilling}</option>
                  <option value={t.contact.subjectRefund}>{t.contact.subjectRefund}</option>
                  <option value={t.contact.subjectSubscription}>{t.contact.subjectSubscription}</option>
                  <option value={t.contact.subjectResult}>{t.contact.subjectResult}</option>
                  <option value={t.contact.subjectOther}>{t.contact.subjectOther}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                  {t.contact.message} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]"
                  placeholder={t.contact.messagePlaceholder}
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-lg transition ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#0F172A] hover:bg-[#1E1B4B] text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {t.contact.sending}
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      {t.contact.sendButton}
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                {t.contact.required}
              </p>
            </form>

            {/* Email info */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-2">
                {t.contact.emailDirect}
              </p>
              <a 
                href="mailto:support@brainmetric.io" 
                className="text-[#6366F1] hover:text-[#4F46E5] font-semibold text-lg"
              >
                support@brainmetric.io
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
