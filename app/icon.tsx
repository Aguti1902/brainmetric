import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hemisferio izquierdo */}
          <path
            d="M 50 22 C 38 22, 26 28, 22 38 C 18 46, 19 54, 22 60 C 24 65, 26 68, 28 70 C 30 72, 33 73, 36 73 C 38 73, 40 72, 42 71 C 44 70, 46 69, 48 69 L 48 22 Z"
            fill="white"
            opacity="0.95"
          />
          {/* Hemisferio derecho */}
          <path
            d="M 50 22 C 62 22, 74 28, 78 38 C 82 46, 81 54, 78 60 C 76 65, 74 68, 72 70 C 70 72, 67 73, 64 73 C 62 73, 60 72, 58 71 C 56 70, 54 69, 52 69 L 52 22 Z"
            fill="white"
            opacity="0.95"
          />
          {/* Cerebelo izquierdo */}
          <path
            d="M 36 73 C 34 74, 32 76, 32 79 C 32 82, 34 84, 37 84 C 40 84, 43 82, 45 80 C 47 78, 48 76, 48 74 L 48 69 C 46 69, 44 70, 42 71 C 40 72, 38 73, 36 73 Z"
            fill="white"
            opacity="0.85"
          />
          {/* Cerebelo derecho */}
          <path
            d="M 64 73 C 66 74, 68 76, 68 79 C 68 82, 66 84, 63 84 C 60 84, 57 82, 55 80 C 53 78, 52 76, 52 74 L 52 69 C 54 69, 56 70, 58 71 C 60 72, 62 73, 64 73 Z"
            fill="white"
            opacity="0.85"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
