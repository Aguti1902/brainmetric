import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

async function getStripeConfig() {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
  const isLive = mode === 'live'

  const secretKey = isLive
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')

  if (!secretKey) throw new Error(`Clave de Stripe no configurada para modo "${mode}"`)

  const prices = {
    monthly: isLive
      ? (config.stripe_live_price_monthly || process.env.STRIPE_PRICE_MONTHLY || '')
      : (config.stripe_test_price_monthly || process.env.STRIPE_PRICE_MONTHLY || ''),
  }

  return {
    stripe: new Stripe(secretKey, { apiVersion: '2024-04-10' as any }),
    mode,
    isLive,
    trialDays: parseInt(config.trial_days || process.env.STRIPE_TRIAL_DAYS || '2'),
    setupFeeAmount: Math.round(parseFloat(config.initial_payment || '0.50') * 100),
    prices,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, lang = 'es', testType = 'iq', userName, userIQ, testData } = body

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

    const { stripe, prices, trialDays, setupFeeAmount, mode } = await getStripeConfig()

    if (!prices.monthly) {
      return NextResponse.json({ error: `Price ID no configurado (modo ${mode})` }, { status: 500 })
    }

    // Crear o recuperar customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 })
    let customer: Stripe.Customer

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { userName: userName || email.split('@')[0], lang, testType },
      })
    }

    console.log(`💳 [create-payment-intent] modo: ${mode} | email: ${email} | customer: ${customer.id}`)

    const meta: Record<string, string> = {
      email,
      customerId: customer.id,
      planType: 'monthly',
      priceId: prices.monthly,
      trialDays: String(trialDays),
      lang,
      testType,
      userName: userName || email.split('@')[0],
      userIQ: String(userIQ || 0),
      testData: testData ? JSON.stringify(testData).substring(0, 400) : '',
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: setupFeeAmount,
      currency: 'eur',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      // setup_future_usage guarda el método de pago para cobrar la suscripción tras el trial
      // es requerido también para Apple Pay / Google Pay en pagos recurrentes
      setup_future_usage: 'off_session',
      metadata: meta,
      receipt_email: email,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    })
  } catch (error: any) {
    console.error('❌ [create-payment-intent] Error:', error)
    return NextResponse.json({ error: error.message || 'Error creando sesión de pago' }, { status: 500 })
  }
}
