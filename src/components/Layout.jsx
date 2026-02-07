import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { motion } from 'framer-motion';
import { Home, Info, Shield, Menu, X, Plane } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '../lib/utils';
import Logo from './Logo';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/how-it-works', label: 'How It Works', icon: Info },
  { path: '/book', label: 'Book & Protect', icon: Plane },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-body text-dark-900 flex flex-col">

      {}
      <header className="sticky top-0 z-50 bg-body px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between h-14">
            {}
            <Link to="/" className="flex items-center gap-2 group">
              <Logo size="md" />
            </Link>

            {}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-dark-900'
                        : 'text-dark-500 hover:text-dark-900'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {}
            <div className="flex items-center gap-4">
              <button
                onClick={() => open()}
                className={`hidden sm:flex items-center gap-2 px-5 py-2 text-[13px] font-medium rounded-pill transition-all duration-200 ${
                  isConnected
                    ? 'text-dark-900 border border-dark-200 bg-surface'
                    : 'bg-dark-900 text-white hover:opacity-90'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-dark-400'}`} />
                {isConnected ? shortenAddress(address) : 'Sign in'}
              </button>

              {}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-dark-500 hover:text-dark-900"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-dark-200 bg-body"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-dark-900 border-l-2 border-accent'
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-dark-900 text-white rounded-pill hover:opacity-90 transition-all"
              >
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-dark-400'}`} />
                {isConnected ? shortenAddress(address) : 'Sign in'}
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-8 relative z-10">
        {children}
      </main>

      {}
      <footer className="border-t border-dark-200 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <Logo size="sm" />
              <span className="ml-1">— Powered by Flare Data Connector</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-dark-500">
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
