import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'

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
    let isNew = false
    let plainPassword: string | null = null

    if (!existingUser) {
      isNew = true
      plainPassword = Math.random().toString(36).slice(-12)
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
    }

    // 3. Crear suscripción si no tiene (de forma asíncrona, no bloqueamos la respuesta)
    const hasSubscription = !!existingUser.subscriptionId
    if (!hasSubscription && customerId && priceId) {
      createSubscriptionAsync(stripe, customerId, priceId, trialDays, pi, existingUser.id)
    }

    // 4. Enviar email de bienvenida si es nuevo
    if (isNew && plainPassword) {
      sendWelcomeEmailAsync(email, userName, iq, lang, plainPassword)
    }

    // 5. Generar token y responder INMEDIATAMENTE
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

// Enviar email en background
async function sendWelcomeEmailAsync(
  email: string,
  userName: string,
  iq: number,
  lang: string,
  password: string
) {
  try {
    const t = (key: any) => getEmailTranslation(lang || 'es', key)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://brainmetric.io'
    const loginUrl = `${appUrl}/${lang}/cuenta`

    await sendEmail({
      to: email,
      subject: t('welcomeSubject'),
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:system-ui,sans-serif;background:#f5f5f5;">
        <table style="width:100%;"><tr><td align="center" style="padding:40px 20px;">
        <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1);">
          <tr><td style="background:linear-gradient(135deg,#0F172A,#6366F1);padding:40px 30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">Brain Metric</h1></td></tr>
          <tr><td style="padding:40px 30px;text-align:center;">
            <h2 style="color:#0F172A;margin:0 0 20px;">${t('welcome')} Brain Metric!</h2>
            <p style="color:#4a5568;">${t('hello')} ${userName},</p>
            <p style="color:#4a5568;">${t('congratulations')}</p>
            ${iq ? `<div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:0 0 30px;text-align:left;">
              <h3 style="color:#0F172A;margin:0 0 10px;">🎯 ${t('yourIQResult')}: ${iq}</h3></div>` : ''}
            <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:20px;margin:0 0 30px;text-align:left;">
              <h3 style="color:#c53030;margin:0 0 15px;">🔑 ${t('loginCredentials')}</h3>
              <p style="color:#4a5568;margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
              <p style="color:#4a5568;margin:0;"><strong>${t('password')}:</strong> ${password}</p>
              <p style="color:#e53e3e;font-size:12px;margin:10px 0 0;">⚠️ ${t('securityWarning')}</p></div>
            <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0F172A,#6366F1);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;">
              ${t('accessDashboard')}</a></td></tr>
          <tr><td style="background:#f7fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#718096;font-size:12px;margin:0;">© ${new Date().getFullYear()} Brain Metric.</p></td></tr>
        </table></td></tr></table></body></html>`,
    })
    console.log('📧 [verify-pi] Email enviado a:', email)
  } catch (err: any) {
    console.error('❌ [verify-pi] Error enviando email:', err.message)
  }
}
