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
  try {
    const result = await sendEmail(
      emailTemplates.loginCredentials(to, 'Usuario Test', 'contraseña123', 125, 'es')
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email de prueba enviado a ${to}`,
        sendgrid: 'OK ✅',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        sendgrid: 'fallo al enviar',
        diagnostico: [
          '1. Ve a SendGrid → Settings → API Keys',
          '2. Verifica que la clave tiene permiso "Mail Send" (Full Access)',
          '3. Ve a SendGrid → Settings → Sender Authentication',
          '4. Verifica el dominio brainmetric.io o el remitente info@brainmetric.io',
        ],
      }, { status: 500 })
    }
  } catch (err: any) {
    // Capturar el error completo de SendGrid con más detalle
    const detail = err?.response?.body || err?.message || String(err)
    return NextResponse.json({
      success: false,
      error: String(detail),
      sendgrid: 'error capturado',
      diagnostico: [
        'Revisa los permisos de la API key en SendGrid',
        'Verifica que info@brainmetric.io esté autenticado como remitente',
      ],
    }, { status: 500 })
  }
}
