'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslations } from '@/hooks/useTranslations'

export default function PrivacidadPage() {
  const { t, loading, lang } = useTranslations()

  if (loading || !t) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-white py-12">
        <div className="container-custom max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                At Brain Metric, we take the privacy of our users very seriously. This Privacy Policy describes how we 
                collect, use, store, and protect your personal information when you use our website and services.
              </p>
              <p>
                This policy complies with the General Data Protection Regulation (GDPR) of the European Union 
                and other applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Email address:</strong> Collected during the payment process</li>
                <li><strong>Payment information:</strong> Processed by Stripe (we do not store card data)</li>
                <li><strong>Test responses:</strong> Your selections in the IQ questionnaire</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage data:</strong> Pages visited, time on site, clicks</li>
                <li><strong>Device information:</strong> Browser type, operating system, IP address</li>
                <li><strong>Cookies:</strong> To improve user experience and analyze traffic</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p>
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process your payment and provide access to test results</li>
                <li>Send your certificate and results via email</li>
                <li>Manage your premium subscription</li>
                <li>Improve our services and user experience</li>
                <li>Send service-related communications (confirmations, reminders)</li>
                <li>Comply with legal obligations</li>
                <li>Perform aggregated statistical analysis (anonymous data)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
              <p>
                We process your personal data under the following legal bases:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contract performance:</strong> To provide the service you requested</li>
                <li><strong>Consent:</strong> For marketing communications (you can withdraw consent at any time)</li>
                <li><strong>Legitimate interests:</strong> To improve our services and prevent fraud</li>
                <li><strong>Legal obligation:</strong> To comply with tax and accounting requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sharing Information with Third Parties</h2>
              <p>
                We do not sell your personal information. We share limited information only with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe:</strong> Our payment processor, to handle transactions</li>
                <li><strong>Google Analytics:</strong> For site traffic analysis (anonymous data)</li>
                <li><strong>Meta (Facebook):</strong> For conversion tracking and advertising (anonymous data)</li>
                <li><strong>Service providers:</strong> Who help us operate our business, under strict confidentiality obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Storage and Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal 
                data against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                Your data is stored on secure servers with SSL/TLS encryption. We retain your personal information 
                only for as long as necessary to fulfill the purposes described in this policy or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our site</li>
                <li>Improve site functionality</li>
                <li>Analyze traffic and user behavior</li>
              </ul>
              <p>
                You can control cookies through your browser settings. However, disabling cookies may affect 
                your experience on our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights (GDPR)</h2>
              <p>
                Under GDPR, you have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right of access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to erasure:</strong> Request deletion of your data (under certain conditions)</li>
                <li><strong>Right to restriction:</strong> Request limitation of data processing</li>
                <li><strong>Right to portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to object:</strong> Object to processing of your data</li>
                <li><strong>Right to withdraw consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:support@brainmetric.io" className="text-primary-600 underline">support@brainmetric.io</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
              <p>
                We retain your personal data for as long as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account is active</li>
                <li>Needed to provide you with our services</li>
                <li>Required to comply with legal, tax, or accounting obligations</li>
              </ul>
              <p>
                After account deletion, we may retain certain data in anonymized form for statistical purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 18 years of age. We do not knowingly collect 
                personal information from children. If we discover that we have collected information from a 
                child under 18, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA). 
                We ensure that such transfers comply with applicable data protection laws and provide adequate 
                safeguards for your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes 
                by posting the new policy on our site and updating the "Last updated" date. We encourage you to 
                review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <ul className="list-none space-y-1 ml-0">
                <li><strong>Email:</strong> <a href="mailto:support@brainmetric.io" className="text-primary-600 underline">support@brainmetric.io</a></li>
                <li><strong>Contact page:</strong> <a href={`/${lang}/contacto`} className="text-primary-600 underline">Contact Form</a></li>
              </ul>
            </section>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-2">📌 Key Points:</h3>
              <ul className="space-y-2 text-sm">
                <li>• We only collect necessary information to provide our service</li>
                <li>• Your payment data is processed by Stripe and never stored by us</li>
                <li>• You have full control over your data and can request deletion at any time</li>
                <li>• We comply with GDPR and other data protection regulations</li>
                <li>• We never sell your personal information to third parties</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
