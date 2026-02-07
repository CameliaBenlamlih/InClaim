import { motion } from 'framer-motion';
import { 
  Lock, 
  TrendingUp, 
  Zap, 
  Shield,
  CheckCircle,
  Clock,
  Ban,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { COMPENSATION_POLICY } from '../lib/refund';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            How InClaim Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            File in a flash, get your cash. Your ticket payment is secured on the blockchain.
          </p>
        </div>

        {/* Main Process */}
        <Card>
          <CardHeader>
            <CardTitle>The Escrow Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Payment Locked</h3>
                <p className="text-sm text-gray-600">
                  Your ticket payment is securely locked on the Flare blockchain (escrow).
                </p>
              </div>

              {/* Step 2a */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2a. Trip On Time</h3>
                <p className="text-sm text-gray-600">
                  If your trip departs on time or with minimal delay, payment is automatically released to the carrier.
                </p>
              </div>

              {/* Step 2b */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">2b. Delay/Cancellation</h3>
                <p className="text-sm text-gray-600">
                  If delayed or cancelled, you receive an instant refund based on the fixed compensation policy.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Trustless & Automatic</p>
                  <p className="text-xs text-blue-700 mt-1">
                    No paperwork, no disputes. Flight status is verified using real aviation data via Flare Data Connector, 
                    and refunds are processed automatically by the smart contract.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Fixed Compensation Policy</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              These rules are the same for everyone and cannot be modified. Refunds are calculated automatically based on delay duration.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {COMPENSATION_POLICY.map((policy, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      policy.refundPercent === 0 ? 'bg-gray-100' :
                      policy.refundPercent === 20 ? 'bg-yellow-100' :
                      policy.refundPercent === 50 ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      {policy.isCancellation ? (
                        <Ban className={`w-6 h-6 ${
                          policy.refundPercent === 100 ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      ) : (
                        <Clock className={`w-6 h-6 ${
                          policy.refundPercent === 0 ? 'text-gray-600' :
                          policy.refundPercent === 20 ? 'text-yellow-600' :
                          policy.refundPercent === 50 ? 'text-orange-600' :
                          'text-red-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{policy.label}</p>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      policy.refundPercent === 0 ? 'text-gray-600' :
                      policy.refundPercent === 20 ? 'text-yellow-600' :
                      policy.refundPercent === 50 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {policy.refundPercent}%
                    </p>
                    <p className="text-xs text-gray-500">refund</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>Example:</strong> If you pay 100 C2FLR for a ticket and your flight is delayed by 5 hours, 
                you'll receive an instant refund of <strong>20 C2FLR</strong> (20% of ticket price).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">How is delay detected?</h3>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                InClaim uses real flight data from AviationStack API, verified through Flare Data Connector (FDC). 
                This ensures accurate, tamper-proof delay information directly from aviation sources.
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">When do I receive my refund?</h3>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                Refunds are processed instantly when you submit a claim after your travel date. 
                The smart contract automatically calculates the refund percentage and transfers the amount to your wallet.
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">Can I modify the compensation policy?</h3>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                No. The compensation policy is fixed and identical for all users. This ensures fairness and transparency. 
                The percentages are hardcoded in the smart contract and cannot be changed.
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">What if my trip is on time?</h3>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                If your trip departs on time or with less than 3 hours delay, the full ticket payment is released 
                to the carrier, and you receive no refund. This is the expected scenario for most trips.
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">What's the claim deadline?</h3>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                You have 7 days after your scheduled travel date to submit a claim. After that, the policy expires 
                and funds are released to the carrier.
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900">Is my payment safe?</h3>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                Yes. Your payment is locked in a smart contract on the Flare blockchain, secured by cryptographic proof. 
                Only two outcomes are possible: automatic release to carrier (if on time) or automatic refund to you (if delayed/cancelled).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Protect Your Journey?</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Create your first escrow policy and enjoy automatic refunds if delays happen.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
          >
            Create Policy
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
