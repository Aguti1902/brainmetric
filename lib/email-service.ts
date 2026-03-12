import sgMail from '@sendgrid/mail'
import { getEmailTranslation } from './email-translations'

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const FROM_EMAIL = 'no-reply@brainmetric.io'
const FROM_NAME = 'Brain Metric'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY no configurado - Email no enviado')
      console.log('📧 Email que se habría enviado:', options)
      return { success: false, error: 'SendGrid no configurado' }
    }

    const msg = {
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    }

    await sgMail.send(msg)
    console.log(`✅ Email enviado a ${options.to}: ${options.subject}`)
    return { success: true }
  } catch (error: any) {
    // Extraer el mensaje detallado de SendGrid si existe
    const detail = error?.response?.body?.errors?.[0]?.message
      || error?.response?.body
      || error?.message
      || String(error)
    console.error('❌ Error enviando email:', detail)
    return { success: false, error: String(detail) }
  }
}

// Templates de emails
export const emailTemplates = {
  // 1. Test Completado - Bienvenida + Resultado Estimado
  testCompleted: (email: string, userName: string, estimatedIQ: number, lang: string) => {
    const t = (key: any) => getEmailTranslation(lang, key)
    return {
    to: email,
    subject: `${t('welcome')} Brain Metric! ${t('estimatedIQ')} ${estimatedIQ} 🎯`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Test Completado' : 'Test Completed'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 40px; width: auto; margin: 0 auto; display: block;" />
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                      ${t('welcome')}, ${userName}!
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
                      ${t('completedTest')}
                    </p>
                    
                    <!-- IQ Score -->
                    <div style="background: linear-gradient(135deg, #6366F1 0%, #0F172A 100%); border-radius: 16px; padding: 30px; margin: 30px 0; color: #ffffff;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">
                        ${t('estimatedIQ')}
                      </p>
                      <p style="margin: 0; font-size: 72px; font-weight: 700; line-height: 1;">
                        ${estimatedIQ}
                      </p>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                      ${t('estimatedResult')}
                    </p>
                    
                    <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #856404; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                        ${t('specialOffer')}
                      </p>
                      <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                        ${t('specialOfferText')}
                      </p>
                    </div>
                    
                    <a href="https://brainmetric.io/${lang}/checkout" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
                      ${t('viewCompleteResult')}
                    </a>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${t('haveQuestions')}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }},

  // 2. Checkout abandonado - Recordatorio
  checkoutAbandoned: (email: string, userName: string, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? '¡Tu resultado te está esperando! 🎁'
      : 'Your result is waiting for you! 🎁',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Tu Resultado te Espera' : 'Your Result Awaits'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      🎁 ${lang === 'es' ? '¡Tu Resultado te Espera!' : 'Your Result Awaits!'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                      ${lang === 'es' ? 'Hola' : 'Hello'}, ${userName} 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${lang === 'es'
                        ? 'Notamos que iniciaste el proceso de pago pero no lo completaste. ¡Tu resultado exacto está a solo 0,50€ de distancia!'
                        : 'We noticed you started the payment process but didn\'t complete it. Your exact result is just €1.00 away!'}
                    </p>
                    
                    <div style="background-color: #e6f5f5; border-left: 4px solid #6366F1; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <h3 style="color: #6366F1; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
                        ${lang === 'es' ? '¿Qué obtienes por 0,50€?' : 'What do you get for €1.00?'}
                      </h3>
                      <ul style="color: #2d3748; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>${lang === 'es' ? 'Tu CI exacto' : 'Your exact IQ'}</li>
                        <li>${lang === 'es' ? 'Análisis detallado personalizado' : 'Detailed personalized analysis'}</li>
                        <li>${lang === 'es' ? 'Gráficos comparativos' : 'Comparative charts'}</li>
                        <li>${lang === 'es' ? 'Certificado oficial descargable' : 'Official downloadable certificate'}</li>
                        <li>${lang === 'es' ? '2 días de prueba premium GRATIS' : '2 days FREE premium trial'}</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #856404; font-size: 16px; margin: 0; font-weight: 600; text-align: center;">
                        ⚡ ${lang === 'es' ? 'Oferta limitada' : 'Limited offer'}
                      </p>
                      <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0; text-align: center; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Después del trial, solo 9,99€/mes. Cancela cuando quieras.'
                          : 'After the trial, only €9.99/month. Cancel anytime.'}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/checkout" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? 'Completar Pago Ahora' : 'Complete Payment Now'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Necesitas ayuda? Responde a este email y te ayudaremos encantados.'
                        : 'Need help? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 3. Pago exitoso
  paymentSuccess: (email: string, userName: string, iq: number, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? `¡Pago confirmado! Tu CI: ${iq} 🎉`
      : `Payment confirmed! Your IQ: ${iq} 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Pago Confirmado' : 'Payment Confirmed'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      🎉 ${lang === 'es' ? '¡Pago Confirmado!' : 'Payment Confirmed!'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                      ${lang === 'es' ? '¡Gracias' : 'Thank you'}, ${userName}!
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
                      ${lang === 'es'
                        ? 'Tu pago de 0,50€ ha sido procesado correctamente.'
                        : 'Your payment of €1.00 has been processed successfully.'}
                    </p>
                    
                    <!-- IQ Score -->
                    <div style="background: linear-gradient(135deg, #6366F1 0%, #0F172A 100%); border-radius: 16px; padding: 30px; margin: 30px 0; color: #ffffff;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">
                        ${lang === 'es' ? 'Tu Coeficiente Intelectual' : 'Your Intelligence Quotient'}
                      </p>
                      <p style="margin: 0; font-size: 72px; font-weight: 700; line-height: 1;">
                        ${iq}
                      </p>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                      ${lang === 'es'
                        ? 'Ya tienes acceso completo a tu análisis detallado, gráficos comparativos y certificado oficial.'
                        : 'You now have full access to your detailed analysis, comparative charts and official certificate.'}
                    </p>
                    
                    <div style="background-color: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #155724; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                        ✨ ${lang === 'es' ? '¡Bonus Incluido!' : 'Bonus Included!'}
                      </p>
                      <p style="color: #155724; font-size: 14px; margin: 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Tienes 2 días de prueba premium GRATIS. Accede a funciones avanzadas y análisis comparativos ilimitados.'
                          : 'You have 2 days FREE premium trial. Access advanced features and unlimited comparative analysis.'}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/resultado" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? 'Ver Mi Resultado Completo' : 'View My Complete Result'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Tienes preguntas? Responde a este email y te ayudaremos encantados.'
                        : 'Have questions? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 4. Trial iniciado
  trialStarted: (email: string, userName: string, trialEndDate: string, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? '¡Bienvenido a Premium! 🚀'
      : 'Welcome to Premium! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Premium Activado' : 'Premium Activated'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      🚀 ${lang === 'es' ? '¡Premium Activado!' : 'Premium Activated!'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                      ${lang === 'es' ? 'Hola' : 'Hello'}, ${userName}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${lang === 'es'
                        ? '¡Tu periodo de prueba premium de 2 días ha comenzado! Ahora tienes acceso a todas las funciones avanzadas.'
                        : 'Your 2-day premium trial period has started! You now have access to all advanced features.'}
                    </p>
                    
                    <div style="background-color: #e6f5f5; border-left: 4px solid #6366F1; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <h3 style="color: #6366F1; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        ✨ ${lang === 'es' ? '¿Qué puedes hacer ahora?' : 'What can you do now?'}
                      </h3>
                      <ul style="color: #2d3748; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>${lang === 'es' ? 'Tests ilimitados' : 'Unlimited tests'}</li>
                        <li>${lang === 'es' ? 'Análisis comparativos detallados' : 'Detailed comparative analysis'}</li>
                        <li>${lang === 'es' ? 'Seguimiento de progreso' : 'Progress tracking'}</li>
                        <li>${lang === 'es' ? 'Historial completo de resultados' : 'Complete results history'}</li>
                        <li>${lang === 'es' ? 'Exportación de datos' : 'Data export'}</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #856404; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                        ⏰ ${lang === 'es' ? 'Tu trial termina' : 'Your trial ends'}
                      </p>
                      <p style="color: #856404; font-size: 18px; margin: 0; font-weight: 700;">
                        ${trialEndDate}
                      </p>
                      <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Después se cobrará 9,99€/mes automáticamente. Puedes cancelar en cualquier momento antes de que termine el trial.'
                          : 'After that, €9.99/month will be charged automatically. You can cancel anytime before the trial ends.'}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/cuenta" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? 'Acceder a Mi Dashboard' : 'Access My Dashboard'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Necesitas ayuda? Responde a este email y te ayudaremos encantados.'
                        : 'Need help? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 5. Trial termina mañana
  trialEndingTomorrow: (email: string, userName: string, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? '⏰ Tu trial premium termina mañana'
      : '⏰ Your premium trial ends tomorrow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Trial Termina Mañana' : 'Trial Ends Tomorrow'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      ⏰ ${lang === 'es' ? 'Trial Termina Mañana' : 'Trial Ends Tomorrow'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                      ${lang === 'es' ? 'Hola' : 'Hello'}, ${userName} 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${lang === 'es'
                        ? 'Tu periodo de prueba premium termina MAÑANA. Si no cancelas antes, se cobrará automáticamente 9,99€/mes.'
                        : 'Your premium trial period ends TOMORROW. If you don\'t cancel before, €9.99/month will be charged automatically.'}
                    </p>
                    
                    <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #856404; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                        ${lang === 'es' ? '💳 Próximo cobro' : '💳 Next charge'}
                      </p>
                      <p style="color: #856404; font-size: 24px; margin: 0; font-weight: 700;">
                        9,99€
                      </p>
                      <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Se cobrará automáticamente mañana si no cancelas antes.'
                          : 'Will be charged automatically tomorrow if you don\'t cancel before.'}
                      </p>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                      ${lang === 'es'
                        ? '¿Quieres continuar con Premium? ¡Genial! No hagas nada y mañana tendrás acceso completo.'
                        : 'Do you want to continue with Premium? Great! Do nothing and tomorrow you\'ll have full access.'}
                    </p>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${lang === 'es'
                        ? '¿Prefieres cancelar? No hay problema, puedes hacerlo ahora mismo y seguirás teniendo acceso hasta que termine tu trial.'
                        : 'Do you prefer to cancel? No problem, you can do it right now and you\'ll still have access until your trial ends.'}
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/cuenta" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0;">
                        ${lang === 'es' ? 'Gestionar Suscripción' : 'Manage Subscription'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Tienes preguntas? Responde a este email y te ayudaremos encantados.'
                        : 'Have questions? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 6. Suscripción activada
  subscriptionActivated: (email: string, userName: string, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? '✅ Suscripción Premium Activada'
      : '✅ Premium Subscription Activated',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Suscripción Activada' : 'Subscription Activated'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      ✅ ${lang === 'es' ? '¡Suscripción Activada!' : 'Subscription Activated!'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">
                      ${lang === 'es' ? '¡Bienvenido a Premium!' : 'Welcome to Premium!'}
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin: 0 0 30px 0;">
                      ${lang === 'es'
                        ? 'Tu suscripción premium ha sido activada. ¡Disfruta de todas las funciones avanzadas!'
                        : 'Your premium subscription has been activated. Enjoy all advanced features!'}
                    </p>
                    
                    <div style="background-color: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #155724; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                        ✨ ${lang === 'es' ? 'Ahora tienes acceso a:' : 'You now have access to:'}
                      </p>
                      <ul style="color: #155724; margin: 0; padding-left: 20px; text-align: left; display: inline-block; line-height: 1.8;">
                        <li>${lang === 'es' ? 'Tests ilimitados' : 'Unlimited tests'}</li>
                        <li>${lang === 'es' ? 'Análisis comparativos' : 'Comparative analysis'}</li>
                        <li>${lang === 'es' ? 'Seguimiento de progreso' : 'Progress tracking'}</li>
                        <li>${lang === 'es' ? 'Historial completo' : 'Complete history'}</li>
                        <li>${lang === 'es' ? 'Exportación de datos' : 'Data export'}</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #e6f5f5; border-left: 4px solid #6366F1; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #6366F1; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>${lang === 'es' ? 'Próximo cobro:' : 'Next charge:'}</strong><br>
                        9,99€ ${lang === 'es' ? 'el próximo mes' : 'next month'}<br>
                        ${lang === 'es' ? 'Puedes cancelar en cualquier momento desde tu cuenta.' : 'You can cancel anytime from your account.'}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/cuenta" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? 'Acceder a Mi Dashboard' : 'Access My Dashboard'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Tienes preguntas? Responde a este email y te ayudaremos encantados.'
                        : 'Have questions? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 7. Pago mensual exitoso
  monthlyPaymentSuccess: (email: string, userName: string, amount: number, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? `✅ Pago recibido: ${amount}€`
      : `✅ Payment received: €${amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Pago Recibido' : 'Payment Received'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      ✅ ${lang === 'es' ? 'Pago Recibido' : 'Payment Received'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px; text-align: center;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                      ${lang === 'es' ? 'Hola' : 'Hello'}, ${userName}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      ${lang === 'es'
                        ? 'Hemos recibido tu pago mensual de Premium. ¡Gracias por confiar en nosotros!'
                        : 'We have received your monthly Premium payment. Thank you for trusting us!'}
                    </p>
                    
                    <div style="background-color: #e6f5f5; border-left: 4px solid #6366F1; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #6366F1; font-size: 14px; margin: 0 0 10px 0;">
                        ${lang === 'es' ? 'Monto pagado:' : 'Amount paid:'}
                      </p>
                      <p style="color: #6366F1; font-size: 32px; margin: 0; font-weight: 700;">
                        ${amount}€
                      </p>
                      <p style="color: #2d3748; font-size: 14px; margin: 10px 0 0 0;">
                        ${lang === 'es' ? 'Suscripción Premium - Mensual' : 'Premium Subscription - Monthly'}
                      </p>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                      ${lang === 'es'
                        ? 'Tu suscripción está activa y tienes acceso completo a todas las funciones premium.'
                        : 'Your subscription is active and you have full access to all premium features.'}
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/cuenta" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? 'Ver Mi Cuenta' : 'View My Account'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Tienes preguntas sobre tu facturación? Responde a este email y te ayudaremos encantados.'
                        : 'Have questions about your billing? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 8. Pago fallido
  paymentFailed: (email: string, userName: string, attempt: number, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? `⚠️ Problema con tu pago - Intento ${attempt}`
      : `⚠️ Payment Issue - Attempt ${attempt}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Problema con el Pago' : 'Payment Issue'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      ⚠️ ${lang === 'es' ? 'Problema con el Pago' : 'Payment Issue'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                      ${lang === 'es' ? 'Hola' : 'Hello'}, ${userName} 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${lang === 'es'
                        ? 'Lamentablemente, no pudimos procesar tu pago mensual de 9,99€. Esto puede deberse a fondos insuficientes, tarjeta vencida o límite excedido.'
                        : 'Unfortunately, we could not process your monthly payment of €9.99. This may be due to insufficient funds, expired card, or limit exceeded.'}
                    </p>
                    
                    ${attempt >= 3 ? `
                    <div style="background-color: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #991b1b; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                        ❌ ${lang === 'es' ? 'Suscripción Cancelada' : 'Subscription Cancelled'}
                      </p>
                      <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Después de 3 intentos fallidos, tu suscripción ha sido cancelada. Tu acceso premium terminará al final del periodo pagado.'
                          : 'After 3 failed attempts, your subscription has been cancelled. Your premium access will end at the end of the paid period.'}
                      </p>
                    </div>
                    ` : `
                    <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <p style="color: #92400e; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
                        ⏰ ${lang === 'es' ? 'Intento' : 'Attempt'} ${attempt} de 3
                      </p>
                      <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Intentaremos cobrar nuevamente en 3 días. Si falla 3 veces, tu suscripción será cancelada.'
                          : 'We will try to charge again in 3 days. If it fails 3 times, your subscription will be cancelled.'}
                      </p>
                    </div>
                    `}
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                      ${lang === 'es'
                        ? 'Para solucionar esto, actualiza tu método de pago en tu cuenta.'
                        : 'To fix this, update your payment method in your account.'}
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/cuenta" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? 'Actualizar Método de Pago' : 'Update Payment Method'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Necesitas ayuda? Responde a este email y te ayudaremos encantados.'
                        : 'Need help? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 9. Cancelación de suscripción
  subscriptionCancelled: (email: string, userName: string, accessUntil: string, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? '✅ Suscripción Cancelada'
      : '✅ Subscription Cancelled',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Suscripción Cancelada' : 'Subscription Cancelled'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      ✅ ${lang === 'es' ? 'Suscripción Cancelada' : 'Subscription Cancelled'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                      ${lang === 'es' ? 'Hola' : 'Hello'}, ${userName} 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${lang === 'es'
                        ? 'Tu solicitud de cancelación ha sido procesada. Lamentamos verte partir.'
                        : 'Your cancellation request has been processed. We\'re sorry to see you go.'}
                    </p>
                    
                    <div style="background-color: #e6f5f5; border-left: 4px solid #6366F1; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #6366F1; font-size: 14px; margin: 0 0 10px 0;">
                        ${lang === 'es' ? 'Acceso hasta:' : 'Access until:'}
                      </p>
                      <p style="color: #6366F1; font-size: 18px; margin: 0; font-weight: 700;">
                        ${accessUntil}
                      </p>
                      <p style="color: #2d3748; font-size: 14px; margin: 10px 0 0 0; line-height: 1.6;">
                        ${lang === 'es'
                          ? 'Tendrás acceso completo a todas las funciones premium hasta esta fecha.'
                          : 'You will have full access to all premium features until this date.'}
                      </p>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 20px 0;">
                      ${lang === 'es'
                        ? 'No se realizarán más cargos a tu tarjeta. Si cambias de opinión, puedes reactivar tu suscripción en cualquier momento.'
                        : 'No further charges will be made to your card. If you change your mind, you can reactivate your subscription anytime.'}
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/cuenta" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? 'Ver Mi Cuenta' : 'View My Account'}
                      </a>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Tienes comentarios sobre por qué cancelaste? Responde a este email y nos ayudará a mejorar.'
                        : 'Do you have feedback on why you cancelled? Reply to this email and it will help us improve.'}
                    </p>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0; font-weight: 600;">
                      ${lang === 'es'
                        ? '¡Esperamos verte de nuevo pronto! 👋'
                        : 'We hope to see you again soon! 👋'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // 10. Credenciales de acceso (después del pago)
  loginCredentials: (email: string, userName: string, password: string, iq: number, lang: string) => ({
    to: email,
    subject: lang === 'es'
      ? `🎉 ¡Bienvenido a Brain Metric! Tu CI: ${iq} - Acceso a tu cuenta`
      : `🎉 Welcome to Brain Metric! Your IQ: ${iq} - Account Access`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${lang === 'es' ? 'Credenciales de Acceso' : 'Login Credentials'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
                    <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height: 32px; width: auto; margin: 0 auto 20px auto; display: block;" />
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
                      🎉 ${lang === 'es' ? '¡Cuenta Creada!' : 'Account Created!'}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #0F172A; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                      ${lang === 'es' ? '¡Hola' : 'Hello'}, ${userName}! 👋
                    </h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      ${lang === 'es'
                        ? 'Tu cuenta en Brain Metric ha sido creada exitosamente. Aquí están tus credenciales de acceso:'
                        : 'Your Brain Metric account has been created successfully. Here are your login credentials:'}
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background-color: #f7fafc; border: 2px solid #6366F1; border-radius: 8px; padding: 20px; margin: 30px 0;">
                      <h3 style="color: #6366F1; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        🔑 ${lang === 'es' ? 'Credenciales de Acceso' : 'Login Credentials'}
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                            <strong style="color: #2d3748;">${lang === 'es' ? 'Email:' : 'Email:'}</strong>
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                            <code style="background-color: #edf2f7; padding: 4px 8px; border-radius: 4px; color: #2d3748; font-size: 14px;">${email}</code>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <strong style="color: #2d3748;">${lang === 'es' ? 'Contraseña:' : 'Password:'}</strong>
                          </td>
                          <td style="padding: 10px 0; text-align: right;">
                            <code style="background-color: #edf2f7; padding: 4px 8px; border-radius: 4px; color: #2d3748; font-size: 14px; font-weight: 600;">${password}</code>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- IQ Score -->
                    <div style="background: linear-gradient(135deg, #6366F1 0%, #0F172A 100%); border-radius: 16px; padding: 30px; margin: 30px 0; color: #ffffff; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">
                        ${lang === 'es' ? 'Tu Coeficiente Intelectual' : 'Your Intelligence Quotient'}
                      </p>
                      <p style="margin: 0; font-size: 72px; font-weight: 700; line-height: 1;">
                        ${iq}
                      </p>
                    </div>
                    
                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                      <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>⚠️ ${lang === 'es' ? 'Importante:' : 'Important:'}</strong><br>
                        ${lang === 'es'
                          ? 'Por tu seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión desde tu panel de cuenta.'
                          : 'For your security, we recommend changing your password after your first login from your account panel.'}
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://brainmetric.io/${lang}/login" style="display: inline-block; background: linear-gradient(135deg, #0F172A 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
                        ${lang === 'es' ? '🔓 Acceder a Mi Dashboard' : '🔓 Access My Dashboard'}
                      </a>
                    </div>
                    
                    <div style="background-color: #e6f5f5; border-left: 4px solid #6366F1; padding: 20px; margin: 30px 0; border-radius: 4px;">
                      <h3 style="color: #6366F1; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                        ✨ ${lang === 'es' ? '¿Qué puedes hacer ahora?' : 'What can you do now?'}
                      </h3>
                      <ul style="color: #2d3748; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>${lang === 'es' ? 'Ver tu análisis completo de CI' : 'View your complete IQ analysis'}</li>
                        <li>${lang === 'es' ? 'Descargar tu certificado oficial' : 'Download your official certificate'}</li>
                        <li>${lang === 'es' ? 'Acceder a gráficos comparativos' : 'Access comparative charts'}</li>
                        <li>${lang === 'es' ? 'Realizar tests adicionales (TDAH, Ansiedad, etc.)' : 'Take additional tests (ADHD, Anxiety, etc.)'}</li>
                        <li>${lang === 'es' ? 'Gestionar tu suscripción premium' : 'Manage your premium subscription'}</li>
                      </ul>
                    </div>
                    
                    <p style="color: #718096; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
                      ${lang === 'es'
                        ? '¿Necesitas ayuda? Responde a este email y te ayudaremos encantados.'
                        : 'Need help? Reply to this email and we\'ll be happy to help.'}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">
                      © ${new Date().getFullYear()} Brain Metric. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
                    </p>
                    <p style="color: #718096; font-size: 12px; margin: 0;">
                      info@brainmetric.io
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }),

  // ============================================
  // EMAILS POR TIPO DE TEST
  // ============================================

  // Test de Personalidad
  personalityTestResult: (email: string, userName: string, lang: string, traits?: any) => ({
    to: email,
    subject: lang === 'es'
      ? '🎯 Tu Perfil de Personalidad está listo!'
      : '🎯 Your Personality Profile is ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 20px;">
            <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr><td style="background:linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%);padding:40px 30px;text-align:center;">
                <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height:32px;margin:0 auto 20px;display:block;"/>
                <h1 style="color:#fff;margin:0;font-size:28px;">🎯 ${lang === 'es' ? 'Tu Perfil de Personalidad' : 'Your Personality Profile'}</h1>
              </td></tr>
              <tr><td style="padding:40px 30px;text-align:center;">
                <h2 style="color:#0F172A;margin:0 0 20px;">${lang === 'es' ? '¡Hola' : 'Hello'}, ${userName}!</h2>
                <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
                  ${lang === 'es' 
                    ? 'Has completado el Test de Personalidad Big Five. Tu perfil detallado te espera.'
                    : 'You have completed the Big Five Personality Test. Your detailed profile awaits.'}
                </p>
                <div style="background:linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%);border-radius:16px;padding:30px;margin:30px 0;color:#fff;">
                  <p style="margin:0;font-size:18px;font-weight:600;">
                    ${lang === 'es' ? '5 Rasgos Analizados' : '5 Traits Analyzed'}
                  </p>
                  <p style="margin:10px 0 0;font-size:14px;opacity:0.9;">
                    ${lang === 'es' 
                      ? 'Apertura • Responsabilidad • Extroversión • Amabilidad • Neuroticismo'
                      : 'Openness • Conscientiousness • Extraversion • Agreeableness • Neuroticism'}
                  </p>
                </div>
                <a href="https://brainmetric.io/${lang}/resultado?testType=personality" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                  ${lang === 'es' ? 'Ver Mi Perfil Completo' : 'View My Complete Profile'}
                </a>
              </td></tr>
              <tr><td style="background:#f7fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#718096;font-size:12px;margin:0;">© ${new Date().getFullYear()} Brain Metric</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  }),

  // Test de TDAH
  adhdTestResult: (email: string, userName: string, lang: string, score?: number) => ({
    to: email,
    subject: lang === 'es'
      ? '🎯 Tu Evaluación de TDAH está lista!'
      : '🎯 Your ADHD Assessment is ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 20px;">
            <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr><td style="background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);padding:40px 30px;text-align:center;">
                <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height:32px;margin:0 auto 20px;display:block;"/>
                <h1 style="color:#fff;margin:0;font-size:28px;">🎯 ${lang === 'es' ? 'Evaluación de TDAH' : 'ADHD Assessment'}</h1>
              </td></tr>
              <tr><td style="padding:40px 30px;text-align:center;">
                <h2 style="color:#0F172A;margin:0 0 20px;">${lang === 'es' ? '¡Hola' : 'Hello'}, ${userName}!</h2>
                <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
                  ${lang === 'es' 
                    ? 'Has completado la evaluación de síntomas de TDAH. Tu análisis detallado está disponible.'
                    : 'You have completed the ADHD symptoms assessment. Your detailed analysis is available.'}
                </p>
                <div style="background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);border-radius:16px;padding:30px;margin:30px 0;color:#fff;">
                  <p style="margin:0;font-size:18px;font-weight:600;">
                    ${lang === 'es' ? 'Áreas Evaluadas' : 'Areas Evaluated'}
                  </p>
                  <p style="margin:10px 0 0;font-size:14px;opacity:0.9;">
                    ${lang === 'es' 
                      ? 'Inatención • Hiperactividad • Impulsividad'
                      : 'Inattention • Hyperactivity • Impulsivity'}
                  </p>
                </div>
                <a href="https://brainmetric.io/${lang}/resultado?testType=adhd" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                  ${lang === 'es' ? 'Ver Mi Evaluación' : 'View My Assessment'}
                </a>
              </td></tr>
              <tr><td style="background:#f7fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#718096;font-size:12px;margin:0;">© ${new Date().getFullYear()} Brain Metric</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  }),

  // Test de Ansiedad
  anxietyTestResult: (email: string, userName: string, lang: string, level?: string) => ({
    to: email,
    subject: lang === 'es'
      ? '💙 Tu Evaluación de Ansiedad está lista!'
      : '💙 Your Anxiety Assessment is ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 20px;">
            <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr><td style="background:linear-gradient(135deg,#3B82F6 0%,#1D4ED8 100%);padding:40px 30px;text-align:center;">
                <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height:32px;margin:0 auto 20px;display:block;"/>
                <h1 style="color:#fff;margin:0;font-size:28px;">💙 ${lang === 'es' ? 'Evaluación de Ansiedad' : 'Anxiety Assessment'}</h1>
              </td></tr>
              <tr><td style="padding:40px 30px;text-align:center;">
                <h2 style="color:#0F172A;margin:0 0 20px;">${lang === 'es' ? '¡Hola' : 'Hello'}, ${userName}!</h2>
                <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
                  ${lang === 'es' 
                    ? 'Has completado la evaluación de niveles de ansiedad. Tus resultados están listos para revisar.'
                    : 'You have completed the anxiety levels assessment. Your results are ready to review.'}
                </p>
                <div style="background:linear-gradient(135deg,#3B82F6 0%,#1D4ED8 100%);border-radius:16px;padding:30px;margin:30px 0;color:#fff;">
                  <p style="margin:0;font-size:18px;font-weight:600;">
                    ${lang === 'es' ? 'Análisis Completo' : 'Complete Analysis'}
                  </p>
                  <p style="margin:10px 0 0;font-size:14px;opacity:0.9;">
                    ${lang === 'es' 
                      ? 'Síntomas físicos • Síntomas cognitivos • Recomendaciones'
                      : 'Physical symptoms • Cognitive symptoms • Recommendations'}
                  </p>
                </div>
                <a href="https://brainmetric.io/${lang}/resultado?testType=anxiety" style="display:inline-block;background:linear-gradient(135deg,#3B82F6 0%,#1D4ED8 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                  ${lang === 'es' ? 'Ver Mi Evaluación' : 'View My Assessment'}
                </a>
              </td></tr>
              <tr><td style="background:#f7fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#718096;font-size:12px;margin:0;">© ${new Date().getFullYear()} Brain Metric</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  }),

  // Test de Depresión
  depressionTestResult: (email: string, userName: string, lang: string, level?: string) => ({
    to: email,
    subject: lang === 'es'
      ? '🌟 Tu Evaluación de Depresión está lista!'
      : '🌟 Your Depression Assessment is ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 20px;">
            <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr><td style="background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);padding:40px 30px;text-align:center;">
                <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height:32px;margin:0 auto 20px;display:block;"/>
                <h1 style="color:#fff;margin:0;font-size:28px;">🌟 ${lang === 'es' ? 'Evaluación de Depresión' : 'Depression Assessment'}</h1>
              </td></tr>
              <tr><td style="padding:40px 30px;text-align:center;">
                <h2 style="color:#0F172A;margin:0 0 20px;">${lang === 'es' ? '¡Hola' : 'Hello'}, ${userName}!</h2>
                <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
                  ${lang === 'es' 
                    ? 'Has completado la evaluación de síntomas depresivos. Tu análisis detallado está disponible.'
                    : 'You have completed the depressive symptoms assessment. Your detailed analysis is available.'}
                </p>
                <div style="background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);border-radius:16px;padding:30px;margin:30px 0;color:#fff;">
                  <p style="margin:0;font-size:18px;font-weight:600;">
                    ${lang === 'es' ? 'Áreas Evaluadas' : 'Areas Evaluated'}
                  </p>
                  <p style="margin:10px 0 0;font-size:14px;opacity:0.9;">
                    ${lang === 'es' 
                      ? 'Estado de ánimo • Energía • Patrones de sueño • Recomendaciones'
                      : 'Mood • Energy • Sleep patterns • Recommendations'}
                  </p>
                </div>
                <a href="https://brainmetric.io/${lang}/resultado?testType=depression" style="display:inline-block;background:linear-gradient(135deg,#6366F1 0%,#4F46E5 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                  ${lang === 'es' ? 'Ver Mi Evaluación' : 'View My Assessment'}
                </a>
              </td></tr>
              <tr><td style="background:#f7fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#718096;font-size:12px;margin:0;">© ${new Date().getFullYear()} Brain Metric</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  }),

  // Test de Inteligencia Emocional (EQ)
  eqTestResult: (email: string, userName: string, lang: string, score?: number) => ({
    to: email,
    subject: lang === 'es'
      ? '❤️ Tu Evaluación de Inteligencia Emocional está lista!'
      : '❤️ Your Emotional Intelligence Assessment is ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td align="center" style="padding:40px 20px;">
            <table style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
              <tr><td style="background:linear-gradient(135deg,#EC4899 0%,#DB2777 100%);padding:40px 30px;text-align:center;">
                <img src="https://www.brainmetric.io/images/BRAINMETRIC/Logo_blanco.png" alt="Brain Metric" style="height:32px;margin:0 auto 20px;display:block;"/>
                <h1 style="color:#fff;margin:0;font-size:28px;">❤️ ${lang === 'es' ? 'Inteligencia Emocional' : 'Emotional Intelligence'}</h1>
              </td></tr>
              <tr><td style="padding:40px 30px;text-align:center;">
                <h2 style="color:#0F172A;margin:0 0 20px;">${lang === 'es' ? '¡Hola' : 'Hello'}, ${userName}!</h2>
                <p style="color:#4a5568;font-size:16px;line-height:1.6;margin:0 0 30px;">
                  ${lang === 'es' 
                    ? 'Has completado la evaluación de Inteligencia Emocional. Descubre tus fortalezas emocionales.'
                    : 'You have completed the Emotional Intelligence assessment. Discover your emotional strengths.'}
                </p>
                <div style="background:linear-gradient(135deg,#EC4899 0%,#DB2777 100%);border-radius:16px;padding:30px;margin:30px 0;color:#fff;">
                  <p style="margin:0;font-size:18px;font-weight:600;">
                    ${lang === 'es' ? 'Áreas Evaluadas' : 'Areas Evaluated'}
                  </p>
                  <p style="margin:10px 0 0;font-size:14px;opacity:0.9;">
                    ${lang === 'es' 
                      ? 'Autoconciencia • Autorregulación • Empatía • Habilidades sociales'
                      : 'Self-awareness • Self-regulation • Empathy • Social skills'}
                  </p>
                </div>
                <a href="https://brainmetric.io/${lang}/resultado?testType=eq" style="display:inline-block;background:linear-gradient(135deg,#EC4899 0%,#DB2777 100%);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:600;font-size:16px;">
                  ${lang === 'es' ? 'Ver Mi Evaluación' : 'View My Assessment'}
                </a>
              </td></tr>
              <tr><td style="background:#f7fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="color:#718096;font-size:12px;margin:0;">© ${new Date().getFullYear()} Brain Metric</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  }),
}


