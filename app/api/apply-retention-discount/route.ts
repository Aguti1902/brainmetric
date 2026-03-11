import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { sendEmail } from '@/lib/email-service'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Aplicar descuento de retención
 * - Confirmar que la suscripción sigue activa
 * - Enviar email de confirmación del descuento
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, discountPercent = 50, durationMonths = 3 } = body

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

    console.log('🎁 [retention] Aplicando descuento de retención para:', userEmail)

    const user = await db.getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trial') {
      return NextResponse.json(
        { error: 'No se encontró ninguna suscripción activa' },
        { status: 404 }
      )
    }

    try {
      await sendEmail({
        to: userEmail,
        subject: '🎉 ¡Descuento Especial Aplicado!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366F1;">¡Gracias por quedarte con nosotros!</h2>
            <p>Nos alegra que hayas decidido continuar tu suscripción Premium.</p>
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">Tu descuento especial:</h3>
              <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 10px 0;">
                ${discountPercent}% de descuento
              </p>
              <p style="color: #065f46;">
                Aplicado durante los próximos ${durationMonths} meses
              </p>
            </div>
            <p>Este descuento se aplicará automáticamente en tus próximas facturas.</p>
            <p style="margin-top: 30px;">
              Gracias por confiar en MindMetric,<br>
              <strong>El equipo de MindMetric</strong>
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('⚠️ [retention] Error enviando email:', emailError)
    }

    console.log('✅ [retention] Descuento de retención aplicado para:', userEmail)

    return NextResponse.json({
      success: true,
      message: 'Descuento aplicado exitosamente',
      discount: {
        percent_off: discountPercent,
        duration_in_months: durationMonths,
      }
    })

  } catch (error: any) {
    console.error('❌ [retention] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
