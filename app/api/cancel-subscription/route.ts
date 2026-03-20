import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getStripe(): Promise<Stripe> {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
  const secretKey = mode === 'live'
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')
  return new Stripe(secretKey, { apiVersion: '2024-04-10' as any })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    let userEmail: string | null = email || null

    if (token) {
      const authData = verifyToken(token)
      if (authData && authData.email) {
        userEmail = authData.email
      }
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🚫 [cancel] Cancelando suscripción para:', userEmail)

    const user = await db.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trial') {
      return NextResponse.json(
        { error: 'No hay suscripción activa para cancelar' },
        { status: 400 }
      )
    }

    const accessUntil = user.accessUntil || user.trialEndDate || new Date().toISOString()

    // Cancelar en Stripe antes de actualizar la BD
    if (user.subscriptionId) {
      try {
        const stripe = await getStripe()
        await stripe.subscriptions.cancel(user.subscriptionId)
        console.log(`✅ [cancel] Suscripción Stripe cancelada: ${user.subscriptionId}`)
      } catch (stripeErr: any) {
        console.warn(`⚠️ [cancel] No se pudo cancelar en Stripe (${user.subscriptionId}): ${stripeErr.message}`)
      }
    }

    await db.updateUser(user.id, {
      subscriptionStatus: 'cancelled',
      subscriptionId: null as any,
    })

    console.log('✅ [cancel] Suscripción cancelada. Acceso hasta:', accessUntil)

    try {
      const userName = user.userName || userEmail.split('@')[0]
      const accessDate = new Date(accessUntil).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const cancelEmail = emailTemplates.subscriptionCancelled(userEmail, userName, accessDate, 'es')
      await sendEmail(cancelEmail)
      console.log('📧 [cancel] Email de cancelación enviado a:', userEmail)
    } catch (emailErr: any) {
      console.error('⚠️ [cancel] Error enviando email:', emailErr.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente',
      accessUntil,
    })

  } catch (error: any) {
    console.error('❌ [cancel] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Error cancelando suscripción' },
      { status: 500 }
    )
  }
}
