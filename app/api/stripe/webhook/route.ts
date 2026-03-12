import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'
import bcrypt from 'bcryptjs'

// Envía email en background sin bloquear la respuesta del webhook
function sendEmailSafe(emailData: Parameters<typeof sendEmail>[0]) {
  sendEmail(emailData).catch(err => console.error('❌ [webhook] Error enviando email:', err.message))
}

export const dynamic = 'force-dynamic'

async function getStripeWithSecret(): Promise<{ stripe: Stripe; webhookSecret: string }> {
  const dbConfig = await db.getAllConfig()
  const mode = dbConfig.payment_mode || process.env.STRIPE_MODE || 'test'

  const secretKey = mode === 'live'
    ? (dbConfig.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (dbConfig.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')

  const webhookSecret = mode === 'live'
    ? (dbConfig.stripe_live_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '')
    : (dbConfig.stripe_test_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || '')

  if (!secretKey) throw new Error(`Clave secreta de Stripe no configurada para modo "${mode}"`)
  if (!webhookSecret) throw new Error(`Webhook secret de Stripe no configurado para modo "${mode}"`)

  return {
    stripe: new Stripe(secretKey, { apiVersion: '2024-04-10' as any }),
    webhookSecret,
  }
}

interface CustomerInfo {
  email: string
  lang: string
  userName: string
}

async function getCustomerInfo(stripe: Stripe, customerId: string): Promise<CustomerInfo> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if ((customer as Stripe.DeletedCustomer).deleted) return { email: '', lang: 'es', userName: '' }
    const c = customer as Stripe.Customer
    return {
      email: c.email || '',
      lang: (c.metadata?.lang as string) || 'es',
      userName: (c.metadata?.userName as string) || '',
    }
  } catch {
    return { email: '', lang: 'es', userName: '' }
  }
}

async function createOrUpdateUser(
  email: string,
  userName: string,
  iq: number,
  lang: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
) {
  const existingUser = await db.getUserByEmail(email)

  if (existingUser) {
    await db.updateUser(existingUser.id, {
      subscriptionStatus: 'trial',
      subscriptionId: stripeSubscriptionId,
    })
    console.log('✅ [webhook] Usuario existente actualizado:', email)
    return { user: existingUser, isNew: false, password: null }
  }

  const password = Math.random().toString(36).slice(-12)
  const hashedPassword = await bcrypt.hash(password, 10)

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 2)

  const user = await db.createUser({
    email,
    password: hashedPassword,
    userName: userName || email.split('@')[0],
    iq: iq || 0,
    subscriptionStatus: 'trial',
    subscriptionId: stripeSubscriptionId,
    trialEndDate: trialEndDate.toISOString(),
  })

  console.log('✅ [webhook] Nuevo usuario creado:', email)
  return { user, isNew: true, password }
}

