import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreatePolicyPage from './pages/CreatePolicyPage';
import MyPoliciesPage from './pages/MyPoliciesPage';
import ClaimPage from './pages/ClaimPage';
import HowItWorksPage from './pages/HowItWorksPage';

// NEW: Demo purchase flow pages
import DemoLanding from './pages/demo/DemoLanding';
import DemoResults from './pages/demo/DemoResults';
import DemoCheckout from './pages/demo/DemoCheckout';
import DemoTrip from './pages/demo/DemoTrip';

export default function App() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Existing routes - UNCHANGED */}
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/create" element={<CreatePolicyPage />} />
          <Route path="/policies" element={<MyPoliciesPage />} />
          <Route path="/claim/:policyId" element={<ClaimPage />} />

          {/* NEW: Demo purchase flow routes */}
          <Route path="/demo" element={<DemoLanding />} />
          <Route path="/demo/results" element={<DemoResults />} />
          <Route path="/demo/checkout" element={<DemoCheckout />} />
          <Route path="/demo/trip/:bookingId" element={<DemoTrip />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
