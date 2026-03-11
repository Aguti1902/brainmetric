import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { generateToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getStripe(): Promise<Stripe> {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
  const isLive = mode === 'live'
  const secretKey = isLive
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')
  if (!secretKey) throw new Error('Clave de Stripe no configurada')
  return new Stripe(secretKey, { apiVersion: '2024-04-10' as any })
}

export async function GET(request: NextRequest) {
  const paymentIntentId = request.nextUrl.searchParams.get('payment_intent')

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'payment_intent requerido' }, { status: 400 })
  }

  try {
    const stripe = await getStripe()
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: `Pago no completado: ${pi.status}` }, { status: 402 })
    }

    const email = pi.metadata?.email || ''
    if (!email) {
      return NextResponse.json({ error: 'Email no encontrado en la transacción' }, { status: 400 })
    }

    // Buscar usuario con reintentos (el webhook puede tardar unos segundos)
    let user = null
    for (let attempt = 0; attempt < 5; attempt++) {
      user = await db.getUserByEmail(email)
      if (user) break
      await new Promise(r => setTimeout(r, attempt === 0 ? 1000 : 2000))
    }

    if (!user) {
      // Si el webhook aún no creó al usuario, devolvemos datos básicos
      // El webhook lo creará en breve
      return NextResponse.json({
        success: true,
        userCreated: false,
        email,
        message: 'Pago completado. Tu cuenta se está creando...',
      })
    }

    const token = generateToken(user.id, user.email)

    return NextResponse.json({
      success: true,
      userCreated: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        iq: user.iq,
        subscriptionStatus: user.subscriptionStatus,
      },
    })
  } catch (error: any) {
    console.error('❌ [verify-payment-intent] Error:', error)
    return NextResponse.json({ error: error.message || 'Error verificando pago' }, { status: 500 })
  }
}
