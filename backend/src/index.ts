import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { claimRouter } from './routes/claim';
import { mockTransportRouter } from './routes/mockTransport';
import { healthRouter } from './routes/health';
import demoRouter from './routes/demo';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'InClaim Backend',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/claim', claimRouter);
app.use('/api/mock', mockTransportRouter);
app.use('/api/health', healthRouter);
app.use('/api/demo', demoRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`InClaim Backend running on http://localhost:${PORT}`);
});

export default app;
