'use client'

import Script from 'next/script'

const GA_MEASUREMENT_ID = 'G-BPS5TEVZG0'
const GOOGLE_ADS_ID = 'AW-17232820139' // TODO: actualizar con nueva cuenta Google Ads

export default function GoogleAnalytics() {
  return (
    <>
      {/* Google Analytics 4 + Google Ads */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  )
}

export function GTMNoscript() {
  return null
}

