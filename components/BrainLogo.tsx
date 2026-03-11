interface BrainLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BrainLogo({ size = 'md', className = '' }: BrainLogoProps) {
  const containerSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'
  const svgSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'

  return (
    <div className={`${containerSize} bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg className={svgSize} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path d="M 50 22 C 38 22, 26 28, 22 38 C 18 46, 19 54, 22 60 C 24 65, 26 68, 28 70 C 30 72, 33 73, 36 73 C 38 73, 40 72, 42 71 C 44 70, 46 69, 48 69 L 48 22 Z" fill="white" opacity="0.95"/>
        <path d="M 50 22 C 62 22, 74 28, 78 38 C 82 46, 81 54, 78 60 C 76 65, 74 68, 72 70 C 70 72, 67 73, 64 73 C 62 73, 60 72, 58 71 C 56 70, 54 69, 52 69 L 52 22 Z" fill="white" opacity="0.95"/>
        <path d="M 36 73 C 34 74, 32 76, 32 79 C 32 82, 34 84, 37 84 C 40 84, 43 82, 45 80 C 47 78, 48 76, 48 74 L 48 69 C 46 69, 44 70, 42 71 C 40 72, 38 73, 36 73 Z" fill="white" opacity="0.85"/>
        <path d="M 64 73 C 66 74, 68 76, 68 79 C 68 82, 66 84, 63 84 C 60 84, 57 82, 55 80 C 53 78, 52 76, 52 74 L 52 69 C 54 69, 56 70, 58 71 C 60 72, 62 73, 64 73 Z" fill="white" opacity="0.85"/>
        <line x1="50" y1="22" x2="50" y2="69" stroke="#6366F1" strokeWidth="1.5" opacity="0.35"/>
        <path d="M 30 36 C 32 34, 36 33, 40 35" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
        <path d="M 24 48 C 27 46, 32 45, 37 47" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
        <path d="M 24 59 C 27 57, 32 56, 38 58" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
        <path d="M 70 36 C 68 34, 64 33, 60 35" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
        <path d="M 76 48 C 73 46, 68 45, 63 47" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
        <path d="M 76 59 C 73 57, 68 56, 62 58" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55"/>
      </svg>
    </div>
  )
}
