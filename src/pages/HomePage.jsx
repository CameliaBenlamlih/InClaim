import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
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
  Lock
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const features = [
  {
    icon: Lock,
    title: 'Blockchain Escrow',
    description: 'Your ticket payment is locked on-chain. Released to carrier if on-time, refunded to you if delayed.',
  },
  {
    icon: Zap,
    title: 'Instant Refunds',
    description: 'Automatic refunds based on fixed policy: 20% for 3h+, 50% for 24h+, 100% for cancellations.',
  },
  {
    icon: FileCheck,
    title: 'Zero Trust Required',
    description: 'Real flight data verified by Flare Data Connector. No paperwork, no disputes, fully automatic.',
  },
];

const steps = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Wallet',
    description: 'Connect your wallet to Flare Coston2 testnet',
  },
  {
    number: '02',
    icon: FileCheck,
    title: 'Lock Payment',
    description: 'Enter trip details and lock your ticket price in escrow',
  },
  {
    number: '03',
    icon: Clock,
    title: 'Travel',
    description: 'Your payment is secured on-chain during your journey',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Auto-Refund',
    description: 'Delayed? Get instant refund. On-time? Payment released to carrier',
  },
];

export default function HomePage() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Powered by Flare
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-tight mb-6">
            <span className="text-primary-600">File in a flash,</span><br/>
            get your cash
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Instant compensation for delayed flights and trains. Trustless, automatic, on-chain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isConnected ? (
              <Link to="/create">
                <Button size="lg">
                  Create Policy
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => open()}>
                Connect Wallet
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
            <Link to="/policies">
              <Button variant="secondary" size="lg">
                View My Policies
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-bold gradient-text">100%</div>
              <div className="text-sm text-gray-500 mt-1">Trustless</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl font-bold gradient-text">~30s</div>
              <div className="text-sm text-gray-500 mt-1">Claim Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl font-bold gradient-text">0</div>
              <div className="text-sm text-gray-500 mt-1">Paperwork</div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Travel Types */}
      <section>
        <div className="grid md:grid-cols-2 gap-6">
          <Card hover>
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flight Coverage</h3>
              <p className="text-gray-600">
                Lock your flight ticket payment. Get automatic refunds for delays and cancellations.
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <Train className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Train Coverage</h3>
              <p className="text-gray-600">
                Lock your train ticket payment. Get automatic refunds when delays happen.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Why InClaim?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Traditional travel insurance requires trust. InClaim uses blockchain escrow for automatic, trustless refunds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Four simple steps to trustless travel compensation
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className="h-full">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-display font-bold text-primary-100 mb-4">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-200" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

    {/* Travel Types */}
    <section>
      <div className="grid md:grid-cols-2 gap-6">
        <Card hover>
          <CardContent className="p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <Plane className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Flight Coverage</h3>
            <p className="text-gray-600">
              Lock your flight ticket payment. Get automatic refunds for delays and cancellations.
            </p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <Train className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Train Coverage</h3>
            <p className="text-gray-600">
              Lock your train ticket payment. Get automatic refunds when delays happen.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>

    {/* Features */}
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
          Why InClaim?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Traditional travel insurance requires trust. InClaim uses blockchain escrow for automatic, trustless refunds.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-flare-500 to-primary-500 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>

    {/* How It Works */}
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Four simple steps to trustless travel compensation
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <Card className="h-full">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-display font-bold text-flare-100 mb-4">
                  {step.number}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </CardContent>
            </Card>
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-200" />
            )}
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section>
      <Card className="bg-primary-600 border-0">
        <CardContent className="p-12 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            File in a flash, get your cash. Lock your ticket payment in under a minute. Get automatic refunds if delays happen.
          </p>
          {isConnected ? (
            <Link to="/create">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-50 shadow-xl"
              >
                Create Policy
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-50 shadow-xl"
              onClick={() => open()}
            >
              Connect Wallet
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
