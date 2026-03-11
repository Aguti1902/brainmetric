'use client'

import { VisualCell as VisualCellType } from '@/lib/visual-questions'

interface VisualCellProps {
  cell: VisualCellType
  size?: number
  isOption?: boolean
  isHighlighted?: boolean
}

// Colors that appear black/invisible on dark background → convert to white
const DARK_COLORS = ['#0f172a', '#1e1b4b', '#113240', '#052547', '#030a0d', '#0e2838']

function toVisibleFill(color: string | undefined): string {
  if (!color) return 'none'
  if (DARK_COLORS.includes(color.toLowerCase())) return 'rgba(255,255,255,0.9)'
  return color
}

function toVisibleStroke(color: string | undefined, fallback = 'rgba(255,255,255,0.75)'): string {
  if (!color) return fallback
  if (DARK_COLORS.includes(color.toLowerCase())) return 'rgba(255,255,255,0.85)'
  return color
}

export default function VisualCell({ cell, size = 120, isOption = false, isHighlighted = false }: VisualCellProps) {
  const renderContent = () => {
    switch (cell.type) {
      case 'number':
        return renderNumber()
      case 'shape':
        return renderShape()
      case 'card':
        return renderCard()
      case 'grid':
        return renderGrid()
      case 'arrow':
        return renderArrows()
      case 'pattern':
        return renderPattern()
      case 'empty':
        return renderEmpty()
      default:
        return null
    }
  }

  const renderNumber = () => (
    <div className="w-full h-full flex items-center justify-center relative">
      <div
        className="absolute inset-0 rounded-xl opacity-20"
        style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}
      />
      <span
        className="relative z-10 font-extrabold leading-none"
        style={{
          fontSize: size > 80 ? '1.75rem' : '1.25rem',
          background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))',
        }}
      >
        {cell.content}
      </span>
    </div>
  )

  const renderEmpty = () => (
    <div className="w-full h-full flex items-center justify-center relative">
      <div className="absolute inset-2 rounded-lg border-2 border-dashed border-primary-400/50 animate-pulse" />
      <svg viewBox="0 0 60 60" className="w-10 h-10">
        <circle cx="30" cy="30" r="20" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
        <text
          x="30" y="36"
          textAnchor="middle"
          fill="#818cf8"
          fontSize="24"
          fontWeight="800"
          fontFamily="system-ui"
          style={{ filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.7))' }}
        >
          ?
        </text>
      </svg>
    </div>
  )

  const renderShape = () => {
    const fill = toVisibleFill(cell.fillColor)
    const stroke = cell.fillColor
      ? 'none'
      : toVisibleStroke(cell.strokeColor)
    const sw = cell.fillColor ? 0 : 2.5

    const isIndigFill = cell.fillColor && !DARK_COLORS.includes(cell.fillColor.toLowerCase()) && cell.fillColor !== 'none'
    const gradId = `grad-${cell.content}-${Math.random().toString(36).slice(2, 7)}`

    const buildShape = (shapeContent: string, cx = 50, cy = 50): JSX.Element | null => {
      switch (shapeContent) {
        case 'circle':
          return <circle cx={cx} cy={cy} r="30" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} />
        case 'square':
          return <rect x="18" y="18" width="64" height="64" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} rx="6" />
        case 'triangle':
          return <polygon points="50,14 84,78 16,78" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        case 'hexagon':
          return <polygon points="50,12 78,28 78,60 50,76 22,60 22,28" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} />
        default:
          return null
      }
    }

    let innerElement: JSX.Element | null = null
    if (cell.nested && cell.innerShape) {
      const innerStroke = 'rgba(167,139,250,0.9)'
      switch (cell.innerShape) {
        case 'triangle':
          innerElement = <polygon points="50,33 65,62 35,62" fill="none" stroke={innerStroke} strokeWidth="2.5" strokeLinejoin="round" />
          break
        case 'circle':
          innerElement = <circle cx="50" cy="50" r="15" fill="none" stroke={innerStroke} strokeWidth="2.5" />
          break
        case 'hexagon':
          innerElement = <polygon points="50,32 62,39 62,53 50,60 38,53 38,39" fill="none" stroke={innerStroke} strokeWidth="2.5" />
          break
      }
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-1.5"
        style={{ filter: isIndigFill ? 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' : fill === 'rgba(255,255,255,0.9)' ? 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' : 'none' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {buildShape(cell.content as string)}
        {innerElement}
      </svg>
    )
  }

  const renderCard = () => {
    const fill = toVisibleFill(cell.fillColor)
    const stroke = cell.fillColor ? 'none' : toVisibleStroke(cell.strokeColor)
    const sw = cell.fillColor ? 0 : 2
    const isIndigFill = cell.fillColor && !DARK_COLORS.includes(cell.fillColor.toLowerCase()) && cell.fillColor !== 'none'
    const gradId = `cardgrad-${Math.random().toString(36).slice(2, 7)}`

    let cardShape: JSX.Element | null = null
    switch (cell.content) {
      case 'heart':
        cardShape = (
          <path
            d="M50,70 C50,70 22,50 22,33 C22,22 30,18 40,23 C45,26 50,31 50,31 C50,31 55,26 60,23 C70,18 78,22 78,33 C78,50 50,70 50,70 Z"
            fill={isIndigFill ? `url(#${gradId})` : fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        )
        break
      case 'diamond':
        cardShape = (
          <path d="M50,18 L78,50 L50,82 L22,50 Z"
            fill={isIndigFill ? `url(#${gradId})` : fill}
            stroke={stroke} strokeWidth={sw} />
        )
        break
      case 'club':
        cardShape = (
          <>
            <circle cx="39" cy="40" r="11" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} />
            <circle cx="61" cy="40" r="11" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} />
            <circle cx="50" cy="28" r="11" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} />
            <path d="M43,50 L57,50 L55,76 L45,76 Z" fill={isIndigFill ? `url(#${gradId})` : fill} stroke={stroke} strokeWidth={sw} />
          </>
        )
        break
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2"
        style={{ filter: isIndigFill ? 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' : 'none' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {cardShape}
      </svg>
    )
  }

  const renderGrid = () => {
    const positions: { [key: string]: { x: number, y: number } } = {
      'top-left': { x: 10, y: 10 }, 'top-center': { x: 40, y: 10 }, 'top-right': { x: 70, y: 10 },
      'center-left': { x: 10, y: 40 }, 'center': { x: 40, y: 40 }, 'center-right': { x: 70, y: 40 },
      'bottom-left': { x: 10, y: 70 }, 'bottom-center': { x: 40, y: 70 }, 'bottom-right': { x: 70, y: 70 },
      'cross': { x: 40, y: 40 }
    }

    const pos = positions[cell.content as string] || { x: 40, y: 40 }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-1">
        <defs>
          <linearGradient id="dotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <line x1="33" y1="0" x2="33" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="67" y1="0" x2="67" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="0" y1="33" x2="100" y2="33" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="0" y1="67" x2="100" y2="67" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

        {cell.content !== 'cross' ? (
          <>
            <rect x={pos.x} y={pos.y} width="20" height="20" fill="url(#dotGrad)" rx="4"
              style={{ filter: 'drop-shadow(0 0 5px rgba(99,102,241,0.7))' }} />
          </>
        ) : (
          <>
            <line x1="28" y1="28" x2="72" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="72" y1="28" x2="28" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="63" y="63" width="16" height="16" fill="url(#dotGrad)" rx="3"
              style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.6))' }} />
          </>
        )}
      </svg>
    )
  }

  const renderPattern = () => {
    const patternType = cell.content as string

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        <defs>
          <linearGradient id="patternGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Border frame */}
        <rect x="8" y="8" width="84" height="84" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" rx="4" />
        {/* Filled areas */}
        {patternType === 'top-left-triangle' && <polygon points="8,8 92,8 8,92" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'top-right-half' && <rect x="50" y="8" width="42" height="84" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'bottom-right-diagonal' && <polygon points="92,8 92,92 8,92" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'bottom-left-triangle' && <polygon points="8,8 8,92 92,92" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'bottom-half' && <rect x="8" y="50" width="84" height="42" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'right-triangle' && <polygon points="92,8 92,92 50,50" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'top-half' && <rect x="8" y="8" width="84" height="42" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'full-square' && <rect x="8" y="8" width="84" height="84" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'right-half' && <rect x="50" y="8" width="42" height="84" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'left-half' && <rect x="8" y="8" width="42" height="84" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'center-square' && <rect x="33" y="33" width="34" height="34" fill="url(#patternGrad)" opacity="0.9" />}
        {patternType === 'full-square-red' && <rect x="8" y="8" width="84" height="84" fill="rgba(255,255,255,0.12)" opacity="0.9" />}
      </svg>
    )
  }

  const renderArrows = () => {
    const count = cell.count || 1
    const arrowColor = 'rgba(255,255,255,0.88)'
    const arrowGlowColor = 'rgba(129,140,248,0.5)'
    const arrows: JSX.Element[] = []

    for (let i = 0; i < count; i++) {
      let arrowEl: JSX.Element | undefined
      const offset = count > 1 ? (i * 26 - (count - 1) * 13) : 0

      switch (cell.direction) {
        case 'up':
          arrowEl = (
            <g key={i} transform={`translate(${50 + offset}, 0)`}>
              <line x1="0" y1="72" x2="0" y2="28" stroke={arrowColor} strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="-7,36 0,24 7,36" fill={arrowColor} />
            </g>
          )
          break
        case 'down':
          arrowEl = (
            <g key={i} transform={`translate(${50 + offset}, 0)`}>
              <line x1="0" y1="28" x2="0" y2="72" stroke={arrowColor} strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="-7,64 0,76 7,64" fill={arrowColor} />
            </g>
          )
          break
        case 'left':
          arrowEl = (
            <g key={i} transform={`translate(0, ${50 + offset})`}>
              <line x1="72" y1="0" x2="28" y2="0" stroke={arrowColor} strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="36,-7 24,0 36,7" fill={arrowColor} />
            </g>
          )
          break
        case 'right':
          arrowEl = (
            <g key={i} transform={`translate(0, ${50 + offset})`}>
              <line x1="28" y1="0" x2="72" y2="0" stroke={arrowColor} strokeWidth="3.5" strokeLinecap="round" />
              <polygon points="64,-7 76,0 64,7" fill={arrowColor} />
            </g>
          )
          break
      }
      if (arrowEl) arrows.push(arrowEl)
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2"
        style={{ filter: `drop-shadow(0 0 4px ${arrowGlowColor})` }}>
        {arrows}
      </svg>
    )
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center transition-all duration-200 ${
        isHighlighted
          ? 'border-2 border-primary-400/70 shadow-lg shadow-primary-500/30'
          : isOption
          ? 'border border-white/8 hover:border-primary-400/50 hover:shadow-md hover:shadow-primary-500/15 cursor-pointer'
          : 'border border-white/8'
      }`}
      style={{
        background: isHighlighted
          ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))'
          : 'rgba(15,23,42,0.6)',
        width: isOption ? '100%' : `${size}px`,
        height: isOption ? 'auto' : `${size}px`,
        aspectRatio: '1',
        backdropFilter: 'blur(4px)',
      }}
    >
      {renderContent()}
    </div>
  )
}
