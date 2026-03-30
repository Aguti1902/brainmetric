import { NextResponse } from 'next/server'
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

export async function GET() {
  const pool = getPool()
  try {
    const stripe = await getStripe()
    const now = new Date()
    const startOfMonth = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000)

    // 1. Suscripciones activas y en trial desde Stripe
    const [activeSubs, trialingSubs, cancelledSubs] = await Promise.all([
      stripe.subscriptions.list({ status: 'active', limit: 100 }),
      stripe.subscriptions.list({ status: 'trialing', limit: 100 }),
      stripe.subscriptions.list({ status: 'canceled', limit: 100, created: { gte: startOfMonth } }),
    ])

    const activeCount = activeSubs.data.length
    const trialCount = trialingSubs.data.length
    const cancelledThisMonth = cancelledSubs.data.length

    // MRR real: suma de precios de suscripciones activas
    const mrr = activeSubs.data.reduce((sum, sub) => {
      const amount = sub.items.data[0]?.price?.unit_amount || 0
      return sum + amount / 100
    }, 0)

    // 2. Ingresos totales: suma de todos los charges del mes
    const chargesThisMonth = await stripe.charges.list({
      limit: 100,
      created: { gte: startOfMonth },
    })
    const totalRevenue = chargesThisMonth.data
      .filter(c => c.paid && !c.refunded)
      .reduce((sum, c) => sum + c.amount / 100, 0)

    const totalRefunded = chargesThisMonth.data
      .filter(c => c.refunded || c.amount_refunded > 0)
      .reduce((sum, c) => sum + c.amount_refunded / 100, 0)

    // 3. Conversión: trial → active
    const totalTrials = trialCount + activeCount
    const conversionRate = totalTrials > 0 ? (activeCount / totalTrials) * 100 : 0
    const totalActiveAtStart = activeCount + cancelledThisMonth
    const churnRate = totalActiveAtStart > 0 ? (cancelledThisMonth / totalActiveAtStart) * 100 : 0

    // 4. Transacciones recientes desde Stripe
    const recentCharges = await stripe.charges.list({ limit: 20 })
    const recentEmails = [...new Set(recentCharges.data.map(c => c.billing_details?.email || c.receipt_email || '').filter(Boolean))]
    const userMap: Record<string, string> = {}
    if (recentEmails.length > 0) {
      const placeholders = recentEmails.map((_, i) => `$${i + 1}`).join(',')
      const res = await pool.query(
        `SELECT email, user_name FROM users WHERE LOWER(email) = ANY(ARRAY[${placeholders}])`,
        recentEmails.map(e => e.toLowerCase())
      )
      res.rows.forEach(r => { userMap[r.email.toLowerCase()] = r.user_name })
    }

    const recentTransactions = recentCharges.data.map(c => {
      const email = c.billing_details?.email || c.receipt_email || ''
      return {
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency.toUpperCase(),
        status: c.paid ? 'succeeded' : 'failed',
        customer_email: email,
        customer_name: userMap[email.toLowerCase()] || email.split('@')[0] || 'N/A',
        created: new Date(c.created * 1000).toISOString(),
        description: c.amount <= 50 ? 'Pago inicial (0,50€)' : 'Suscripción mensual',
      }
    })

    // 5. Lista de suscripciones activas
    const activeSubscriptionsList = [...activeSubs.data, ...trialingSubs.data]
      .slice(0, 10)
      .map(sub => {
        const customer = sub.customer as string
        return {
          id: sub.id,
          customer_id: customer,
          status: sub.status === 'trialing' ? 'trial' : 'active',
          plan: 'BrainMetric Premium',
          amount: sub.items.data[0]?.price?.unit_amount ? sub.items.data[0].price.unit_amount / 100 : 214.99,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          activeSubscriptions: activeCount,
          trialingSubscriptions: trialCount,
          cancelationsThisMonth: cancelledThisMonth,
          refundsThisMonth: totalRefunded,
          mrr: Math.round(mrr * 100) / 100,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalRefunded: Math.round(totalRefunded * 100) / 100,
          conversionRate: Math.round(conversionRate * 10) / 10,
          churnRate: Math.round(churnRate * 10) / 10,
        },
        charts: {
          monthlyRevenue: [],
        },
        tables: {
          recentTransactions,
          activeSubscriptions: activeSubscriptionsList,
        },
        aiMetrics: {
          totalRequests: 0,
          refundApproved: 0,
          refundDenied: 0,
          cancelationsProcessed: cancelledThisMonth,
          avgResponseTime: 0,
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching dashboard from Stripe:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
