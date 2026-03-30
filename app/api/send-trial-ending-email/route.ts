import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email-service'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/database-postgres'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Buscar usuario en la base de datos
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario tenga trial activo
    if (user.subscriptionStatus !== 'trial') {
      return NextResponse.json({ error: 'Usuario no tiene trial activo' }, { status: 400 })
    }

    // Enviar email de trial ending
    const lang = 'es'
    const emailData = {
      to: email,
      subject: '⏰ Tu trial premium termina mañana',
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td align="center" style="padding:40px 20px;">
              <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <tr><td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:40px 30px;text-align:center;">
                  <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height:32px;margin:0 auto 20px;display:block;"/>
                  <h1 style="color:#fff;margin:0;font-size:28px;">⏰ Tu trial termina mañana</h1>
                </td></tr>
                <tr><td style="padding:40px 30px;">
                  <h2 style="color:#0F172A;margin:0 0 20px;">Hola, ${user.userName}! 👋</h2>
                  <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px;">
                    Tu periodo de prueba premium termina <strong>mañana</strong>. Si no cancelas antes, se cobrará automáticamente 29,99€/mes.
                  </p>
                  <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:8px;padding:20px;margin:30px 0;text-align:center;">
                    <p style="color:#856404;font-size:16px;margin:0;font-weight:600;">💳 Próximo cobro: 29,99€/mes</p>
                  </div>
                  <div style="text-align:center;margin:30px 0;">
                    <a href="https://brainmetric.io/${lang}/cuenta" style="display:inline-block;background:linear-gradient(135deg,#0F172A 0%,#6366F1 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                      Gestionar Suscripción
                    </a>
                  </div>
                </td></tr>
                <tr><td style="background:#f7fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="color:#718096;font-size:12px;margin:0;">© ${new Date().getFullYear()} Brain Metric · support@mindmetric.io</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
      `
    }
    const result = await sendEmail(emailData)

    if (result.success) {
      console.log(`✅ Email de trial ending enviado a ${email}`)
      return NextResponse.json({ success: true, message: 'Email enviado correctamente' })
    } else {
      console.error(`❌ Error enviando email de trial ending:`, result.error)
      return NextResponse.json({ error: 'Error enviando email' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Error en send-trial-ending-email:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
