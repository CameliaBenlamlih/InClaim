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
      <section className="relative pt-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-dark-200 text-dark-500 text-xs font-bold uppercase tracking-widest font-mono mb-8">
            <Shield className="w-3 h-3" />
            Powered by Flare
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-dark-900 leading-none mb-6 uppercase tracking-tight">
            File in a flash,<br/>
            <span className="text-dark-500">get your cash</span>
          </h1>

          <p className="text-base text-dark-500 mb-10 max-w-2xl mx-auto">
            Already bought your ticket? Protect it with blockchain escrow. Get instant compensation if delayed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isConnected ? (
              <Link to="/create">
                <Button size="lg">
                  Create Policy
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={() => open()}>
                Connect Wallet
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Link to="/policies">
              <Button variant="secondary" size="lg">
                View My Policies
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto border-t border-dashed border-dark-200 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-mono font-bold text-dark-900">100%</div>
              <div className="text-xs text-dark-500 mt-1 uppercase tracking-widest">Trustless</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl font-mono font-bold text-dark-900">~30s</div>
              <div className="text-xs text-dark-500 mt-1 uppercase tracking-widest">Claim Time</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl font-mono font-bold text-dark-900">0</div>
              <div className="text-xs text-dark-500 mt-1 uppercase tracking-widest">Paperwork</div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Travel Types */}
      <section>
        <div className="grid md:grid-cols-2 gap-[1px] bg-dark-200">
          <Card hover className="border-0">
            <CardContent className="p-8">
              <div className="w-10 h-10 border border-dark-200 flex items-center justify-center mb-4">
                <Plane className="w-5 h-5 text-dark-900" />
              </div>
              <h3 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">Flight Coverage</h3>
              <p className="text-dark-500 text-sm">
                Lock your flight ticket payment. Get automatic refunds for delays and cancellations.
              </p>
            </CardContent>
          </Card>

          <Card hover className="border-0">
            <CardContent className="p-8">
              <div className="w-10 h-10 border border-dark-200 flex items-center justify-center mb-4">
                <Train className="w-5 h-5 text-dark-900" />
              </div>
              <h3 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">Train Coverage</h3>
              <p className="text-dark-500 text-sm">
                Lock your train ticket payment. Get automatic refunds when delays happen.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-dark-900 mb-4 uppercase tracking-wider">
            Why InClaim?
          </h2>
          <p className="text-dark-500 max-w-2xl mx-auto text-sm">
            Traditional travel insurance requires trust. InClaim uses blockchain escrow for automatic, trustless refunds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-[1px] bg-dark-200">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 border border-dark-900 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-dark-900" />
                  </div>
                  <h3 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                    {feature.title}
                  </h3>
                  <p className="text-dark-500 text-sm">
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
          <h2 className="text-2xl font-bold text-dark-900 mb-4 uppercase tracking-wider">
            How It Works
          </h2>
          <p className="text-dark-500 max-w-2xl mx-auto text-sm">
            Four simple steps to trustless travel compensation
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-dark-200">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className="h-full border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-mono font-bold text-dark-200 mb-4">
                    {step.number}
                  </div>
                  <div className="w-10 h-10 border border-dark-200 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-5 h-5 text-dark-700" />
                  </div>
                  <h3 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                    {step.title}
                  </h3>
                  <p className="text-dark-500 text-sm">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <Card className="bg-dark-900 border-dark-200">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-dark mb-4 uppercase tracking-wider">
              Ready to get started?
            </h2>
            <p className="text-dark-400 mb-8 max-w-xl mx-auto text-sm">
              File in a flash, get your cash. Lock your ticket payment in under a minute. Get automatic refunds if delays happen.
            </p>
            {isConnected ? (
              <Link to="/create">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-dark text-dark-900 border-dark-300 hover:bg-dark-50 hover:text-white"
                >
                  Create Policy
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                className="bg-dark text-dark-900 border-dark-300 hover:bg-dark-50 hover:text-white"
                onClick={() => open()}
              >
                Connect Wallet
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
