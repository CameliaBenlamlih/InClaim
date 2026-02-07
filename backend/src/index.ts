import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { claimRouter } from './routes/claim';
import { mockTransportRouter } from './routes/mockTransport';
import { healthRouter } from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'DelayClaim Backend - Real Data Edition',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/claim', claimRouter);
app.use('/api/mock', mockTransportRouter);
app.use('/api/health', healthRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║            DelayClaim Backend - Real Data Edition          ║
║                   FDC Relayer Service                      ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                   ║
║                                                           ║
║  Core Endpoints:                                          ║
║  - POST /api/claim              Process claim with FDC    ║
║  - GET  /api/claim/:id          Get policy status         ║
║                                                           ║
║  Health & Testing:                                        ║
║  - GET  /api/health/status      System status & config    ║
║  - GET  /api/health/test-real-data  Test AviationStack   ║
║  - GET  /api/health/fdc-info    FDC upgrade path         ║
║  - POST /api/health/test-claim-flow  Dry-run claim       ║
║                                                           ║
║  Mock (Fallback):                                         ║
║  - GET  /api/mock/status        Mock transport status     ║
║  - POST /api/mock/config        Configure mock data       ║
║                                                           ║
║  Quick Test:                                              ║
║  curl http://localhost:${PORT}/api/health/status              ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
