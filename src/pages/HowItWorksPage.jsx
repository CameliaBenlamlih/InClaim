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
          <h1 className="text-3xl font-bold text-dark-900 mb-4 uppercase tracking-wider">
            How InClaim Works
          </h1>
          <p className="text-base text-dark-500 max-w-2xl mx-auto">
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
                <div className="w-12 h-12 border border-dark-200 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-5 h-5 text-dark-900" />
                </div>
                <h3 className="text-xs font-bold text-dark-900 mb-2 uppercase tracking-wider">1. Payment Locked</h3>
                <p className="text-sm text-dark-500">
                  Your ticket payment is securely locked on the Flare blockchain (escrow).
                </p>
              </div>

              {/* Step 2a */}
              <div className="text-center">
                <div className="w-12 h-12 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xs font-bold text-dark-900 mb-2 uppercase tracking-wider">2a. Trip On Time</h3>
                <p className="text-sm text-dark-500">
                  If your trip departs on time or with minimal delay, payment is automatically released to the carrier.
                </p>
              </div>

              {/* Step 2b */}
              <div className="text-center">
                <div className="w-12 h-12 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xs font-bold text-dark-900 mb-2 uppercase tracking-wider">2b. Delay/Cancellation</h3>
                <p className="text-sm text-dark-500">
                  If delayed or cancelled, you receive an instant refund based on the fixed compensation policy.
                </p>
              </div>
            </div>

            <div className="border border-dark-200 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-dark-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-dark-900 uppercase tracking-wider">Trustless & Automatic</p>
                  <p className="text-xs text-dark-500 mt-1">
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
            <p className="text-xs text-dark-500 mt-2">
              These rules are the same for everyone and cannot be modified. Refunds are calculated automatically based on delay duration.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y divide-dotted divide-dark-200">
              {COMPENSATION_POLICY.map((policy, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 hover:bg-dark-100/50 transition-colors px-2"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 border flex items-center justify-center ${
                      policy.refundPercent === 0 ? 'border-dark-200' :
                      policy.refundPercent === 20 ? 'border-yellow-500/30' :
                      policy.refundPercent === 50 ? 'border-orange-500/30' :
                      'border-red-500/30'
                    }`}>
                      {policy.isCancellation ? (
                        <Ban className={`w-4 h-4 ${
                          policy.refundPercent === 100 ? 'text-red-400' : 'text-dark-500'
                        }`} />
                      ) : (
                        <Clock className={`w-4 h-4 ${
                          policy.refundPercent === 0 ? 'text-dark-500' :
                          policy.refundPercent === 20 ? 'text-yellow-400' :
                          policy.refundPercent === 50 ? 'text-orange-400' :
                          'text-red-400'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark-900">{policy.label}</p>
                      <p className="text-xs text-dark-500">{policy.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-mono font-bold ${
                      policy.refundPercent === 0 ? 'text-dark-500' :
                      policy.refundPercent === 20 ? 'text-yellow-400' :
                      policy.refundPercent === 50 ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {policy.refundPercent}%
                    </p>
                    <p className="text-[10px] text-dark-400 uppercase tracking-widest">refund</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-dark-100">
              <p className="text-xs text-dark-500">
                <span className="font-bold text-dark-700">Example:</span> If you pay 100 C2FLR for a ticket and your flight is delayed by 5 hours, 
                you'll receive an instant refund of <span className="font-bold text-dark-900 font-mono">20 C2FLR</span> (20% of ticket price).
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
            {[
              { q: 'How is delay detected?', a: 'InClaim uses real flight data from AviationStack API, verified through Flare Data Connector (FDC). This ensures accurate, tamper-proof delay information directly from aviation sources.' },
              { q: 'When do I receive my refund?', a: 'Refunds are processed instantly when you submit a claim after your travel date. The smart contract automatically calculates the refund percentage and transfers the amount to your wallet.' },
              { q: 'Can I modify the compensation policy?', a: 'No. The compensation policy is fixed and identical for all users. This ensures fairness and transparency. The percentages are hardcoded in the smart contract and cannot be changed.' },
              { q: 'What if my trip is on time?', a: 'If your trip departs on time or with less than 3 hours delay, the full ticket payment is released to the carrier, and you receive no refund. This is the expected scenario for most trips.' },
              { q: "What's the claim deadline?", a: 'You have 7 days after your scheduled travel date to submit a claim. After that, the policy expires and funds are released to the carrier.' },
              { q: 'Is my payment safe?', a: 'Yes. Your payment is locked in a smart contract on the Flare blockchain, secured by cryptographic proof. Only two outcomes are possible: automatic release to carrier (if on time) or automatic refund to you (if delayed/cancelled).' },
            ].map((faq, i) => (
              <div key={i} className="border-b border-dotted border-dark-200 pb-4 last:border-0">
                <div className="flex items-start gap-3 mb-2">
                  <HelpCircle className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                  <h3 className="text-sm font-bold text-dark-900">{faq.q}</h3>
                </div>
                <p className="text-sm text-dark-500 ml-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="bg-dark-900 p-8 text-center">
          <h2 className="text-xl font-bold text-dark mb-4 uppercase tracking-wider">Ready to Protect Your Journey?</h2>
          <p className="text-dark-400 mb-6 max-w-2xl mx-auto text-sm">
            Create your first escrow policy and enjoy automatic refunds if delays happen.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dark text-dark-900 border border-dark-300 font-bold text-xs uppercase tracking-wider hover:bg-dark-50 hover:text-white transition-colors"
          >
            Create Policy
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
