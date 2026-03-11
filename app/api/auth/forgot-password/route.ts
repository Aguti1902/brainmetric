import { NextRequest, NextResponse } from 'next/server'
import { generatePasswordResetToken } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'

export async function POST(request: NextRequest) {
  let lang = 'es' // Default language
  try {
    const body = await request.json()
    const { email } = body
    lang = body.lang || 'es' // Update language from body

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await db.getUserByEmail(email)
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
      })
    }

    // Generar token de reset
    const token = generatePasswordResetToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas

    // Guardar token en la base de datos
    await db.createPasswordResetToken(email, token, expiresAt)
    
    // Enviar email de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mindmetric.io'}/${lang}/reset-password?token=${token}`
    
    const t = (key: any) => getEmailTranslation(lang, key)
    
    const emailData = {
      to: email,
      subject: `${t('resetPasswordSubject')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('resetPassword')}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                      <img src="https://www.mindmetric.io/images/MINDMETRIC/Logo_blanco.png" alt="MindMetric" style="height: 40px; width: auto; margin: 0 auto; display: block;" />
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                        ${t('resetPassword')}
                      </h2>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${t('hello')} ${user.userName},
                      </p>
                      
                      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        ${t('resetPasswordMessage')}
                      </p>
                      
                      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                        ${t('resetPasswordButton')}
                      </a>
                      
                      <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                        ${t('resetPasswordIgnore')}
                      </p>
                      
                      <p style="color: #718096; font-size: 12px; margin: 20px 0 0 0; line-height: 1.6;">
                        ${t('resetPasswordExpiry')}
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
                        info@mindmetric.io
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

    await sendEmail(emailData)

    const successMessage = {
      es: 'Si el email existe, se ha enviado un enlace de recuperación',
      en: 'If the email exists, a recovery link has been sent',
      fr: 'Si l\'email existe, un lien de récupération a été envoyé',
      de: 'Wenn die E-Mail existiert, wurde ein Wiederherstellungslink gesendet',
      it: 'Se l\'email esiste, è stato inviato un link di recupero',
      pt: 'Se o email existir, um link de recuperação foi enviado',
      sv: 'Om e-postadressen finns har en återställningslänk skickats',
      no: 'Hvis e-posten eksisterer, er en gjenopprettingslenke sendt',
    }
    
    return NextResponse.json({
      success: true,
      message: successMessage[lang as keyof typeof successMessage] || successMessage.en,
    })

  } catch (error: any) {
    console.error('Error en forgot-password:', error)
    const errorMessage = {
      es: 'Error interno del servidor',
      en: 'Internal server error',
      fr: 'Erreur interne du serveur',
      de: 'Interner Serverfehler',
      it: 'Errore interno del server',
      pt: 'Erro interno do servidor',
      sv: 'Internt serverfel',
      no: 'Intern serverfeil',
    }
    return NextResponse.json(
      { error: errorMessage[lang as keyof typeof errorMessage] || errorMessage.en },
      { status: 500 }
    )
  }
}
