import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

async function getStripeClient() {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || 'test'

  const secretKey = mode === 'live'
    ? config.stripe_live_secret_key
    : config.stripe_test_secret_key

  if (!secretKey) {
    throw new Error(`No hay clave secreta de Stripe configurada para el modo "${mode}". Configúrala en el panel de administración.`)
  }

  return {
    stripe: new Stripe(secretKey, { apiVersion: '2024-04-10' as any }),
    config,
    mode,
    priceId: mode === 'live' ? config.stripe_live_price_id : config.stripe_test_price_id,
    trialDays: parseInt(config.trial_days || '2'),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, lang = 'es', testType = 'iq', userName, userIQ, testData } = body

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }

    const { stripe, priceId, trialDays, mode } = await getStripeClient()

    if (!priceId) {
      return NextResponse.json(
        { error: `No hay Price ID de Stripe configurado para el modo "${mode}". Configúralo en el panel de administración.` },
        { status: 500 }
      )
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    console.log(`💳 [stripe] Creando checkout en modo: ${mode} | email: ${email}`)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          testType,
          userName: userName || email.split('@')[0],
          userIQ: String(userIQ || 100),
          lang,
        },
      },
      metadata: {
        email,
        testType,
        userName: userName || email.split('@')[0],
        userIQ: String(userIQ || 100),
        lang,
        testData: testData ? JSON.stringify(testData).substring(0, 500) : '',
      },
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

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('❌ [stripe] Error en checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
