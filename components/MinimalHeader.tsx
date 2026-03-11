'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import BrainLogo from './BrainLogo'

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
            <BrainLogo size="sm" />
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
