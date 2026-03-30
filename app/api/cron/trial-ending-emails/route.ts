import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No se encontró POSTGRES_URL o DATABASE_URL')
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}

async function getStripe(): Promise<Stripe | null> {
  try {
    const config = await db.getAllConfig()
    const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
    const isLive = mode === 'live'
    const secretKey = isLive
      ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
      : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')
    if (!secretKey) return null
    return new Stripe(secretKey, { apiVersion: '2024-04-10' as any })
  } catch {
    return null
  }
}

/**
 * Cron: envía email "tu trial acaba mañana" a usuarios cuyo trial
 * termina en las próximas 24-30 horas.
 * Se ejecuta una vez al día a las 9:00 UTC.
 */
export async function GET(request: NextRequest) {
  const pool = getPool()

  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📧 [trial-ending] Buscando usuarios con trial que expira mañana...')

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in30h = new Date(now.getTime() + 30 * 60 * 60 * 1000)

    const result = await pool.query(`
      SELECT id, email, user_name, trial_end_date, subscription_id
      FROM users
      WHERE subscription_status = 'trial'
        AND trial_end_date > $1
        AND trial_end_date <= $2
    `, [in24h.toISOString(), in30h.toISOString()])

    const users = result.rows
    console.log(`📊 [trial-ending] ${users.length} usuarios con trial expirando mañana`)

    // Obtener Stripe para recuperar el idioma del cliente
    const stripe = await getStripe()

    let sent = 0
    let failed = 0

    for (const user of users) {
      try {
        const userName = user.user_name || user.email.split('@')[0]

        // Intentar obtener el idioma desde Stripe customer metadata
        let lang = 'es'
        if (stripe && user.subscription_id) {
          try {
            const sub = await stripe.subscriptions.retrieve(user.subscription_id)
            lang = (sub.metadata?.lang as string) || 'es'
          } catch {
            // Si falla, usar 'es' por defecto
          }
        }

        const trialEndDate = user.trial_end_date
          ? new Date(user.trial_end_date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : ''
        const subject = lang === 'es' ? '⏰ Tu trial premium termina mañana' : '⏰ Your premium trial ends tomorrow'
        const emailData = {
          to: user.email,
          subject,
          html: `
            <!DOCTYPE html><html><head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td align="center" style="padding:40px 20px;">
                  <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                    <tr><td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:40px 30px;text-align:center;">
                      <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height:32px;margin:0 auto 20px;display:block;"/>
                      <h1 style="color:#fff;margin:0;font-size:28px;">⏰ ${lang === 'es' ? 'Tu trial termina mañana' : 'Your trial ends tomorrow'}</h1>
                    </td></tr>
                    <tr><td style="padding:40px 30px;">
                      <h2 style="color:#0F172A;margin:0 0 20px;">${lang === 'es' ? 'Hola' : 'Hello'}, ${userName}! 👋</h2>
                      <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px;">
                        ${lang === 'es'
                          ? 'Tu periodo de prueba premium termina <strong>mañana</strong>. Si no cancelas antes, se cobrará automáticamente 29,99€/mes.'
                          : 'Your premium trial ends <strong>tomorrow</strong>. If you don\'t cancel, €29.99/month will be charged automatically.'}
                      </p>
                      <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:8px;padding:20px;margin:30px 0;text-align:center;">
                        <p style="color:#856404;font-size:16px;margin:0 0 8px;font-weight:600;">💳 ${lang === 'es' ? 'Próximo cobro: 29,99€' : 'Next charge: €29.99'}</p>
                        <p style="color:#856404;font-size:13px;margin:0;">${trialEndDate}</p>
                      </div>
                      <div style="text-align:center;margin:30px 0;">
                        <a href="https://brainmetric.io/${lang}/cuenta" style="display:inline-block;background:linear-gradient(135deg,#0F172A 0%,#6366F1 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                          ${lang === 'es' ? 'Gestionar Suscripción' : 'Manage Subscription'}
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
        await sendEmail(emailData)
        sent++
        console.log(`✅ [trial-ending] Email enviado a: ${user.email} (${lang})`)
      } catch (err: any) {
        failed++
        console.error(`❌ [trial-ending] Error enviando a ${user.email}:`, err.message)
      }
    }

    return NextResponse.json({
      success: true,
      found: users.length,
      sent,
      failed,
      timestamp: now.toISOString(),
    })
  } catch (error: any) {
    console.error('❌ [trial-ending] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
