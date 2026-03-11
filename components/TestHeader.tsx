'use client'

import { FaClock } from 'react-icons/fa'
import BrainLogo from './BrainLogo'

interface TestHeaderProps {
  timeRemaining: number
  currentQuestion: number
  totalQuestions: number
  userName: string
  t: any
}

export default function TestHeader({ 
  timeRemaining, 
  currentQuestion, 
  totalQuestions, 
  userName, 
  t 
}: TestHeaderProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-secondary-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <BrainLogo size="sm" />
            <span className="text-lg font-bold hidden sm:inline">
              <span className="text-white">Brain</span>
              <span className="text-gradient"> Metric</span>
            </span>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
            timeRemaining < 60 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            timeRemaining < 300 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-primary-500/20 text-primary-300 border border-primary-500/30'
          }`}>
            <FaClock className="text-sm" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
