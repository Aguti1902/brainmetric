import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
export const dynamic = 'force-dynamic'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userName, iq, lang } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🔄 Creando usuario:', { email, userName, iq, lang })
    
    // Verificar si el usuario ya existe
    const existingUser = await db.getUserByEmail(email)
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Usuario ya existe',
        user: {
          email: existingUser.email,
          userName: existingUser.userName,
          iq: existingUser.iq,
          createdAt: existingUser.createdAt
        }
      }, { status: 400 })
    }

    // Generar contraseña aleatoria
    const password = Math.random().toString(36).slice(-12)
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Calcular fecha de fin de trial (2 días desde ahora)
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 2)
    
    // Crear usuario
    const user = await db.createUser({
      email,
      password: hashedPassword,
      userName: userName || 'Usuario',
      iq: iq || 0,
      subscriptionStatus: 'trial',
      trialEndDate: trialEndDate.toISOString(),
    })

    console.log('✅ Usuario creado:', user.email)
    console.log('🔑 Contraseña generada:', password)

    // Enviar email con credenciales
    const t = (key: any) => getEmailTranslation(lang || 'es', key)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://brainmetric.io'
    const loginUrl = `${appUrl}/${lang || 'es'}/cuenta`

    const emailData = {
      to: email,
      subject: t('welcomeSubject'),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('welcome')} Brain Metric</title>
        </head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table role="presentation" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#0F172A 0%,#6366F1 100%);padding:40px 30px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Brain Metric</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 30px;text-align:center;">
                      <h2 style="color:#0F172A;margin:0 0 20px 0;font-size:24px;font-weight:600;">
                        ${t('welcome')} Brain Metric!
                      </h2>
                      <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
                        ${t('hello')} ${userName || t('user')},
                      </p>
                      <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px 0;">
                        ${t('congratulations')}
                      </p>
                      ${iq ? `
                      <div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:0 0 30px 0;text-align:left;">
                        <h3 style="color:#0F172A;margin:0 0 10px 0;font-size:18px;">🎯 ${t('yourIQResult')}: ${iq}</h3>
                        <p style="color:#4a5568;font-size:14px;margin:0;">${t('completedTest')}</p>
                      </div>` : ''}
                      <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:20px;margin:0 0 30px 0;text-align:left;">
                        <h3 style="color:#c53030;margin:0 0 15px 0;font-size:18px;">🔑 ${t('loginCredentials')}</h3>
                        <p style="color:#4a5568;font-size:14px;margin:0 0 8px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="color:#4a5568;font-size:14px;margin:0;"><strong>${t('password')}:</strong> ${password}</p>
                        <p style="color:#e53e3e;font-size:12px;margin:10px 0 0 0;">⚠️ ${t('securityWarning')}</p>
                      </div>
                      <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0F172A 0%,#6366F1 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                        ${t('accessDashboard')}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f7fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="color:#718096;font-size:12px;margin:0;">
                        © ${new Date().getFullYear()} Brain Metric. ${t('allRightsReserved')}
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

    const emailResult = await sendEmail(emailData)

    return NextResponse.json({
      success: true,
      message: 'Usuario creado y email enviado',
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        iq: user.iq,
        subscriptionStatus: user.subscriptionStatus,
        trialEndDate: user.trialEndDate,
        createdAt: user.createdAt
      },
      credentials: {
        email: email,
        password: password
      },
      emailSent: emailResult.success
    })

  } catch (error: any) {
    console.error('❌ Error en create-user-payment:', error)
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor',
      stack: error.stack
    }, { status: 500 })
  }
}

