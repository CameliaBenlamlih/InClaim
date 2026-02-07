import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';

import DemoLanding from './pages/demo/DemoLanding';
import DemoResults from './pages/demo/DemoResults';
import DemoCheckout from './pages/demo/DemoCheckout';
import DemoTrip from './pages/demo/DemoTrip';

export default function App() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />

          {}
          <Route path="/book" element={<DemoLanding />} />
          <Route path="/book/results" element={<DemoResults />} />
          <Route path="/book/checkout" element={<DemoCheckout />} />
          <Route path="/book/trip/:bookingId" element={<DemoTrip />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
