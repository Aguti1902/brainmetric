/**
 * Script para crear todos los productos y precios en Stripe.
 * Ejecutar: node scripts/setup-stripe-products.js
 * 
 * Crea:
 *  - Brain Metric Premium (Mensual) - 9.99€/mes
 *  - Brain Metric Premium (Quincenal) - 5.99€/15 días
 *  - Acceso Inicial - 0.50€ (pago único para desbloquear resultados)
 */

require('dotenv').config({ path: '.env.local' })
const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
})

async function createProducts() {
  console.log('🚀 Creando productos en Stripe...\n')
  console.log(`🔑 Modo: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? '🟢 LIVE' : '🟡 TEST'}\n`)

  // ─────────────────────────────────────────
  // 1. PLAN MENSUAL — 9.99€/mes
  // ─────────────────────────────────────────
  console.log('📦 Creando plan mensual...')
  const monthlyProduct = await stripe.products.create({
    name: 'Brain Metric Premium — Mensual',
    description: 'Acceso completo a todos los tests, análisis detallado, certificados y comparativas. Facturación mensual.',
    metadata: { plan: 'monthly' },
  })

  const monthlyPrice = await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 999, // 9.99€ en céntimos
    currency: 'eur',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    nickname: 'Mensual - 9.99€/mes',
    metadata: { plan: 'monthly' },
  })

  console.log(`  ✅ Producto: ${monthlyProduct.id}`)
  console.log(`  ✅ Price ID mensual: ${monthlyPrice.id}\n`)

  // ─────────────────────────────────────────
  // 2. PLAN QUINCENAL — 5.99€/15 días
  // ─────────────────────────────────────────
  console.log('📦 Creando plan quincenal...')
  const biweeklyProduct = await stripe.products.create({
    name: 'Brain Metric Premium — Quincenal',
    description: 'Acceso completo a todos los tests, análisis detallado, certificados y comparativas. Facturación cada 15 días.',
    metadata: { plan: 'biweekly' },
  })

  const biweeklyPrice = await stripe.prices.create({
    product: biweeklyProduct.id,
    unit_amount: 599, // 5.99€ en céntimos
    currency: 'eur',
    recurring: {
      interval: 'week',
      interval_count: 2, // cada 2 semanas ≈ quincenal
    },
    nickname: 'Quincenal - 5.99€/15 días',
    metadata: { plan: 'biweekly' },
  })

  console.log(`  ✅ Producto: ${biweeklyProduct.id}`)
  console.log(`  ✅ Price ID quincenal: ${biweeklyPrice.id}\n`)

  // ─────────────────────────────────────────
  // 3. ACCESO INICIAL — 0.50€ (pago único)
  // ─────────────────────────────────────────
  console.log('📦 Creando pago de acceso inicial (0.50€)...')
  const setupProduct = await stripe.products.create({
    name: 'Brain Metric — Acceso Inicial',
    description: 'Pago único para desbloquear tu resultado del test. Incluye 2 días de trial Premium.',
    metadata: { plan: 'setup_fee' },
  })

  const setupFeePrice = await stripe.prices.create({
    product: setupProduct.id,
    unit_amount: 50, // 0.50€ en céntimos
    currency: 'eur',
    metadata: { plan: 'setup_fee' },
    nickname: 'Acceso Inicial - 0.50€',
  })

  console.log(`  ✅ Producto: ${setupProduct.id}`)
  console.log(`  ✅ Price ID setup fee: ${setupFeePrice.id}\n`)

  // ─────────────────────────────────────────
  // RESUMEN FINAL
  // ─────────────────────────────────────────
  console.log('═══════════════════════════════════════════════')
  console.log('✅ PRODUCTOS CREADOS — Copia estas variables en Vercel:')
  console.log('═══════════════════════════════════════════════\n')
  console.log(`STRIPE_PRICE_MONTHLY=${monthlyPrice.id}`)
  console.log(`STRIPE_PRICE_BIWEEKLY=${biweeklyPrice.id}`)
  console.log(`STRIPE_SETUP_FEE_PRICE=${setupFeePrice.id}`)
  console.log('\n═══════════════════════════════════════════════')
  console.log('💡 También añade en tu .env.local estas 3 variables')
  console.log('═══════════════════════════════════════════════\n')
}

createProducts().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
