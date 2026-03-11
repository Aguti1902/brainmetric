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

  return {
    stripe: new Stripe(secretKey, { apiVersion: '2024-04-10' as any }),
    mode,
    trialDays: parseInt(config.trial_days || process.env.STRIPE_TRIAL_DAYS || '2'),
    prices: {
      monthly: isLive
        ? (config.stripe_live_price_monthly || process.env.STRIPE_PRICE_MONTHLY || '')
        : (config.stripe_test_price_monthly || process.env.STRIPE_PRICE_MONTHLY || ''),
      setupFee: isLive
        ? (config.stripe_live_setup_fee_price || process.env.STRIPE_SETUP_FEE_PRICE || '')
        : (config.stripe_test_setup_fee_price || process.env.STRIPE_SETUP_FEE_PRICE || ''),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, lang = 'es', testType = 'iq', userName, userIQ, testData } = body

    if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

    const { stripe, prices, trialDays, mode } = await getStripeConfig()

    if (!prices.monthly) {
      return NextResponse.json({ error: `Price ID mensual no configurado (modo ${mode})` }, { status: 500 })
    }
    if (!prices.setupFee) {
      return NextResponse.json({ error: `Setup fee price no configurado (modo ${mode})` }, { status: 500 })
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://brainmetric.io'
    const meta = {
      email,
      testType,
      planType: 'monthly',
      userName: userName || email.split('@')[0],
      userIQ: String(userIQ || 100),
      lang,
      testData: testData ? JSON.stringify(testData).substring(0, 400) : '',
    }

    console.log(`💳 [stripe-embedded] Creando sesión | modo: ${mode} | email: ${email}`)

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        { price: prices.setupFee, quantity: 1 },
        { price: prices.monthly,  quantity: 1 },
      ],
      subscription_data: {
        trial_period_days: trialDays,
        trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        metadata: meta,
      },
      metadata: meta,
      return_url: `${origin}/${lang}/resultado?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      locale: (
        lang === 'es' ? 'es' :
        lang === 'fr' ? 'fr' :
        lang === 'de' ? 'de' :
        lang === 'pt' ? 'pt-BR' :
        lang === 'it' ? 'it' : 'en'
      ) as Stripe.Checkout.SessionCreateParams.Locale,
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error: any) {
    console.error('❌ [stripe-embedded] Error:', error)
    return NextResponse.json({ error: error.message || 'Error creando sesión' }, { status: 500 })
  }
}
