import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { sendEmail, emailTemplates } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

async function getStripeAndConfig() {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
  const isLive = mode === 'live'
  const secretKey = isLive
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')
  if (!secretKey) throw new Error('Clave de Stripe no configurada')
  return {
    stripe: new Stripe(secretKey, { apiVersion: '2024-04-10' as any }),
    config,
    mode,
    isLive,
    trialDays: parseInt(config.trial_days || '2'),
    prices: {
      monthly: isLive
        ? (config.stripe_live_price_monthly || process.env.STRIPE_PRICE_MONTHLY || '')
        : (config.stripe_test_price_monthly || process.env.STRIPE_PRICE_MONTHLY || ''),
    },
  }
}

export async function GET(request: NextRequest) {
  const paymentIntentId = request.nextUrl.searchParams.get('payment_intent')
  if (!paymentIntentId) {
    return NextResponse.json({ error: 'payment_intent requerido' }, { status: 400 })
  }

  try {
    const { stripe, trialDays, prices } = await getStripeAndConfig()

    // 1. Verificar pago con Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: `Pago no completado: ${pi.status}` }, { status: 402 })
    }

    const email     = pi.metadata?.email    || ''
    const userName  = pi.metadata?.userName || email.split('@')[0]
    const lang      = pi.metadata?.lang     || 'es'
    const iq        = parseInt(pi.metadata?.userIQ || '0')
    const priceId   = pi.metadata?.priceId  || prices.monthly
    const customerId = pi.customer as string

    if (!email) {
      return NextResponse.json({ error: 'Email no encontrado en la transacción' }, { status: 400 })
    }

    // 2. Buscar o crear usuario DIRECTAMENTE (sin esperar webhook)
    let existingUser = await db.getUserByEmail(email)
    let plainPassword: string = Math.random().toString(36).slice(-12)

    if (!existingUser) {
      const hashed = await bcrypt.hash(plainPassword, 10)
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + trialDays)

      existingUser = await db.createUser({
        email,
        password: hashed,
        userName,
        iq,
        subscriptionStatus: 'trial',
        subscriptionId: '',
        trialEndDate: trialEnd.toISOString(),
      })
      console.log('✅ [verify-pi] Usuario creado:', email)
    } else {
      // Usuario ya existía — actualizar contraseña y resetear suscripción para el nuevo pago
      const hashed = await bcrypt.hash(plainPassword, 10)
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + trialDays)
      await db.updateUser(existingUser.id, {
        password: hashed,
        subscriptionStatus: 'trial',
        subscriptionId: '',
        trialEndDate: trialEnd.toISOString(),
      })
      existingUser = { ...existingUser, subscriptionId: '', subscriptionStatus: 'trial' }
      console.log('✅ [verify-pi] Usuario existente, suscripción reseteada y contraseña actualizada:', email)
    }

    // 3. Crear suscripción en Stripe (AWAIT — Vercel mata el proceso tras el return)
    const hasSubscription = !!existingUser.subscriptionId
    if (!hasSubscription && customerId && priceId) {
      await createSubscriptionAsync(stripe, customerId, priceId, trialDays, pi, existingUser.id)
    } else {
      if (!customerId) console.warn('⚠️ [verify-pi] customerId vacío — no se puede crear suscripción')
      if (!priceId)    console.warn('⚠️ [verify-pi] priceId vacío — verifica variables de entorno')
    }

    // 4. Enviar email de bienvenida SIEMPRE (nuevo o existente)
    await sendWelcomeEmailAsync(email, userName, iq, lang, plainPassword)

    // 5. Tracking server-side Google Ads (via GA4 Measurement Protocol)
    sendGA4ConversionAsync(email, pi.id, pi.amount / 100).catch(() => {})

    // 6. Generar token y responder
    const token = generateToken(existingUser.id, existingUser.email)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        userName: existingUser.userName,
        iq: existingUser.iq,
        subscriptionStatus: existingUser.subscriptionStatus,
      },
    })
  } catch (error: any) {
    console.error('❌ [verify-payment-intent]', error)
    return NextResponse.json({ error: error.message || 'Error verificando pago' }, { status: 500 })
  }
}

// Crear suscripción en background — no bloquea la respuesta al usuario
async function createSubscriptionAsync(
  stripe: Stripe,
  customerId: string,
  priceId: string,
  trialDays: number,
  pi: Stripe.PaymentIntent,
  userId: string
) {
  try {
    const paymentMethodId = typeof pi.payment_method === 'string'
      ? pi.payment_method
      : (pi.payment_method as any)?.id || ''

    if (paymentMethodId) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      ...(paymentMethodId ? { default_payment_method: paymentMethodId } : {}),
      trial_period_days: trialDays,
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
      metadata: pi.metadata || {},
    })

    await db.updateUser(userId, { subscriptionId: subscription.id })
    console.log('✅ [verify-pi] Suscripción creada:', subscription.id)
  } catch (err: any) {
    console.error('❌ [verify-pi] Error creando suscripción:', err.message)
  }
}

// Tracking server-side: envía evento purchase a GA4 Measurement Protocol
// GA4 lo reenvía automáticamente a Google Ads (si las cuentas están enlazadas)
async function sendGA4ConversionAsync(email: string, transactionId: string, value: number) {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-ETQT995RPQ'
  const apiSecret = process.env.GA4_API_SECRET
  if (!apiSecret) {
    console.warn('⚠️ [ga4] GA4_API_SECRET no configurado — skip server-side tracking')
    return
  }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: email.replace(/[^a-zA-Z0-9]/g, '_'),
          events: [{
            name: 'purchase',
            params: {
              transaction_id: transactionId,
              value,
              currency: 'EUR',
              items: [{ item_id: 'brainmetric_premium', item_name: 'BrainMetric Premium', price: value }],
            },
          }],
        }),
      }
    )
    console.log(`✅ [ga4] Conversión server-side enviada: ${transactionId} (${value}€) → status ${res.status}`)
  } catch (err: any) {
    console.error('❌ [ga4] Error tracking server-side:', err.message)
  }
}

// Enviar email de bienvenida — awaited antes del return para garantizar envío en Vercel
async function sendWelcomeEmailAsync(
  email: string,
  userName: string,
  iq: number,
  lang: string,
  password: string
) {
  try {
    console.log(`📧 [verify-pi] Intentando enviar email a: ${email} (iq=${iq}, lang=${lang}, sendgrid=${!!process.env.SENDGRID_API_KEY})`)
    const emailData = emailTemplates.loginCredentials(email, userName, password, iq, lang)
    const result = await sendEmail(emailData)
    if (result.success) {
      console.log('✅ [verify-pi] Email de bienvenida enviado a:', email)
    } else {
      console.error('❌ [verify-pi] SendGrid rechazó el email:', result.error)
    }
  } catch (err: any) {
    console.error('❌ [verify-pi] Excepción enviando email:', err.message, err.stack)
  }
}
