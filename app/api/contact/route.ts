import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, lang } = body

    // Validar campos requeridos
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    console.log('📧 Enviando email de contacto:', { name, email, subject })

    // Preparar el email para support@mindmetric.io
    const emailData = {
      to: 'support@mindmetric.io',
      subject: `[Contacto Web] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo mensaje de contacto</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 30px; text-align: center;">
                      <img src="https://www.mindmetric.io/images/MINDMETRIC/Logo_blanco.png" alt="MindMetric" style="height: 40px; width: auto; margin: 0 auto; display: block;" />
                      <h1 style="color: #ffffff; margin: 20px 0 0 0; font-size: 24px; font-weight: 700;">
                        📬 Nuevo Mensaje de Contacto
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="background-color: #f7fafc; border-left: 4px solid #6366F1; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h2 style="color: #0F172A; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
                          Información del Contacto:
                        </h2>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 120px;">
                              👤 Nombre:
                            </td>
                            <td style="padding: 8px 0; color: #1a202c;">
                              ${name}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">
                              📧 Email:
                            </td>
                            <td style="padding: 8px 0; color: #1a202c;">
                              <a href="mailto:${email}" style="color: #6366F1; text-decoration: none;">
                                ${email}
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">
                              📋 Asunto:
                            </td>
                            <td style="padding: 8px 0; color: #1a202c;">
                              ${subject}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">
                              🌍 Idioma:
                            </td>
                            <td style="padding: 8px 0; color: #1a202c;">
                              ${lang || 'es'}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                        <h3 style="color: #0F172A; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
                          💬 Mensaje:
                        </h3>
                        <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
${message}
                        </p>
                      </div>

                      <div style="margin-top: 30px; padding: 20px; background-color: #e6fffa; border-radius: 8px; text-align: center;">
                        <p style="color: #234e52; font-size: 14px; margin: 0 0 15px 0;">
                          💡 <strong>Tip:</strong> Puedes responder directamente a este email para contactar con el usuario
                        </p>
                        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                           style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                          📧 Responder a ${name}
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; font-size: 12px; margin: 0;">
                        Este email fue enviado desde el formulario de contacto de <strong>mindmetric.io</strong>
                      </p>
                      <p style="color: #718096; font-size: 12px; margin: 5px 0 0 0;">
                        Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Nuevo mensaje de contacto de MindMetric

Nombre: ${name}
Email: ${email}
Asunto: ${subject}
Idioma: ${lang || 'es'}

Mensaje:
${message}

---
Para responder, envía un email a: ${email}
      `
    }

    // Enviar email
    const result = await sendEmail(emailData)

    if (!result.success) {
      console.error('❌ Error enviando email:', result.error)
      return NextResponse.json(
        { error: 'Error al enviar el mensaje' },
        { status: 500 }
      )
    }

    console.log('✅ Email de contacto enviado correctamente')

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente'
    })

  } catch (error: any) {
    console.error('❌ Error en API de contacto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

