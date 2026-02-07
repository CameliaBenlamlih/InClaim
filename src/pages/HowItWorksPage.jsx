import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { 
  Lock, 
  Zap, 
  Shield,
  CheckCircle,
  Clock,
  Ban,
  ChevronDown,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { COMPENSATION_POLICY } from '../lib/refund';

const faqs = [
  { q: 'How is delay detected?', a: 'InClaim uses real flight data from AviationStack API, verified through Flare Data Connector (FDC). This ensures accurate, tamper-proof delay information directly from aviation sources.' },
  { q: 'When do I receive my refund?', a: 'Refunds are processed instantly when you submit a claim after your travel date. The smart contract automatically calculates the refund percentage and transfers the amount to your wallet.' },
  { q: 'Can I modify the compensation policy?', a: 'No. The compensation policy is fixed and identical for all users. This ensures fairness and transparency. The percentages are hardcoded in the smart contract and cannot be changed.' },
  { q: 'What if my trip is on time?', a: 'If your trip departs on time or with less than 3 hours delay, the full ticket payment is released to the carrier, and you receive no refund. This is the expected scenario for most trips.' },
  { q: "What's the claim deadline?", a: 'You have 7 days after your scheduled travel date to submit a claim. After that, the policy expires and funds are released to the carrier.' },
  { q: 'Is my payment safe?', a: 'Yes. Your payment is locked in a smart contract on the Flare blockchain, secured by cryptographic proof. Only two outcomes are possible: automatic release to carrier (if on time) or automatic refund to you (if delayed/cancelled).' },
];

function FaqItem({ faq, index, isInView }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-dark-50/50 rounded-lg px-4 transition-colors"
      >
        <span className="text-sm font-semibold text-dark-900 pr-4">{faq.q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-dark-400" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="text-sm text-dark-500 leading-relaxed px-4 pb-4">
          {faq.a}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function HowItWorksPage() {
  const processRef = useRef(null);
  const processInView = useInView(processRef, { once: true, margin: '-50px' });
  const policyRef = useRef(null);
  const policyInView = useInView(policyRef, { once: true, margin: '-50px' });
  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true, margin: '-50px' });

  const processSteps = [
    {
      icon: Lock,
      title: 'Payment Locked',
      desc: 'Your ticket payment is securely locked on the Flare blockchain via smart contract escrow.',
      color: 'from-orange-500 to-red-500',
      bg: 'bg-gradient-to-br from-orange-50 to-red-50',
      iconColor: 'text-accent',
    },
    {
      icon: CheckCircle,
      title: 'Trip On Time',
      desc: 'If on time or minimal delay, payment is automatically released to the carrier.',
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
      iconColor: 'text-emerald-500',
    },
    {
      icon: Zap,
      title: 'Delay / Cancellation',
      desc: 'If delayed or cancelled, you receive an instant refund based on the fixed compensation policy.',
      color: 'from-red-500 to-pink-500',
      bg: 'bg-gradient-to-br from-red-50 to-pink-50',
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-12">

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto mb-6"
          >
            <Shield className="w-7 h-7 text-accent" />
          </motion.div>
          <h1 className="font-serif text-4xl sm:text-5xl text-dark-900 mb-4">
            How <span className="text-accent">InClaim</span> Works
          </h1>
          <p className="text-base text-dark-500 max-w-2xl mx-auto leading-relaxed">
            File in a flash, get your cash. Your ticket payment is secured on the blockchain
            with automatic, trustless refunds.
          </p>
        </motion.div>

        {}
        <div ref={processRef}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={processInView ? { opacity: 1 } : {}}
            className="text-xs font-semibold text-dark-400 uppercase tracking-widest text-center mb-6"
          >
            The Escrow Process
          </motion.p>

          <div className="grid md:grid-cols-3 gap-5">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={processInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.15 + i * 0.2, duration: 0.5, ease: 'easeOut' }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(255,59,0,0.08)' }}
                className="relative bg-white rounded-2xl border border-dark-200/60 p-6 text-center transition-all cursor-default overflow-hidden group"
              >
                {}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${step.bg}`} />

                <div className="relative z-10">
                  {}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={processInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 300 }}
                    className="w-6 h-6 rounded-full bg-dark-900 text-white text-[10px] font-bold flex items-center justify-center mx-auto mb-4"
                  >
                    {i + 1}
                  </motion.div>

                  {}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={processInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.2, type: 'spring', stiffness: 200 }}
                    className={`w-14 h-14 rounded-xl ${step.bg} flex items-center justify-center mx-auto mb-5`}
                  >
                    <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                  </motion.div>

                  <h3 className="text-sm font-bold text-dark-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-dark-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 bg-gradient-to-r from-dark-900 to-dark-900/90 rounded-xl p-5 flex items-start gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Trustless & Automatic</p>
              <p className="text-xs text-dark-400 leading-relaxed">
                No paperwork, no disputes. Flight status is verified using real aviation data via Flare Data Connector, 
                and refunds are processed automatically by the smart contract.
              </p>
            </div>
          </motion.div>
        </div>

        {}
        <div ref={policyRef}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={policyInView ? { opacity: 1 } : {}}
            className="text-center mb-6"
          >
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-widest mb-2">Fixed Compensation Policy</p>
            <p className="text-sm text-dark-500 max-w-lg mx-auto">
              Same rules for everyone. Refunds are calculated automatically based on delay duration.
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl border border-dark-200/60 p-6 space-y-3">
            {COMPENSATION_POLICY.map((policy, index) => {
              const barColor =
                policy.refundPercent === 0 ? 'bg-dark-200' :
                policy.refundPercent === 20 ? 'bg-yellow-400' :
                policy.refundPercent === 50 ? 'bg-orange-400' :
                'bg-red-500';
              const textColor =
                policy.refundPercent === 0 ? 'text-dark-500' :
                policy.refundPercent === 20 ? 'text-yellow-600' :
                policy.refundPercent === 50 ? 'text-orange-500' :
                'text-red-500';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={policyInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 + index * 0.12, duration: 0.4 }}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-dark-50/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    policy.refundPercent === 0 ? 'bg-dark-100' :
                    policy.refundPercent === 20 ? 'bg-yellow-50' :
                    policy.refundPercent === 50 ? 'bg-orange-50' :
                    'bg-red-50'
                  }`}>
                    {policy.isCancellation ? (
                      <Ban className={`w-4 h-4 ${textColor}`} />
                    ) : (
                      <Clock className={`w-4 h-4 ${textColor}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <p className="text-sm font-semibold text-dark-900">{policy.label}</p>
                      <p className={`font-serif text-lg font-bold ${textColor} ml-2`}>
                        {policy.refundPercent}%
                      </p>
                    </div>
                    {}
                    <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${barColor}`}
                        initial={{ width: 0 }}
                        animate={policyInView ? { width: `${policy.refundPercent}%` } : {}}
                        transition={{ delay: 0.3 + index * 0.15, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[11px] text-dark-400 mt-1">{policy.description}</p>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0 }}
              animate={policyInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
              className="mt-4 p-4 bg-gradient-to-r from-dark-50 to-transparent rounded-xl border border-dark-200/40"
            >
              <p className="text-xs text-dark-500">
                <span className="font-semibold text-dark-700">Example:</span> If you pay 100 C2FLR for a ticket and your flight is delayed by 5 hours, 
                you'll receive an instant refund of <span className="font-bold text-accent">20 C2FLR</span> (20% of ticket price).
              </p>
            </motion.div>
          </div>
        </div>

        {}
        <div ref={faqRef}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={faqInView ? { opacity: 1 } : {}}
            className="text-xs font-semibold text-dark-400 uppercase tracking-widest text-center mb-6"
          >
            Frequently Asked Questions
          </motion.p>

          <div className="bg-white rounded-2xl border border-dark-200/60 divide-y divide-dark-100">
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} isInView={faqInView} />
            ))}
          </div>
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)' }}
        >
          {}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-5"
            >
              <Shield className="w-5 h-5 text-accent" />
            </motion.div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white mb-4">Ready to Protect Your Journey?</h2>
            <p className="text-dark-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
              Book your trip and enjoy automatic refunds if delays happen.
            </p>
            <a
              href="/book"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white rounded-pill font-semibold text-sm hover:shadow-[0_4px_20px_rgba(255,59,0,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Book & Protect
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
