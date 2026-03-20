import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import Stripe from 'stripe'
import { sendEmail, emailTemplates } from '@/lib/email-service'
import { db } from '@/lib/database-postgres'

export const dynamic = 'force-dynamic'

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!connectionString) throw new Error('No database URL')
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 5 })
}

async function getStripe(): Promise<Stripe> {
  const config = await db.getAllConfig()
  const mode = config.payment_mode || process.env.STRIPE_MODE || 'live'
  const secretKey = mode === 'live'
    ? (config.stripe_live_secret_key || process.env.STRIPE_SECRET_KEY || '')
    : (config.stripe_test_secret_key || process.env.STRIPE_SECRET_KEY || '')
  return new Stripe(secretKey, { apiVersion: '2024-04-10' as any })
}

/**
 * Endpoint unificado para el agente de IA de n8n.
 * Seguridad: requiere N8N_API_KEY en header x-api-key
 *
 * Acciones:
 * - lookup:  busca usuario por email, devuelve datos de suscripción
 * - refund:  crea reembolso en Stripe por payment_intent o charge
 * - cancel:  cancela suscripción en Stripe + BD + email
 */
export async function POST(request: NextRequest) {
  const pool = getPool()

  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, email, transaction_id, amount } = await request.json()

    if (!action || !email) {
      return NextResponse.json({ error: 'action y email requeridos' }, { status: 400 })
    }

    // --- REFUND ---
    if (action === 'refund') {
      try {
        const stripe = await getStripe()
        const amountCents = amount ? Math.round(amount * 100) : undefined

        const INITIAL_PAYMENT_CENTS = 50 // 0,50€ — nunca reembolsable

        let chargeId: string | undefined
        let chargeAmount: number | undefined

        if (transaction_id && transaction_id.startsWith('pi_')) {
          const pi = await stripe.paymentIntents.retrieve(transaction_id)
          chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id
          chargeAmount = pi.amount
        } else if (transaction_id && transaction_id.startsWith('ch_')) {
          const ch = await stripe.charges.retrieve(transaction_id)
          chargeId = transaction_id
          chargeAmount = ch.amount
        } else {
          // Sin transaction_id — buscar el último cargo de suscripción (> 0,50€) por email
          const customers = await stripe.customers.list({ email, limit: 5 })
          for (const customer of customers.data) {
            const charges = await stripe.charges.list({ customer: customer.id, limit: 10 })
            const paid = charges.data.find(c => c.paid && !c.refunded && c.amount > INITIAL_PAYMENT_CENTS)
            if (paid) { chargeId = paid.id; chargeAmount = paid.amount; break }
          }
          if (!chargeId) {
            const pis = await stripe.paymentIntents.list({ limit: 100 })
            const piMatch = pis.data.find(p =>
              p.metadata?.email?.toLowerCase() === email.toLowerCase() &&
              p.status === 'succeeded' &&
              p.amount > INITIAL_PAYMENT_CENTS
            )
            if (piMatch) {
              chargeId = typeof piMatch.latest_charge === 'string'
                ? piMatch.latest_charge
                : (piMatch.latest_charge as any)?.id
              chargeAmount = piMatch.amount
            }
          }
        }

        if (!chargeId) {
          return NextResponse.json({ success: false, error: `No se encontró ningún cargo de suscripción para ${email}` })
        }

        // Bloquear reembolso del pago inicial de 0,50€
        if (chargeAmount !== undefined && chargeAmount <= INITIAL_PAYMENT_CENTS) {
          console.warn(`⛔ [n8n-refund] Intento de reembolso del pago inicial (${chargeAmount / 100}€) bloqueado para ${email}`)
          return NextResponse.json({
            success: false,
            error: 'El pago inicial de 0,50€ no es reembolsable según la política de Brain Metric',
            blocked: true,
          })
        }

        const refund = await stripe.refunds.create({
          charge: chargeId,
          ...(amountCents && { amount: amountCents }),
        })

        console.log(`✅ [n8n-refund] Reembolso creado: ${refund.id} para ${email}`)
        return NextResponse.json({
          success: true,
          refund_id: refund.id,
          amount_refunded: (refund.amount / 100).toFixed(2),
          status: refund.status,
        })
      } catch (err: any) {
        console.error('❌ [n8n-refund] Error Stripe:', err.message)
        return NextResponse.json({ success: false, error: err.message })
      }
    }

    // --- LOOKUP ---
    if (action === 'lookup') {
      const result = await pool.query(
        `SELECT id, email, user_name, subscription_status, subscription_id,
                trial_end_date, access_until, created_at
         FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ found: false, email })
      }

      const user = result.rows[0]
      return NextResponse.json({
        found: true,
        email: user.email,
        user_name: user.user_name,
        subscription_status: user.subscription_status,
        has_card_token: !!user.subscription_id,
        trial_end_date: user.trial_end_date,
        access_until: user.access_until,
        created_at: user.created_at,
        has_active_subscription: user.subscription_status === 'active' || user.subscription_status === 'trial',
      })
    }

    // --- CANCEL ---
    if (action === 'cancel') {
      const result = await pool.query(
        `SELECT id, email, user_name, subscription_status, subscription_id, access_until, trial_end_date
         FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Usuario no encontrado' })
      }

      const user = result.rows[0]

      if (user.subscription_status !== 'active' && user.subscription_status !== 'trial') {
        return NextResponse.json({
          success: false,
          error: 'No hay suscripción activa',
          current_status: user.subscription_status,
        })
      }

      const accessUntil = user.access_until || user.trial_end_date || new Date().toISOString()

      // Cancelar suscripción en Stripe antes de borrarla de la BD
      if (user.subscription_id) {
        try {
          const stripe = await getStripe()
          await stripe.subscriptions.cancel(user.subscription_id)
          console.log(`✅ [n8n-cancel] Suscripción Stripe cancelada: ${user.subscription_id}`)
        } catch (stripeErr: any) {
          console.warn(`⚠️ [n8n-cancel] No se pudo cancelar en Stripe (${user.subscription_id}): ${stripeErr.message}`)
        }
      }

      await pool.query(
        `UPDATE users SET subscription_status = 'cancelled', subscription_id = NULL, updated_at = NOW() WHERE id = $1`,
        [user.id]
      )

      try {
        const userName = user.user_name || email.split('@')[0]
        const accessDate = new Date(accessUntil).toLocaleDateString('es-ES', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })
        const cancelEmail = emailTemplates.subscriptionCancelled(email, userName, accessDate, 'es')
        await sendEmail(cancelEmail)
      } catch (e: any) {
        console.error('⚠️ [n8n-cancel] Error enviando email:', e.message)
      }

      return NextResponse.json({
        success: true,
        message: 'Suscripción cancelada',
        access_until: accessUntil,
      })
    }

    return NextResponse.json({ error: 'Acción no válida. Usa: lookup, refund, cancel' }, { status: 400 })

  } catch (error: any) {
    console.error('❌ [n8n-agent] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await pool.end().catch(() => {})
  }
}
