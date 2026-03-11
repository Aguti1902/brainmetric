import { NextRequest, NextResponse } from 'next/server'
import { createOrUpdateUser } from '@/lib/auth'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, iq, password } = body

    if (!email || !userName || !iq) {
      return NextResponse.json({ 
        error: 'Email, userName e iq son requeridos' 
      }, { status: 400 })
    }

    console.log('🔄 Creando usuario manualmente:', { email, userName, iq })

    // Crear usuario con contraseña específica si se proporciona
    let user, generatedPassword
    
    if (password) {
      // Usar contraseña específica
      const { hashPassword } = await import('@/lib/auth')
      const hashedPassword = await hashPassword(password)
      
      const { db } = await import('@/lib/database')
      user = await db.createUser({
        email,
        userName,
        iq,
        password: hashedPassword,
        subscriptionStatus: 'trial',
        trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      })
      generatedPassword = password
    } else {
      // Usar createOrUpdateUser normal
      const result = await createOrUpdateUser({
        email,
        userName,
        iq,
        subscriptionStatus: 'trial',
        trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      })
      user = result.user
      generatedPassword = result.password
    }

    console.log(`✅ Usuario creado: ${user.email}`)
    console.log(`🔑 Contraseña: ${generatedPassword}`)

    // Enviar email de bienvenida
    try {
      const emailData = {
        to: email,
        subject: '¡Bienvenido a MindMetric! - Acceso a tu Dashboard',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenido a MindMetric</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                          🧠 MindMetric
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px; text-align: center;">
                        <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                          ¡Bienvenido a MindMetric!
                        </h2>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Hola ${userName},
                        </p>
                        
                        <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          ¡Felicidades! Tu pago ha sido procesado exitosamente y tu cuenta ha sido creada.
                        </p>
                        
                        <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                          <h3 style="color: #0F172A; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                            🎯 Tu Resultado de CI: ${iq}
                          </h3>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            Has completado exitosamente el test de coeficiente intelectual.
                          </p>
                        </div>
                        
                        <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                          <h3 style="color: #c53030; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                            🔑 Credenciales de Acceso
                          </h3>
                          <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                            <strong>Email:</strong> ${email}
                          </p>
                          <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                            <strong>Contraseña:</strong> ${generatedPassword}
                          </p>
                          <p style="color: #e53e3e; font-size: 12px; margin: 10px 0 0 0; line-height: 1.6;">
                            ⚠️ Por seguridad, cambia tu contraseña después del primer acceso.
                          </p>
                        </div>
                        
                        <a href="https://mindmetric.io/es/login" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                          Acceder a mi Dashboard
                        </a>
                        
                        <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                          Desde tu dashboard podrás ver tu resultado completo, gestionar tu suscripción y acceder a contenido exclusivo.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                          © ${new Date().getFullYear()} MindMetric. Todos los derechos reservados.
                        </p>
                        <p style="color: #718096; font-size: 12px; margin: 0;">
                          support@mindmetric.io
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      }

      const result = await sendEmail(emailData)
      
      if (result.success) {
        console.log(`✅ Email enviado a ${email}`)
      } else {
        console.error(`❌ Error enviando email:`, result.error)
      }
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        iq: user.iq,
        subscriptionStatus: user.subscriptionStatus
      },
      password: generatedPassword
    })

  } catch (error: any) {
    console.error('❌ Error creando usuario:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}
