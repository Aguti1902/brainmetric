import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    let query = `
      SELECT id, email, user_name, subscription_status, subscription_id,
             trial_end_date, access_until, created_at, updated_at
      FROM users
      ORDER BY updated_at DESC
    `
    const params: any[] = []
    let paramIdx = 1

    if (search) {
      query = `
        SELECT id, email, user_name, subscription_status, subscription_id,
               trial_end_date, access_until, created_at, updated_at
        FROM users
        WHERE email ILIKE $${paramIdx++} OR user_name ILIKE $${paramIdx++}
        ORDER BY updated_at DESC
      `
      params.push(`%${search}%`)
      params.push(`%${search}%`)
    }

    query += ` LIMIT $${paramIdx++}`
    params.push(limit)

    const result = await pool.query(query, params)

    // Usuarios que han pagado tienen subscription_status en: trial, active, cancelled, expired
    // Solo 'failed' o 'pending' son pagos fallidos reales
    const PAID_STATUSES = ['trial', 'active', 'cancelled', 'expired']

    const formattedTransactions = result.rows.map(row => {
      const hasPaid = PAID_STATUSES.includes(row.subscription_status)
      const isActive = row.subscription_status === 'active'
      return {
        id: row.id,
        amount: isActive ? 19.99 : 0.50,
        amount_refunded: 0,
        refunded: false,
        currency: 'EUR',
        status: hasPaid ? 'succeeded' : row.subscription_status,
        customer_email: row.email,
        customer_name: row.user_name || 'N/A',
        has_card_token: !!row.subscription_id,
        created: row.created_at,
        description: isActive ? 'Suscripción mensual' : 'Pago inicial (0,50€)',
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length,
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  } finally {
    await pool.end().catch(() => {})
  }
}
