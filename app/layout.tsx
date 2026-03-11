import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GoogleAnalytics, { GTMNoscript } from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brain Metric - Professional Intelligence Assessment | Discover Your IQ',
  description: 'Unlock your cognitive potential with Brain Metric\'s advanced intelligence assessment. Get precise, personalized results in minutes through scientifically validated testing.',
  keywords: 'intelligence test, IQ assessment, cognitive analysis, brain metric, professional IQ test, mental evaluation',
  icons: {
    icon: '/images/brain-icon.svg',
    shortcut: '/images/brain-icon.svg',
    apple: '/images/brain-icon.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/images/brain-icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/images/brain-icon.svg" sizes="any" />
      </head>
      <body className={inter.className}>
        <GTMNoscript />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
