import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Plane, 
  Train,
  Clock,
  FileCheck,
  Wallet,
  Lock,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
  {
    icon: Lock,
    title: 'Blockchain Escrow',
    description: 'Your ticket payment is locked on-chain. Released to carrier if on-time, refunded to you if delayed.',
    gradient: 'from-orange-50 to-red-50',
    iconColor: 'text-accent',
  },
  {
    icon: Zap,
    title: 'Instant Refunds',
    description: 'Automatic refunds based on fixed policy: 20% for 3h+, 50% for 24h+, 100% for cancellations.',
    gradient: 'from-yellow-50 to-orange-50',
    iconColor: 'text-yellow-600',
  },
  {
    icon: FileCheck,
    title: 'Zero Trust Required',
    description: 'Real flight data verified by Flare Data Connector. No paperwork, no disputes, fully automatic.',
    gradient: 'from-emerald-50 to-green-50',
    iconColor: 'text-emerald-500',
  },
];

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Connect your wallet to Flare Coston2 testnet',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    number: '02',
    icon: FileCheck,
    title: 'Lock Payment',
    description: 'Enter trip details and lock your ticket price in escrow',
    color: 'from-orange-500 to-red-500',
  },
  {
    number: '03',
    icon: Clock,
    title: 'Travel',
    description: 'Your payment is secured on-chain during your journey',
    color: 'from-emerald-500 to-green-500',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Auto-Refund',
    description: 'Delayed? Get instant refund. On-time? Payment released to carrier',
    color: 'from-purple-500 to-pink-500',
  },
];

const stats = [
  { value: '100%', label: 'Trustless', delay: 0.3 },
  { value: '~30s', label: 'Claim Time', delay: 0.4 },
  { value: '0', label: 'Paperwork', delay: 0.5 },
];

export default function HomePage() {
  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' });
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });

  return (
    <div className="space-y-20 pb-16">

      {}
      <section className="relative pt-16 pb-8 overflow-hidden">
        {}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-56 h-56 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white rounded-pill text-dark-500 text-xs font-medium mb-8 border border-dark-200/50 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-accent" />
            Powered by Flare Data Connector
          </motion.div>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-dark-900 leading-[1.05] mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="block"
            >
              File in a flash,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-accent block"
            >
              get your cash
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-base text-dark-500 mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Already bought your ticket? Protect it with blockchain escrow. Get instant compensation if delayed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/book">
              <Button variant="accent" size="lg">
                Book & Protect
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </Link>
          </motion.div>

          {}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-md mx-auto">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: stat.delay, type: 'spring', stiffness: 200 }}
                className="text-center"
              >
                <div className="font-serif text-3xl text-dark-900 mb-1">{stat.value}</div>
                <div className="text-[11px] text-dark-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {}
      <section>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { icon: Plane, title: 'Flight Coverage', desc: 'Lock your flight ticket payment. Get automatic refunds for delays and cancellations.', gradient: 'from-accent/10 to-red-50', iconColor: 'text-accent' },
            { icon: Train, title: 'Train Coverage', desc: 'Lock your train ticket payment. Get automatic refunds when delays happen.', gradient: 'from-accent-purple/10 to-indigo-50', iconColor: 'text-accent-purple' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.15 }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(255,59,0,0.06)' }}
              className="relative bg-white rounded-2xl border border-dark-200/60 p-8 overflow-hidden group cursor-default transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5`}
                >
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </motion.div>
                <h3 className="text-lg font-semibold text-dark-900 mb-2">{item.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {}
      <section ref={featuresRef}>
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl text-dark-900 mb-3"
          >
            Why <span className="text-accent">InClaim</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={featuresInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-dark-500 max-w-xl mx-auto text-sm leading-relaxed"
          >
            Traditional travel insurance requires trust. InClaim uses blockchain escrow for automatic, trustless refunds.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={featuresInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.15 + index * 0.15, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}
              className="relative bg-white rounded-2xl border border-dark-200/60 p-6 overflow-hidden group cursor-default transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={featuresInView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.15, type: 'spring', stiffness: 200 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </motion.div>
                <h3 className="text-sm font-bold text-dark-900 mb-2">{feature.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {}
      <section ref={stepsRef}>
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            className="font-serif text-3xl text-dark-900 mb-3"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={stepsInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="text-dark-500 max-w-xl mx-auto text-sm leading-relaxed"
          >
            Four simple steps to trustless travel compensation
          </motion.p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-dark-200 overflow-hidden">
            <motion.div
              className="w-full bg-accent"
              initial={{ height: 0 }}
              animate={stepsInView ? { height: '100%' } : { height: 0 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                animate={stepsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.3, duration: 0.5, ease: 'easeOut' }}
                className="relative flex items-start gap-6"
              >
                {}
                <motion.div
                  className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-dark-200"
                  initial={{ scale: 0 }}
                  animate={stepsInView ? { scale: 1, borderColor: '#FF3B00' } : {}}
                  transition={{ delay: 0.3 + index * 0.3, duration: 0.4, type: 'spring' }}
                  style={{ backgroundColor: 'white' }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <step.icon className="w-5 h-5 text-accent" />
                </motion.div>

                {}
                <motion.div
                  className="flex-1 bg-white rounded-xl border border-dark-200/60 p-5 hover:shadow-[0_4px_16px_rgba(255,59,0,0.06)] transition-shadow"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-white bg-dark-900 rounded-full w-5 h-5 flex items-center justify-center">{index + 1}</span>
                    <h3 className="text-sm font-bold text-dark-900">{step.title}</h3>
                  </div>
                  <p className="text-dark-500 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl p-12 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)' }}
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent-purple/5 blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-6 h-6 text-accent" />
            </motion.div>
            <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-dark-400 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
              File in a flash, get your cash. Lock your ticket payment in under a minute. Get automatic refunds if delays happen.
            </p>
            <Link to="/book">
              <Button variant="accent" size="lg" className="hover:shadow-[0_4px_20px_rgba(255,59,0,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                Book & Protect
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
