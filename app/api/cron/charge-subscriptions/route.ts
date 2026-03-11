import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('No se encontró POSTGRES_URL o DATABASE_URL en las variables de entorno')
  }
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}

async function chargeUser(user: { email: string }, amount: number, description: string): Promise<{ ok: boolean; data: any }> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://mindmetric.io'}/api/recurring-payment`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-api-key': process.env.INTERNAL_API_KEY || '',
    },
    body: JSON.stringify({ email: user.email, amount, description }),
  })
  const data = await response.json()
  return { ok: response.ok && data.success, data }
}

/**
 * Cron Job: cobra suscripciones cada 6 horas.
 * 
 * 1. Trials vencidos → primer cobro de 9.99€
 * 2. Suscripciones activas con access_until vencido → renovación
 * 3. Suscripciones activas con cobro fallido previo → reintento
 */
export async function GET(request: NextRequest) {
  const pool = getPool()

  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 [cron] Iniciando cobro de suscripciones...')

    const now = new Date()
    const results = {
      checked: 0,
      charged: 0,
      failed: 0,
      errors: [] as string[],
    }

    // --- 1. Trials vencidos: primer cobro ---
    console.log('📋 [cron] Buscando usuarios con trial vencido...')
    const expiredTrials = await pool.query(`
      SELECT id, email, subscription_id, trial_end_date
      FROM users
      WHERE subscription_status = 'trial'
        AND trial_end_date <= $1
        AND subscription_id IS NOT NULL
    `, [now.toISOString()])

    console.log(`📊 [cron] ${expiredTrials.rows.length} usuarios con trial vencido`)

    for (const user of expiredTrials.rows) {
      results.checked++
      try {
        console.log(`💳 [cron] Cobrando trial vencido: ${user.email}`)
        const { ok, data } = await chargeUser(user, 9.99, 'Suscripción mensual MindMetric Premium')
        if (ok) {
          results.charged++
          console.log(`✅ [cron] Cobro trial OK: ${user.email} - ${data.transactionId}`)
        } else {
          results.failed++
          results.errors.push(`${user.email}: ${data.error}`)
          console.error(`❌ [cron] Cobro trial fallido: ${user.email}: ${data.error}`)
        }
      } catch (error: any) {
        results.failed++
        results.errors.push(`${user.email}: ${error.message}`)
        console.error(`❌ [cron] Error ${user.email}:`, error.message)
      }
    }

    // --- 2. Suscripciones activas con access_until vencido ---
    console.log('📋 [cron] Buscando renovaciones pendientes...')
    const renewals = await pool.query(`
      SELECT id, email, subscription_id, access_until
      FROM users
      WHERE subscription_status = 'active'
        AND access_until <= $1
        AND subscription_id IS NOT NULL
    `, [now.toISOString()])

    console.log(`📊 [cron] ${renewals.rows.length} suscripciones a renovar`)

    for (const user of renewals.rows) {
      results.checked++
      try {
        console.log(`🔄 [cron] Renovando: ${user.email}`)
        const { ok, data } = await chargeUser(user, 9.99, 'Renovación mensual MindMetric Premium')
        if (ok) {
          results.charged++
          console.log(`✅ [cron] Renovación OK: ${user.email} - ${data.transactionId}`)
        } else {
          results.failed++
          results.errors.push(`${user.email}: ${data.error}`)
          console.error(`❌ [cron] Renovación fallida: ${user.email}: ${data.error}`)
        }
      } catch (error: any) {
        results.failed++
        results.errors.push(`${user.email}: ${error.message}`)
        console.error(`❌ [cron] Error renovación ${user.email}:`, error.message)
      }
    }

    console.log('📊 [cron] Resumen:')
    console.log(`   ✅ Cobrados: ${results.charged}`)
    console.log(`   ❌ Fallidos: ${results.failed}`)
    console.log(`   📋 Total: ${results.checked}`)

    return NextResponse.json({
      success: true,
      summary: results,
      timestamp: now.toISOString(),
    })

  } catch (error: any) {
    console.error('❌ [cron] Error general:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
