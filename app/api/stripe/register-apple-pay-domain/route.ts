import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const config = await db.getAllConfig()
    const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
    const isLive = mode === 'live'

    const secretKey = isLive
      ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
      : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe secret key no configurada' }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' as any })

    const results = []
    for (const d of ['brainmetric.io', 'www.brainmetric.io']) {
      try {
        const domain = await stripe.applePayDomains.create({ domain_name: d })
        results.push({ domain: d, id: domain.id, status: 'created' })
      } catch (err: any) {
        results.push({ domain: d, error: err.message })
      }
    }

    return NextResponse.json({ success: true, results, mode })
  } catch (error: any) {
    console.error('❌ [register-apple-pay]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
