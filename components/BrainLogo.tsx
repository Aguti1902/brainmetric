interface BrainLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function BrainSvg({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
      {/* Hemisferio izquierdo - silueta principal con lóbulos */}
      <path
        d="M30 8 C24 8, 18 10, 14.5 15 C11 20, 10 25, 11.5 30 C10 31, 8.5 33.5, 8 36.5 C7.5 40, 9 43, 11.5 45 C11 47, 11.5 50, 13.5 52 C15.5 54, 18.5 55, 21 54.5 C23 56.5, 26 57, 28.5 56 C29.5 55.5, 30 55, 30.5 54 L30.5 8 Z"
        fill="white"
        opacity="0.95"
      />
      {/* Hemisferio derecho - silueta principal con lóbulos */}
      <path
        d="M33.5 8 C39.5 8, 45.5 10, 49 15 C52.5 20, 53.5 25, 52 30 C53.5 31, 55 33.5, 55.5 36.5 C56 40, 54.5 43, 52 45 C52.5 47, 52 50, 50 52 C48 54, 45 55, 42.5 54.5 C40.5 56.5, 37.5 57, 35 56 C34 55.5, 33.5 55, 33 54 L33 8 Z"
        fill="white"
        opacity="0.93"
      />

      {/* Tallo cerebral */}
      <path
        d="M29 54 C29 55, 29.5 57, 30 58.5 C30.5 59.5, 31 60, 32 60 C33 60, 33.5 59.5, 34 58.5 C34.5 57, 35 55, 35 54"
        fill="white"
        opacity="0.85"
      />

      {/* Surco central (cisura interhemisférica) */}
      <path
        d="M32 9 C31.5 20, 32.5 35, 32 54"
        stroke="rgba(99,102,241,0.4)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* === SURCOS hemisferio izquierdo === */}
      {/* Cisura lateral (Silvio) */}
      <path
        d="M29 30 C25 29.5, 20 31, 16 35"
        stroke="rgba(99,102,241,0.45)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Surco frontal superior */}
      <path
        d="M28 16 C23 15.5, 18 17, 16 20"
        stroke="rgba(99,102,241,0.35)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Surco frontal inferior */}
      <path
        d="M29 23 C24 22, 17 24, 13 27"
        stroke="rgba(99,102,241,0.35)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Surco temporal */}
      <path
        d="M28 39 C24 38.5, 18 39, 12 42"
        stroke="rgba(99,102,241,0.35)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Surco parietal */}
      <path
        d="M29 46 C26 46, 21 47.5, 17 50"
        stroke="rgba(99,102,241,0.3)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* === SURCOS hemisferio derecho === */}
      {/* Cisura lateral (Silvio) */}
      <path
        d="M35 30 C39 29.5, 44 31, 48 35"
        stroke="rgba(99,102,241,0.45)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Surco frontal superior */}
      <path
        d="M36 16 C41 15.5, 46 17, 48 20"
        stroke="rgba(99,102,241,0.35)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Surco frontal inferior */}
      <path
        d="M35 23 C40 22, 47 24, 51 27"
        stroke="rgba(99,102,241,0.35)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Surco temporal */}
      <path
        d="M36 39 C40 38.5, 46 39, 52 42"
        stroke="rgba(99,102,241,0.35)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Surco parietal */}
      <path
        d="M35 46 C38 46, 43 47.5, 47 50"
        stroke="rgba(99,102,241,0.3)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Detalle sutil del tallo */}
      <path
        d="M31 56 C31.5 57, 32 57, 32.5 56"
        stroke="rgba(99,102,241,0.3)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function BrainLogo({ size = 'md', className = '' }: BrainLogoProps) {
  const containerSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'
  const svgSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-9 h-9' : 'w-7 h-7'

  return (
    <div className={`${containerSize} bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}>
      <BrainSvg className={svgSize} />
    </div>
  )
}
