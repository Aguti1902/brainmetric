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

    const stripe = await getStripe()

    // Obtener todos los PaymentIntents de Stripe (pagos reales)
    const allPIs: Stripe.PaymentIntent[] = []
    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore && allPIs.length < 500) {
      const page = await stripe.paymentIntents.list({
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      })
      allPIs.push(...page.data)
      hasMore = page.has_more
      if (page.data.length > 0) startingAfter = page.data[page.data.length - 1].id
    }

    // Solo pagos exitosos
    const succeeded = allPIs.filter(pi => pi.status === 'succeeded')

    // Obtener nombres de usuarios desde la BD
    const emails = [...new Set(succeeded.map(pi => pi.metadata?.email || pi.receipt_email || '').filter(Boolean))]
    const userMap: Record<string, string> = {}
    if (emails.length > 0) {
      const placeholders = emails.map((_, i) => `$${i + 1}`).join(',')
      const res = await pool.query(
        `SELECT email, user_name FROM users WHERE LOWER(email) = ANY(ARRAY[${placeholders}])`,
        emails.map(e => e.toLowerCase())
      )
      res.rows.forEach(r => { userMap[r.email.toLowerCase()] = r.user_name })
    }

    const formattedTransactions = succeeded
      .map(pi => {
        const email = pi.metadata?.email || pi.receipt_email || ''
        const name = userMap[email.toLowerCase()] || email.split('@')[0] || 'N/A'
        const amount = pi.amount / 100
        const refunded = pi.amount_received < pi.amount || (pi as any).refunded === true
        const amountRefunded = (pi.amount - pi.amount_received) / 100

        return {
          id: pi.id,
          amount,
          amount_refunded: amountRefunded,
          refunded,
          currency: (pi.currency || 'eur').toUpperCase(),
          status: pi.status,
          customer_email: email,
          customer_name: name,
          has_card_token: !!pi.payment_method,
          created: new Date(pi.created * 1000).toISOString(),
          description: amount <= 0.50 ? 'Pago inicial (0,50€)' : 'Suscripción mensual',
        }
      })
      .filter(t => !search || t.customer_email.includes(search) || t.customer_name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length,
    })
  } catch (error: any) {
    console.error('Error fetching transactions from Stripe:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
