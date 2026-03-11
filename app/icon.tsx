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
          borderRadius: 7,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 8 C24 8, 18 10, 14.5 15 C11 20, 10 25, 11.5 30 C10 31, 8.5 33.5, 8 36.5 C7.5 40, 9 43, 11.5 45 C11 47, 11.5 50, 13.5 52 C15.5 54, 18.5 55, 21 54.5 C23 56.5, 26 57, 28.5 56 C29.5 55.5, 30 55, 30.5 54 L30.5 8 Z" fill="white" opacity="0.95"/>
          <path d="M33.5 8 C39.5 8, 45.5 10, 49 15 C52.5 20, 53.5 25, 52 30 C53.5 31, 55 33.5, 55.5 36.5 C56 40, 54.5 43, 52 45 C52.5 47, 52 50, 50 52 C48 54, 45 55, 42.5 54.5 C40.5 56.5, 37.5 57, 35 56 C34 55.5, 33.5 55, 33 54 L33 8 Z" fill="white" opacity="0.93"/>
          <path d="M29 54 C29 55, 29.5 57, 30 58.5 C30.5 59.5, 31 60, 32 60 C33 60, 33.5 59.5, 34 58.5 C34.5 57, 35 55, 35 54" fill="white" opacity="0.85"/>
        </svg>
      </div>
    ),
    { ...size }
  )
}
