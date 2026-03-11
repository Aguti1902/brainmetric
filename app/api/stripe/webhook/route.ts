import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/database-postgres'
import { sendEmail } from '@/lib/email-service'
import { getEmailTranslation } from '@/lib/email-translations'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// Necesario para que Stripe pueda leer el body raw
export const config = {
  api: { bodyParser: false },
}

async function getStripeWithSecret(): Promise<{ stripe: Stripe; webhookSecret: string }> {
  const dbConfig = await db.getAllConfig()
  const mode = dbConfig.payment_mode || 'test'

  const secretKey = mode === 'live'
    ? dbConfig.stripe_live_secret_key
    : dbConfig.stripe_test_secret_key

  const webhookSecret = mode === 'live'
    ? dbConfig.stripe_live_webhook_secret
    : dbConfig.stripe_test_webhook_secret

  if (!secretKey) throw new Error(`Clave secreta de Stripe no configurada para modo "${mode}"`)
  if (!webhookSecret) throw new Error(`Webhook secret de Stripe no configurado para modo "${mode}"`)

  return {
    stripe: new Stripe(secretKey, { apiVersion: '2024-04-10' as any }),
    webhookSecret,
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
    // Actualizar usuario existente con datos de suscripción
    await db.updateUser(existingUser.id, {
      subscriptionStatus: 'trial',
      subscriptionId: stripeSubscriptionId,
    })
    console.log('✅ [webhook] Usuario existente actualizado:', email)
    return { user: existingUser, isNew: false, password: null }
  }

  // Crear nuevo usuario
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

  try {
    const { stripe, webhookSecret } = await getStripeWithSecret()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
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

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const email = (subscription.metadata?.email as string) || ''

        if (email) {
          const user = await db.getUserByEmail(email)
          if (user) {
            await db.updateUser(user.id, {
              subscriptionStatus: 'cancelled',
              subscriptionId: null as any,
            })
            console.log('✅ [webhook] Suscripción cancelada para:', email)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        if (!subscriptionId) break

        // Extender el acceso 30 días más
        const accessUntil = new Date()
        accessUntil.setDate(accessUntil.getDate() + 30)

        // Buscar usuario por subscriptionId en la BD
        const dbConfig = await db.getAllConfig()
        const mode = dbConfig.payment_mode || 'test'
        const secretKey = mode === 'live' ? dbConfig.stripe_live_secret_key : dbConfig.stripe_test_secret_key
        if (!secretKey) break

        const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' as any })
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const customerEmail = (subscription.metadata?.email as string) || ''

        if (customerEmail) {
          const user = await db.getUserByEmail(customerEmail)
          if (user) {
            await db.updateUser(user.id, {
              subscriptionStatus: 'active',
              accessUntil: accessUntil.toISOString(),
            })
            console.log('✅ [webhook] Pago de renovación procesado para:', customerEmail)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn('⚠️ [webhook] Pago fallido para invoice:', invoice.id)
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
