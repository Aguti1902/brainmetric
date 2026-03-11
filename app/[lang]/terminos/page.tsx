'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTranslations } from '@/hooks/useTranslations'

export default function TerminosPage() {
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
            Terms and Conditions
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Brain Metric ("the Site"), you agree to be bound by these Terms and Conditions. 
                If you do not agree with any part of these terms, you should not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p>
                Brain Metric offers an online intelligence test that allows users to evaluate their Intelligence Quotient (IQ) 
                through a series of visual logic and reasoning questions.
              </p>
              <p>
                The service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Free completion of the 20-question test</li>
                <li>Access to complete results through a payment of €0.50</li>
                <li>Detailed analysis and downloadable certificate</li>
                <li>2-day premium trial with subsequent €9.99/month subscription</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Pricing Structure and Subscription</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3.1 Initial Payment</h3>
              <p>
                Access to the complete test results requires a one-time payment of <strong>€0.50</strong> (VAT included).
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">3.2 Premium Subscription</h3>
              <p>
                Upon making the initial €0.50 payment, a <strong>2-day free premium trial</strong> is automatically activated. 
                If you do not cancel before the 2 days end, you will be automatically charged <strong>€9.99/month</strong> 
                for the continuing premium subscription.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">3.3 Cancellation</h3>
              <p>
                You can cancel your premium subscription at any time during the 2-day trial period to avoid the monthly charge. 
                After the trial period, you can cancel at any time, but charges will apply until the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Processing</h2>
              <p>
                All payments are securely processed through Stripe, Inc. ("Stripe"), our registered merchant of record. 
                Stripe provides billing and payment processing services and is responsible for all payments made on the Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Use of Service</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">5.1 Eligibility</h3>
              <p>
                You must be at least 18 years old to use our service. If you are under 18, you must obtain consent from your 
                parents or legal guardians.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">5.2 User Account</h3>
              <p>
                By providing your email address during the payment process, you create an account in our system. You are 
                responsible for maintaining the confidentiality of your account information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">5.3 Appropriate Use</h3>
              <p>
                You agree to use the service only for lawful purposes and in accordance with these Terms. You must not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Share your access credentials with third parties</li>
                <li>Attempt to copy, modify, or distribute our content without authorization</li>
                <li>Reverse engineer the test or its algorithms</li>
                <li>Use the service in a manner that could damage, disable, or overburden our servers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Test Results</h2>
              <p>
                The IQ test results provided by Brain Metric are estimates based on your responses to the questionnaire. 
                These results are for informational and entertainment purposes and should not be considered as professional 
                medical or psychological diagnosis.
              </p>
              <p>
                We do not guarantee that the results are 100% accurate or that they reflect your real intelligence in all 
                circumstances. Factors such as mood, fatigue, and distractions may affect results.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p>
                All content on the Site, including but not limited to texts, graphics, logos, images, test questions, 
                and software, is the property of Brain Metric or its licensors and is protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Brain Metric shall not be liable for any direct, indirect, incidental, 
                special, or consequential damages resulting from the use or inability to use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service and Terms Modifications</h2>
              <p>
                We reserve the right to modify or discontinue the service at any time without prior notice. We may also 
                update these Terms and Conditions periodically. We will notify you of any significant changes by posting 
                the new terms on the Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of Spain, without regard to its 
                conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us through our{' '}
                <a href={`/${lang}/contacto`} className="text-primary-600 underline">contact page</a> or email us at{' '}
                <a href="mailto:support@brainmetric.io" className="text-primary-600 underline">support@brainmetric.io</a>.
              </p>
            </section>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-2">⚠️ Important Summary:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Initial payment: €0.50 to access your results</li>
                <li>• Automatically activates a 2-day premium trial (free)</li>
                <li>• After 2 days: €9.99/month automatically charged</li>
                <li>• You can cancel anytime during the trial to avoid monthly charges</li>
                <li>• Results are estimates for informational purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
