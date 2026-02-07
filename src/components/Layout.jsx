import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { motion } from 'framer-motion';
import { Home, Info, Plus, FileText, Shield, Menu, X, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '../lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/how-it-works', label: 'How It Works', icon: Info },
  { path: '/demo', label: 'Demo Flow', icon: Plus },
  { path: '/create', label: 'Create Policy', icon: Plus },
  { path: '/policies', label: 'My Policies', icon: FileText },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark text-dark-900">
      <div className="texture-grid" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 border border-dark-900 flex items-center justify-center group-hover:bg-dark-900 group-hover:text-dark transition-all duration-200">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-dark-900 uppercase">
                InClaim
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'text-dark-900'
                        : 'text-dark-500 hover:text-dark-900'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-dark-900"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Wallet Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => open()}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200 ${
                  isConnected
                    ? 'text-green-400 border border-green-400/30'
                    : 'bg-dark-900 text-dark hover:bg-white'
                }`}
              >
                <div className={`w-2 h-2 ${isConnected ? 'bg-green-400' : 'bg-dark-400'}`} />
                {isConnected ? shortenAddress(address) : 'Connect Wallet'}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-dark-500 hover:text-dark-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-dark-200 bg-dark"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'text-dark-900 border-l-2 border-dark-900'
                        : 'text-dark-500 hover:text-dark-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  open();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-wider bg-dark-900 text-dark hover:bg-white transition-all"
              >
                <div className={`w-2 h-2 ${isConnected ? 'bg-green-400' : 'bg-dark-400'}`} />
                {isConnected ? shortenAddress(address) : 'Connect Wallet'}
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-dark-500 uppercase tracking-widest font-mono">
              <Shield className="w-3 h-3" />
              <span>InClaim — Powered by Flare Data Connector</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-dark-500 font-mono uppercase tracking-wider">
              <a
                href="https://coston2-explorer.flare.network"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-dark-900 transition-colors"
              >
                Coston2 Explorer
              </a>
              <span className="text-dark-300">|</span>
              <a
                href="https://flare.network"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-dark-900 transition-colors"
              >
                Flare Network
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
