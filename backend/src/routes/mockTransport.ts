import { Router, Request, Response } from 'express';
import { MockTransportAPI, MockConfig } from '../services/mockTransportApi';

const router = Router();
const transportApi = new MockTransportAPI();

router.get('/status', async (req: Request, res: Response) => {
  try {
    const { tripId, date } = req.query;

    if (!tripId || !date) {
      return res.status(400).json({ 
        error: 'tripId and date query parameters are required' 
      });
    }

    let tripIdHash: string;
    if (typeof tripId === 'string' && tripId.startsWith('0x')) {
      tripIdHash = tripId;
    } else {
      const { keccak256, toUtf8Bytes } = await import('ethers');
      tripIdHash = keccak256(toUtf8Bytes(tripId as string));
    }

    const timestamp = typeof date === 'string' 
      ? (date.includes('-') ? Math.floor(new Date(date).getTime() / 1000) : parseInt(date))
      : parseInt(date as string);

    const status = await transportApi.getStatus(tripIdHash, timestamp);

    res.json({
      tripId,
      tripIdHash,
      date: new Date(timestamp * 1000).toISOString(),
      ...status,
    });

  } catch (error: any) {
    console.error('Mock status error:', error);
    res.status(500).json({ 
      error: 'Failed to get transport status',
      message: error.message 
    });
  }
});

router.post('/config', async (req: Request, res: Response) => {
  try {
    const config: Partial<MockConfig> = req.body;

    transportApi.setConfig(config);

    res.json({
      success: true,
      message: 'Mock configuration updated',
      currentConfig: transportApi.getConfig(),
    });

  } catch (error: any) {
    console.error('Mock config error:', error);
    res.status(500).json({ 
      error: 'Failed to update configuration',
      message: error.message 
    });
  }
});

router.get('/config', (req: Request, res: Response) => {
  res.json({
    config: transportApi.getConfig(),
    description: {
      defaultStatus: 'Default status for all trips (ON_TIME, DELAYED, CANCELLED)',
      defaultDelayMinutes: 'Default delay in minutes when status is DELAYED',
      randomize: 'If true, randomly generate status for each request',
      tripOverrides: 'Object mapping tripIdHash to specific status overrides',
    },
    examples: {
      setDelayed: {
        method: 'POST',
        body: { defaultStatus: 'DELAYED', defaultDelayMinutes: 90 }
      },
      setCancelled: {
        method: 'POST', 
        body: { defaultStatus: 'CANCELLED' }
      },
      setOnTime: {
        method: 'POST',
        body: { defaultStatus: 'ON_TIME' }
      },
      enableRandom: {
        method: 'POST',
        body: { randomize: true }
      },
    }
  });
});

router.post('/trip/:tripIdHash', (req: Request, res: Response) => {
  try {
    const { tripIdHash } = req.params;
    const { status, delayMinutes, cancelled } = req.body;

    transportApi.setTripOverride(tripIdHash, {
      status: status || 'DELAYED',
      delayMinutes: delayMinutes || 0,
      cancelled: cancelled || false,
    });

    res.json({
      success: true,
      message: `Override set for trip ${tripIdHash}`,
      override: { status, delayMinutes, cancelled },
    });

  } catch (error: any) {
    console.error('Set trip override error:', error);
    res.status(500).json({ 
      error: 'Failed to set trip override',
      message: error.message 
    });
  }
});

router.delete('/trip/:tripIdHash', (req: Request, res: Response) => {
  try {
    const { tripIdHash } = req.params;

    transportApi.removeTripOverride(tripIdHash);

    res.json({
      success: true,
      message: `Override removed for trip ${tripIdHash}`,
    });

  } catch (error: any) {
    console.error('Remove trip override error:', error);
    res.status(500).json({ 
      error: 'Failed to remove trip override',
      message: error.message 
    });
  }
});

export { router as mockTransportRouter };
