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
    const status = searchParams.get('status') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    let query = `
      SELECT id, email, user_name, subscription_status, subscription_id,
             trial_end_date, access_until, created_at, updated_at
      FROM users
      WHERE subscription_id IS NOT NULL OR subscription_status != 'expired'
    `
    const params: any[] = []
    let paramIdx = 1

    if (status !== 'all') {
      query += ` AND subscription_status = $${paramIdx++}`
      params.push(status)
    }

    if (search) {
      query += ` AND (email ILIKE $${paramIdx++} OR user_name ILIKE $${paramIdx++})`
      params.push(`%${search}%`)
      params.push(`%${search}%`)
    }

    query += ` ORDER BY updated_at DESC LIMIT $${paramIdx++}`
    params.push(limit)

    const result = await pool.query(query, params)

    const formattedSubs = result.rows.map(row => ({
      id: row.id,
      customer_email: row.email,
      customer_name: row.user_name || 'N/A',
      plan: 'Premium',
      status: row.subscription_status,
      has_card_token: !!row.subscription_id,
      amount: 19.99,
      currency: 'EUR',
      current_period_end: row.access_until || row.trial_end_date || null,
      trial_end: row.trial_end_date,
      access_until: row.access_until,
      created: row.created_at,
      updated: row.updated_at,
    }))

    return NextResponse.json({
      success: true,
      data: formattedSubs,
      total: formattedSubs.length,
    })
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  } finally {
    await pool.end().catch(() => {})
  }
}

export async function DELETE(req: NextRequest) {
  const pool = getPool()
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE users SET subscription_status = 'cancelled', subscription_id = NULL, updated_at = NOW() WHERE id = $1`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
    })
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  } finally {
    await pool.end().catch(() => {})
  }
}
