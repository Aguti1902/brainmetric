import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

async function getStripeConfig() {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'test'
  const isLive = mode === 'live'

  const secretKey = isLive
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')

  if (!secretKey) throw new Error(`Clave secreta de Stripe no configurada para modo "${mode}"`)

  return {
    stripe: new Stripe(secretKey, { apiVersion: '2024-04-10' as any }),
    mode,
    trialDays: parseInt(config.trial_days || process.env.STRIPE_TRIAL_DAYS || '2'),
    prices: {
      monthly: isLive
        ? (config.stripe_live_price_monthly || process.env.STRIPE_PRICE_MONTHLY || '')
        : (config.stripe_test_price_monthly || process.env.STRIPE_PRICE_MONTHLY || ''),
      biweekly: isLive
        ? (config.stripe_live_price_biweekly || process.env.STRIPE_PRICE_BIWEEKLY || '')
        : (config.stripe_test_price_biweekly || process.env.STRIPE_PRICE_BIWEEKLY || ''),
      setupFee: isLive
        ? (config.stripe_live_setup_fee_price || process.env.STRIPE_SETUP_FEE_PRICE || '')
        : (config.stripe_test_setup_fee_price || process.env.STRIPE_SETUP_FEE_PRICE || ''),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      lang = 'es',
      testType = 'iq',
      userName,
      userIQ,
      testData,
      planType = 'monthly',
    } = body

    if (!email) return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })

    const { stripe, prices, trialDays, mode } = await getStripeConfig()
    const priceId = planType === 'biweekly' ? prices.biweekly : prices.monthly

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID no configurado para plan "${planType}" (modo ${mode}). Añade STRIPE_PRICE_MONTHLY o STRIPE_PRICE_BIWEEKLY en las variables de entorno.` },
        { status: 500 }
      )
    }

    if (!prices.setupFee) {
      return NextResponse.json(
        { error: `Setup fee price no configurado (modo ${mode}). Añade STRIPE_SETUP_FEE_PRICE.` },
        { status: 500 }
      )
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://brainmetric.io'
    const meta = {
      email,
      testType,
      planType,
      userName: userName || email.split('@')[0],
      userIQ: String(userIQ || 100),
      lang,
      testData: testData ? JSON.stringify(testData).substring(0, 400) : '',
    }

    console.log(`💳 [stripe] Checkout | modo: ${mode} | plan: ${planType} | email: ${email}`)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        // 0.50€ cobrado hoy (one-time, desbloquea el resultado)
        { price: prices.setupFee, quantity: 1 },
        // Suscripción con trial de 2 días
        { price: priceId, quantity: 1 },
      ],
      subscription_data: {
        trial_period_days: trialDays,
        trial_settings: {
          end_behavior: { missing_payment_method: 'cancel' },
        },
        metadata: meta,
      },
      metadata: meta,
      success_url: `${origin}/${lang}/resultado?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${origin}/${lang}/resultado-estimado?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: (
        lang === 'es' ? 'es' :
        lang === 'fr' ? 'fr' :
        lang === 'de' ? 'de' :
        lang === 'pt' ? 'pt-BR' :
        lang === 'it' ? 'it' : 'en'
      ) as Stripe.Checkout.SessionCreateParams.Locale,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('❌ [stripe] Error en checkout:', error)
    return NextResponse.json({ error: error.message || 'Error creando sesión de pago' }, { status: 500 })
  }
}
