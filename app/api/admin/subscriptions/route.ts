import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Pool } from 'pg'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

async function getStripe(): Promise<Stripe> {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
  const secretKey = mode === 'live'
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')
  return new Stripe(secretKey, { apiVersion: '2024-04-10' as any })
}

export async function GET(req: NextRequest) {
  const pool = getPool()
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const statusFilter = searchParams.get('status') || 'all'

    const stripe = await getStripe()

    // Obtener suscripciones de Stripe
    const allSubs: Stripe.Subscription[] = []
    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore && allSubs.length < 500) {
      const page = await stripe.subscriptions.list({
        limit: 100,
        status: 'all',
        expand: ['data.customer'],
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      })
      allSubs.push(...page.data)
      hasMore = page.has_more
      if (page.data.length > 0) startingAfter = page.data[page.data.length - 1].id
    }

    // Obtener nombres de usuarios desde la BD
    const emails = [...new Set(allSubs.map(s => {
      const c = s.customer as Stripe.Customer
      return c?.email || ''
    }).filter(Boolean))]

    const userMap: Record<string, string> = {}
    if (emails.length > 0) {
      const placeholders = emails.map((_, i) => `$${i + 1}`).join(',')
      const res = await pool.query(
        `SELECT email, user_name FROM users WHERE LOWER(email) = ANY(ARRAY[${placeholders}])`,
        emails.map(e => e.toLowerCase())
      )
      res.rows.forEach(r => { userMap[r.email.toLowerCase()] = r.user_name })
    }

    const mapStatus = (s: string) => {
      if (s === 'active') return 'active'
      if (s === 'trialing') return 'trial'
      if (s === 'canceled') return 'cancelled'
      if (s === 'past_due' || s === 'unpaid') return 'expired'
      return s
    }

    const formattedSubs = allSubs
      .map(sub => {
        const customer = sub.customer as Stripe.Customer
        const email = customer?.email || ''
        const name = userMap[email.toLowerCase()] || email.split('@')[0] || 'N/A'
        const status = mapStatus(sub.status)
        const amount = sub.items.data[0]?.price?.unit_amount
          ? sub.items.data[0].price.unit_amount / 100
          : 19.99

        return {
          id: sub.id,
          customer_email: email,
          customer_name: name,
          plan: 'Premium',
          status,
          has_card_token: !!sub.default_payment_method,
          amount,
          currency: 'EUR',
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          created: new Date(sub.created * 1000).toISOString(),
        }
      })
      .filter(s => {
        const matchStatus = statusFilter === 'all' || s.status === statusFilter
        const matchSearch = !search || s.customer_email.includes(search) || s.customer_name.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

    return NextResponse.json({
      success: true,
      data: formattedSubs,
      total: formattedSubs.length,
    })
  } catch (error: any) {
    console.error('Error fetching subscriptions from Stripe:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}

export async function DELETE(req: NextRequest) {
  const pool = getPool()
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')
    if (!userId) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })

    // Cancelar en Stripe si tiene subscription_id
    const res = await pool.query('SELECT subscription_id FROM users WHERE id = $1', [userId])
    if (res.rows[0]?.subscription_id) {
      const stripe = await getStripe()
      await stripe.subscriptions.cancel(res.rows[0].subscription_id).catch(() => {})
    }

    await pool.query(
      `UPDATE users SET subscription_status = 'cancelled', subscription_id = NULL, updated_at = NOW() WHERE id = $1`,
      [userId]
    )

    return NextResponse.json({ success: true, message: 'Suscripción cancelada' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