async function sendWelcomeEmail(
  email: string,
  userName: string,
  iq: number,
  lang: string,
  password: string
) {
  const t = (key: any) => getEmailTranslation(lang || 'es', key)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://brainmetric.io'
  const loginUrl = `${appUrl}/${lang || 'es'}/cuenta`

  await sendEmail({
    to: email,
    subject: t('welcomeSubject'),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table role="presentation" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0F172A 0%,#6366F1 100%);padding:40px 30px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Brain Metric</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 30px;text-align:center;">
                    <h2 style="color:#0F172A;margin:0 0 20px 0;font-size:24px;font-weight:600;">
                      ${t('welcome')} Brain Metric!
                    </h2>
                    <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 20px 0;">
                      ${t('hello')} ${userName || t('user')},
                    </p>
                    <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px 0;">
                      ${t('congratulations')}
                    </p>
                    ${iq ? `
                    <div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:0 0 30px 0;text-align:left;">
                      <h3 style="color:#0F172A;margin:0 0 10px 0;font-size:18px;">🎯 ${t('yourIQResult')}: ${iq}</h3>
                      <p style="color:#4a5568;font-size:14px;margin:0;">${t('completedTest')}</p>
                    </div>` : ''}
                    <div style="background:#fff5f5;border:1px solid #fed7d7;border-radius:8px;padding:20px;margin:0 0 30px 0;text-align:left;">
                      <h3 style="color:#c53030;margin:0 0 15px 0;font-size:18px;">🔑 ${t('loginCredentials')}</h3>
                      <p style="color:#4a5568;font-size:14px;margin:0 0 8px 0;"><strong>Email:</strong> ${email}</p>
                      <p style="color:#4a5568;font-size:14px;margin:0;"><strong>${t('password')}:</strong> ${password}</p>
                      <p style="color:#e53e3e;font-size:12px;margin:10px 0 0 0;">⚠️ ${t('securityWarning')}</p>
                    </div>
                    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0F172A 0%,#6366F1 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                      ${t('accessDashboard')}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f7fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="color:#718096;font-size:12px;margin:0;">
                      © ${new Date().getFullYear()} Brain Metric. ${t('allRightsReserved')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No hay firma de Stripe' }, { status: 400 })
  }

  let event: Stripe.Event
  let stripe: Stripe

  try {
    const result = await getStripeWithSecret()
    stripe = result.stripe
    event = stripe.webhooks.constructEvent(body, sig, result.webhookSecret)
  } catch (err: any) {
    console.error('❌ [webhook] Error verificando firma:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.log(`📩 [webhook] Evento recibido: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status !== 'paid' && session.mode !== 'subscription') break

        const email = session.customer_email || (session.metadata?.email as string)
        const userName = session.metadata?.userName || ''
        const iq = parseInt(session.metadata?.userIQ || '0')
        const lang = session.metadata?.lang || 'es'
        const stripeCustomerId = session.customer as string
        const stripeSubscriptionId = session.subscription as string

        if (!email) {
          console.error('❌ [webhook] No hay email en la sesión:', session.id)
          break
        }

        const { user, isNew, password } = await createOrUpdateUser(
          email, userName, iq, lang,
          stripeCustomerId, stripeSubscriptionId
        )

        if (isNew && password) {
          await sendWelcomeEmail(email, userName, iq, lang, password)
          console.log('📧 [webhook] Email de bienvenida enviado a:', email)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const { email, lang, userName } = await getCustomerInfo(stripe, subscription.customer as string)

        if (!email) {
          console.warn('⚠️ [webhook] No se pudo obtener info para suscripción:', subscription.id)
          break
        }

        if (subscription.status === 'active') {
          const wasTrialing = (event.data.previous_attributes as any)?.status === 'trialing'
          const accessUntil = new Date()
          accessUntil.setDate(accessUntil.getDate() + 30)
          const user = await db.getUserByEmail(email)
          if (user) {
            await db.updateUser(user.id, {
              subscriptionStatus: 'active',
              accessUntil: accessUntil.toISOString(),
            })
            console.log('✅ [webhook] Suscripción activada para:', email)

            // Email: suscripción activada (solo cuando pasa de trial → active)
            if (wasTrialing) {
              const name = userName || user.userName
              sendEmailSafe(emailTemplates.subscriptionActivated(email, name, lang))
              console.log('📧 [webhook] Email "suscripción activada" enviado a:', email)
            }
          }
        }

        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          const user = await db.getUserByEmail(email)
          if (user) {
            await db.updateUser(user.id, {
              subscriptionStatus: 'cancelled',
              subscriptionId: null as any,
            })
            console.log('✅ [webhook] Suscripción cancelada para:', email)
          }
        }

        if (subscription.status === 'past_due') {
          const user = await db.getUserByEmail(email)
          if (user) {
            await db.updateUser(user.id, { subscriptionStatus: 'expired' })
            console.log('⚠️ [webhook] Suscripción en mora para:', email)
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { email, lang, userName } = await getCustomerInfo(stripe, subscription.customer as string)

        if (!email) {
          console.warn('⚠️ [webhook] No se pudo obtener info para suscripción eliminada:', subscription.id)
          break
        }

        const user = await db.getUserByEmail(email)
        if (user) {
          // Calcular hasta cuándo tenía acceso
          const accessDate = user.accessUntil
            ? new Date(user.accessUntil).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

          await db.updateUser(user.id, {
            subscriptionStatus: 'cancelled',
            subscriptionId: null as any,
          })
          console.log('✅ [webhook] Suscripción eliminada para:', email)

          // Email: suscripción cancelada
          const name = userName || user.userName
          sendEmailSafe(emailTemplates.subscriptionCancelled(email, name, accessDate, lang))
          console.log('📧 [webhook] Email "suscripción cancelada" enviado a:', email)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const billingReason = (invoice as any).billing_reason

        // subscription_create = primer cobro al salir del trial → ya gestionado en subscription.updated
        if (billingReason === 'subscription_create') break

        const customerEmail = invoice.customer_email || ''
        if (!customerEmail) break

        const accessUntil = new Date()
        accessUntil.setDate(accessUntil.getDate() + 30)

        const user = await db.getUserByEmail(customerEmail)
        if (user) {
          await db.updateUser(user.id, {
            subscriptionStatus: 'active',
            accessUntil: accessUntil.toISOString(),
          })
          console.log('✅ [webhook] Renovación procesada para:', customerEmail)

          // Email: pago mensual recibido (solo renovaciones, no trial)
          if (billingReason === 'subscription_cycle') {
            const { lang: customerLang } = await getCustomerInfo(stripe, invoice.customer as string)
            const amountPaid = (invoice.amount_paid || 0) / 100
            sendEmailSafe(emailTemplates.monthlyPaymentSuccess(customerEmail, user.userName, amountPaid, customerLang))
            console.log('📧 [webhook] Email "pago mensual" enviado a:', customerEmail)
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent

        // Solo procesar si es el pago de acceso inicial (tiene priceId en metadata)
        const piEmail    = pi.metadata?.email    || ''
        const priceId    = pi.metadata?.priceId  || ''
        const trialDaysS = pi.metadata?.trialDays || '2'
        const piUserName = pi.metadata?.userName  || ''
        const piLang     = pi.metadata?.lang      || 'es'
        const piIQ       = parseInt(pi.metadata?.userIQ || '0')

        if (!piEmail || !priceId) {
          console.log('ℹ️ [webhook] payment_intent sin metadata de suscripción, ignorando')
          break
        }

        console.log(`💳 [webhook] payment_intent.succeeded | email: ${piEmail}`)

        // Crear suscripción con el método de pago guardado
        const customerId = pi.customer as string
        const paymentMethodId = typeof pi.payment_method === 'string'
          ? pi.payment_method
          : pi.payment_method?.id || ''

        let subscriptionId = ''

        if (customerId && paymentMethodId && priceId) {
          try {
            // Establecer método de pago por defecto
            await stripe.customers.update(customerId, {
              invoice_settings: { default_payment_method: paymentMethodId },
            })

            const subscription = await stripe.subscriptions.create({
              customer: customerId,
              items: [{ price: priceId }],
              default_payment_method: paymentMethodId,
              trial_period_days: parseInt(trialDaysS),
              trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
              metadata: pi.metadata,
            })
            subscriptionId = subscription.id
            console.log(`✅ [webhook] Suscripción creada: ${subscriptionId}`)
          } catch (subErr: any) {
            console.error('❌ [webhook] Error creando suscripción:', subErr.message)
          }
        }

        // Verificar si el usuario ya fue creado por verify-payment-intent
        const existingUserCheck = await db.getUserByEmail(piEmail)
        if (existingUserCheck?.subscriptionId) {
          console.log('ℹ️ [webhook] Usuario ya tiene suscripción, omitiendo creación duplicada:', piEmail)
          break
        }

        const { user, isNew, password } = await createOrUpdateUser(
          piEmail, piUserName, piIQ, piLang,
          customerId, subscriptionId
        )

        if (isNew && password) {
          await sendWelcomeEmail(piEmail, piUserName, piIQ, piLang, password)
          console.log('📧 [webhook] Email de bienvenida enviado a:', piEmail)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerEmail = invoice.customer_email || ''
        const attemptCount = (invoice as any).attempt_count || 1

        console.warn(`⚠️ [webhook] Pago fallido para: ${customerEmail} | intent: ${attemptCount} | invoice: ${invoice.id}`)

        if (customerEmail) {
          const user = await db.getUserByEmail(customerEmail)
          if (user) {
            await db.updateUser(user.id, { subscriptionStatus: 'expired' })
            console.log('⚠️ [webhook] Usuario marcado como pago pendiente:', customerEmail)

            // Email: pago fallido
            const { lang } = await getCustomerInfo(stripe, invoice.customer as string)
            sendEmailSafe(emailTemplates.paymentFailed(customerEmail, user.userName, attemptCount, lang))
            console.log('📧 [webhook] Email "pago fallido" enviado a:', customerEmail)
          }
        }
        break
      }

      default:
        console.log(`ℹ️ [webhook] Evento no manejado: ${event.type}`)
    }
  } catch (err: any) {
    console.error('❌ [webhook] Error procesando evento:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
