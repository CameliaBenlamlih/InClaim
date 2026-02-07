import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreatePolicyPage from './pages/CreatePolicyPage';
import MyPoliciesPage from './pages/MyPoliciesPage';
import ClaimPage from './pages/ClaimPage';
import HowItWorksPage from './pages/HowItWorksPage';

export default function App() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/create" element={<CreatePolicyPage />} />
          <Route path="/policies" element={<MyPoliciesPage />} />
          <Route path="/claim/:policyId" element={<ClaimPage />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
