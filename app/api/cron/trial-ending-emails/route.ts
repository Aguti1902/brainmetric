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

        const emailData = emailTemplates.trialEndingTomorrow(user.email, userName, lang)
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
