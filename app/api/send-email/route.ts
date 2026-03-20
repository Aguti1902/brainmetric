import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email-service'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, userName, lang, ...data } = body

    if (!type || !email) {
      return NextResponse.json(
        { error: 'Tipo y email requeridos' },
        { status: 400 }
      )
    }

    // Determinar qué template usar
    let emailData: any

    switch (type) {
      case 'testCompleted':
        if (!data.estimatedIQ) {
          return NextResponse.json(
            { error: 'estimatedIQ requerido' },
            { status: 400 }
          )
        }
        emailData = emailTemplates.testCompleted(email, userName || 'Usuario', data.estimatedIQ, lang || 'en')
        break

      case 'checkoutAbandoned':
        emailData = emailTemplates.checkoutAbandoned(email, userName || 'Usuario', lang || 'en')
        break

      case 'paymentSuccess':
        if (!data.iq) {
          return NextResponse.json(
            { error: 'iq requerido' },
            { status: 400 }
          )
        }
        emailData = emailTemplates.paymentSuccess(email, userName || 'Usuario', data.iq, lang || 'en')
        break

      case 'subscriptionActivated':
        emailData = emailTemplates.subscriptionActivated(email, userName || 'Usuario', lang || 'en')
        break

      case 'monthlyPaymentSuccess':
        if (!data.amount) {
          return NextResponse.json(
            { error: 'amount requerido' },
            { status: 400 }
          )
        }
        emailData = emailTemplates.monthlyPaymentSuccess(email, userName || 'Usuario', data.amount, lang || 'en')
        break

      case 'paymentFailed':
        if (!data.attempt) {
          return NextResponse.json(
            { error: 'attempt requerido' },
            { status: 400 }
          )
        }
        emailData = emailTemplates.paymentFailed(email, userName || 'Usuario', data.attempt, lang || 'en')
        break

      case 'subscriptionCancelled':
        if (!data.accessUntil) {
          return NextResponse.json(
            { error: 'accessUntil requerido' },
            { status: 400 }
          )
        }
        emailData = emailTemplates.subscriptionCancelled(email, userName || 'Usuario', data.accessUntil, lang || 'en')
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de email no válido' },
          { status: 400 }
        )
    }

    // Enviar email
    const result = await sendEmail(emailData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email enviado correctamente',
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Error enviando email' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Error en send-email:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

