import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { generateToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getStripeClient() {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'test'
  const secretKey = mode === 'live'
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')
  if (!secretKey) throw new Error(`Clave de Stripe no configurada para modo "${mode}"`)
  return new Stripe(secretKey, { apiVersion: '2024-04-10' as any })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id requerido' }, { status: 400 })
    }

    const stripe = await getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || (session.payment_status !== 'paid' && session.status !== 'complete')) {
      return NextResponse.json({ error: 'Sesión de pago no válida o no completada' }, { status: 400 })
    }

    const email = session.customer_email || (session.metadata?.email as string)

    if (!email) {
      return NextResponse.json({ error: 'No se encontró email en la sesión' }, { status: 400 })
    }

    // Buscar o esperar que el webhook haya creado el usuario
    let user = await db.getUserByEmail(email)

    // Si el webhook aún no procesó, buscamos hasta 3 intentos
    if (!user) {
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 1000))
        user = await db.getUserByEmail(email)
        if (user) break
      }
    }

    if (!user) {
      return NextResponse.json({
        error: 'Usuario aún siendo procesado. Inténtalo de nuevo en unos segundos.',
        retry: true,
      }, { status: 202 })
    }

    // Generar token de autenticación
    const token = generateToken(user.id, user.email)

    return NextResponse.json({
      success: true,
      token,
      user: {
        email: user.email,
        userName: user.userName,
        iq: user.iq,
        subscriptionStatus: user.subscriptionStatus,
        trialEndDate: user.trialEndDate,
      },
      sessionMetadata: {
        testType: session.metadata?.testType || 'iq',
        lang: session.metadata?.lang || 'es',
      },
    })
  } catch (error: any) {
    console.error('❌ [verify-session] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
