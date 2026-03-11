'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'
import { FaCheckCircle } from 'react-icons/fa'

export default function AnalyzingPage() {
  const router = useRouter()
  const { t, loading, lang } = useTranslations()
  const [progress, setProgress] = useState(0)
  const [completedCategories, setCompletedCategories] = useState<number[]>([])
  
  const categories = [
    'visualPerception',
    'abstractReasoning',
    'patternRecognition',
    'logicalThinking',
    'spatialIntelligence',
  ]

  useEffect(() => {
    const testResults = localStorage.getItem('testResults')
    if (!testResults) {
      router.push(`/${lang}/test`)
      return
    }

    const parsedResults = JSON.parse(testResults)
    const testType = parsedResults.type || 'iq'

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    const categoryTimers = categories.map((_, index) => {
      return setTimeout(() => {
        setCompletedCategories((prev) => [...prev, index])
      }, 1000 + index * 800)
    })

    const redirectTimer = setTimeout(() => {
      const isPremiumTest = localStorage.getItem('isPremiumTest')
      
      if (isPremiumTest === 'true') {
        localStorage.removeItem('isPremiumTest')
        router.push(`/${lang}/resultado`)
      } else {
        localStorage.setItem('currentTestType', testType)
        router.push(`/${lang}/resultado-estimado`)
      }
    }, 6000)

    return () => {
      clearInterval(progressInterval)
      categoryTimers.forEach(timer => clearTimeout(timer))
      clearTimeout(redirectTimer)
    }
  }, [router, lang])

  if (loading || !t) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-950 neural-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="glass p-12 text-center mb-8 animate-fadeIn">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-8 border-white/10 rounded-full"></div>
            <div 
              className="absolute inset-0 border-8 border-primary-500 rounded-full border-t-transparent animate-spin"
              style={{ animationDuration: '1s' }}
            ></div>
            <div className="absolute inset-4 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-400">{progress}%</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            {t.analyzing.title}
          </h1>
          
          <p className="text-lg text-gray-400 mb-8">
            {t.analyzing.subtitle}
          </p>

          <div className="w-full bg-white/10 rounded-full h-2.5 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500">
            {progress < 30 && t.analyzing.analyzing}
            {progress >= 30 && progress < 70 && t.analyzing.calculating}
            {progress >= 70 && t.analyzing.evaluating}
          </p>
        </div>

        <div className="glass p-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold text-white text-center mb-6">
            {t.analyzing.categories}
          </h2>
          
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div 
                key={category}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  completedCategories.includes(index) 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-50 translate-x-2'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  completedCategories.includes(index)
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 scale-100'
                    : 'bg-white/10 scale-75'
                }`}>
                  {completedCategories.includes(index) && (
                    <FaCheckCircle className="text-white text-sm animate-fadeIn" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className={`text-lg font-medium transition-colors duration-500 ${
                    completedCategories.includes(index) ? 'text-white' : 'text-gray-500'
                  }`}>
                    {t.analyzing[category]}
                  </p>
                </div>

                {completedCategories.includes(index) && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
