import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL configured')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

export async function GET() {
  const pool = getPool()
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const statsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE subscription_status = 'active' AND email NOT LIKE '%admin@brainmetric%') as active_count,
        COUNT(*) FILTER (WHERE subscription_status = 'trial' AND email NOT LIKE '%admin@brainmetric%') as trial_count,
        COUNT(*) FILTER (WHERE subscription_status = 'cancelled' AND updated_at >= $1 AND email NOT LIKE '%admin@brainmetric%') as cancelled_this_month,
        COUNT(*) FILTER (WHERE subscription_status = 'expired' AND email NOT LIKE '%admin@brainmetric%') as expired_count,
        COUNT(*) FILTER (WHERE email NOT LIKE '%admin@brainmetric%') as total_users
      FROM users
    `, [startOfMonth.toISOString()])

    const stats = statsResult.rows[0]
    const activeCount = parseInt(stats.active_count)
    const trialCount = parseInt(stats.trial_count)
    const cancelledThisMonth = parseInt(stats.cancelled_this_month)
    const totalUsers = parseInt(stats.total_users)

    const mrr = activeCount * 19.99
    const totalTrials = trialCount + activeCount
    const conversionRate = totalTrials > 0 ? (activeCount / totalTrials) * 100 : 0
    const totalActiveAtStart = activeCount + cancelledThisMonth
    const churnRate = totalActiveAtStart > 0 ? (cancelledThisMonth / totalActiveAtStart) * 100 : 0

    const recentUsersResult = await pool.query(`
      SELECT id, email, user_name, subscription_status, created_at, access_until, trial_end_date
      FROM users
      WHERE email NOT LIKE '%admin@brainmetric%'
      ORDER BY created_at DESC
      LIMIT 20
    `)

    const recentTransactions = recentUsersResult.rows.map(row => ({
      id: row.id,
      amount: row.subscription_status === 'active' ? 19.99 : 0.50,
      currency: 'EUR',
      status: ['active', 'trial', 'cancelled', 'expired'].includes(row.subscription_status) ? 'succeeded' : row.subscription_status,
      customer_email: row.email,
      created: row.created_at,
      description: row.subscription_status === 'active' ? 'Suscripción Premium' : 'Pago inicial (0,50€)',
    }))

    const activeSubsList = await pool.query(`
      SELECT id, email, subscription_status, access_until, trial_end_date, created_at
      FROM users
      WHERE subscription_status IN ('active', 'trial')
        AND email NOT LIKE '%admin@brainmetric%'
      ORDER BY created_at DESC
      LIMIT 10
    `)

    const activeSubscriptionsList = activeSubsList.rows.map(row => ({
      id: row.id,
      customer_id: row.id,
      status: row.subscription_status,
      plan: 'BrainMetric Premium',
      amount: row.subscription_status === 'active' ? 19.99 : 0.50,
      current_period_end: row.access_until || row.trial_end_date,
      trial_end: row.trial_end_date,
    }))

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          activeSubscriptions: activeCount,
          trialingSubscriptions: trialCount,
          cancelationsThisMonth: cancelledThisMonth,
          refundsThisMonth: 0,
          mrr: Math.round(mrr * 100) / 100,
          totalRevenue: 0,
          totalRefunded: 0,
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
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  } finally {
    await pool.end().catch(() => {})
  }
}
