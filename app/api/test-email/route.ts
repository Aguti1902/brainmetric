import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/test-email?to=tu@email.com&secret=brainmetric2024
 * Envía un email de prueba para verificar que SendGrid está configurado.
 */
export async function GET(request: NextRequest) {
  const to     = request.nextUrl.searchParams.get('to')
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== 'brainmetric2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!to) {
    return NextResponse.json({ error: 'Falta el parámetro ?to=email' }, { status: 400 })
  }

  const hasSendgrid = !!process.env.SENDGRID_API_KEY

  if (!hasSendgrid) {
    return NextResponse.json({
      error: 'SENDGRID_API_KEY no está configurada en las variables de entorno de Vercel',
      fix: 'Ve a Vercel → Settings → Environment Variables y añade SENDGRID_API_KEY',
    }, { status: 500 })
  }

  // Enviar email de prueba usando el template de bienvenida
  const result = await sendEmail(
    emailTemplates.loginCredentials(to, 'Usuario Test', 'contraseña123', 125, 'es')
  )

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Email de prueba enviado a ${to}`,
      sendgrid: 'configurado ✅',
    })
  } else {
    return NextResponse.json({
      success: false,
      error: result.error,
      sendgrid: 'configurado pero con error',
    }, { status: 500 })
  }
}
