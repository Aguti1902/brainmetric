import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'
import { sendEmail } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🔄 Reenviando email de bienvenida a:', email)
    
    // Buscar usuario en la base de datos
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado',
        message: 'No existe un usuario con ese email en la base de datos'
      }, { status: 404 })
    }

    // Determinar idioma (por defecto español)
    const lang = body.lang || 'es'
    const t = (key: any) => getEmailTranslation(lang, key)
    
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mindmetric.io'}/${lang}/cuenta`

    // Generar una nueva contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-12)
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)
    
    // Actualizar contraseña del usuario
    await db.updateUser(user.id, {
      password: hashedPassword
    })

    console.log('🔑 Nueva contraseña temporal generada:', tempPassword)

    // Enviar email con credenciales
    const emailData = {
      to: email,
      subject: t('welcomeSubject'),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('welcome')} MindMetric</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                      <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="MindMetric" style="height: 40px; width: auto; margin: 0 auto; display: block;" />
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                        ${t('welcome')} MindMetric!
                      </h2>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${t('hello')} ${user.userName || t('user')},
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${t('congratulations')}
                      </p>
                      
                      ${user.iq ? `
                      <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                        <h3 style="color: #0F172A; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                          🎯 ${t('yourIQResult')}: ${user.iq}
                        </h3>
                        <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                          ${t('completedTest')}
                        </p>
                      </div>
                      ` : ''}
                      
                      <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                        <h3 style="color: #c53030; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                          🔑 ${t('loginCredentials')}
                        </h3>
                        <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                          <strong>Email:</strong> ${email}
                        </p>
                        <p style="color: #4a5568; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>${t('password')}:</strong> ${tempPassword}
                        </p>
                        <p style="color: #e53e3e; font-size: 12px; margin: 10px 0 0 0; line-height: 1.6;">
                          ⚠️ ${t('securityWarning')}
                        </p>
                      </div>
                      
                      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                        ${t('accessDashboard')}
                      </a>
                      
                      <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                        ${t('dashboardInfo')}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                        © ${new Date().getFullYear()} MindMetric. ${t('allRightsReserved')}
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
      return NextResponse.json({
        success: true,
        message: 'Email reenviado correctamente',
        email: email,
        tempPassword: tempPassword,
        user: {
          id: user.id,
          email: user.email,
          userName: user.userName,
          iq: user.iq
        }
      })
    } else {
      return NextResponse.json({
        error: 'Error al enviar el email',
        details: result.error
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Error en resend-welcome-email:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}

