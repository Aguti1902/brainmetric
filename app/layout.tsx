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
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/FAVICON2.png', type: 'image/png' },
    ],
    apple: '/images/FAVICON2.png',
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/images/FAVICON2.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/FAVICON2.png" />
      </head>
      <body className={inter.className}>
        <GTMNoscript />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
