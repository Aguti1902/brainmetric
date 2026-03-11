'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

interface MinimalHeaderProps {
  email?: string | null
}

export default function MinimalHeader({ email }: MinimalHeaderProps) {
  const params = useParams()
  const lang = params.lang as string || 'es'

  return (
    <header className="bg-secondary-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="text-lg font-bold">
              <span className="text-white">Brain</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400"> Metric</span>
            </span>
          </Link>

          {email && (
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 text-sm text-gray-400 border border-white/10">
              <span className="truncate">{email}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
