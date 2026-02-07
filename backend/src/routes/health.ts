import { Router, Request, Response } from 'express';
import { RealTransportAPI } from '../services/realTransportApi';
import { RealFDCService } from '../services/realFdcService';
import { ContractService } from '../services/contractService';
import { verifySmtpConnection, sendBookingConfirmation } from '../services/emailService';

const router = Router();

router.get('/test-email', async (req: Request, res: Response) => {
  try {
    const { sendTo } = req.query;
    
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (!smtpUser || !smtpPass) {
      return res.status(400).json({
        success: false,
        error: 'SMTP not configured',
        message: 'Add SMTP_USER and SMTP_PASS to backend/.env',
      });
    }
    
    console.log('Testing SMTP connection...');
    const connectionValid = await verifySmtpConnection();
    
    if (!connectionValid) {
      return res.status(400).json({
        success: false,
        error: 'SMTP connection failed',
        message: 'Check your Gmail App Password. Make sure 2-Step Verification is enabled.',
        troubleshooting: {
          step1: 'Go to https://myaccount.google.com/security',
          step2: 'Enable 2-Step Verification if not already enabled',
          step3: 'Go to https://myaccount.google.com/apppasswords',
          step4: 'Generate a NEW App Password (select "Mail" and "Other")',
          step5: 'Copy the 16-character password (no spaces)',
          step6: 'Update SMTP_PASS in backend/.env',
          step7: 'Restart the backend server',
        },
      });
    }
    
    if (sendTo) {
      const testBooking = {
        bookingId: 'TEST-PNR',
        quoteId: 'test',
        providerId: 'test',
        providerName: 'Test Airline',
        tripId: 'TEST123',
        tripType: 'flight' as const,
        origin: 'LHR',
        destination: 'CDG',
        departureTime: new Date(),
        arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        passengerName: 'Test User',
        passengerEmail: sendTo as string,
        price: 199.99,
        currency: 'USDC' as const,
        status: 'confirmed' as const,
        confirmationEmail: false,
        createdAt: new Date(),
      };
      
      const sent = await sendBookingConfirmation(testBooking);
      
      return res.json({
        success: sent,
        message: sent ? `Test email sent to ${sendTo}` : 'Failed to send test email',
        smtpConfigured: true,
      });
    }
    
    res.json({
      success: true,
      message: 'SMTP connection verified successfully',
      smtpUser,
      tip: 'Add ?sendTo=your@email.com to send a test email',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/status', async (req: Request, res: Response) => {
  try {
    const transportApi = new RealTransportAPI();
    const fdcService = new RealFDCService();
    const contractService = new ContractService();

    const [relayerBalance, poolBalance, policyCount] = await Promise.all([
      contractService.getRelayerBalance(),
      contractService.getPoolBalance(),
      contractService.getPolicyCount(),
    ]);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'DelayClaim Backend - Real Data Edition',
      components: {
        transportAPI: {
          ...transportApi.getStatus(),
          realDataActive: transportApi.isUsingRealAPI(),
        },
        fdcService: fdcService.getStatus(),
        contract: {
          relayerAddress: contractService.getRelayerAddress(),
          relayerBalance: `${relayerBalance} C2FLR`,
          poolBalance: `${poolBalance} C2FLR`,
          totalPolicies: policyCount,
        },
      },
      network: {
        name: 'Flare Coston2 Testnet',
        chainId: 114,
        rpc: process.env.RPC_URL,
        explorer: 'https://coston2-explorer.flare.network',
      },
      realDataStatus: {
        isRealData: transportApi.isUsingRealAPI(),
        message: transportApi.isUsingRealAPI()
          ? 'Using real flight data from AviationStack'
          : 'Using mock data - configure AVIATIONSTACK_API_KEY for real data',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

router.get('/test-real-data', async (req: Request, res: Response) => {
  try {
    const transportApi = new RealTransportAPI();

    if (!transportApi.isUsingRealAPI()) {
      return res.status(400).json({
        success: false,
        error: 'Real API not configured',
        message: 'Set AVIATIONSTACK_API_KEY in backend/.env to test real data',
        setup: {
          step1: 'Sign up at https://aviationstack.com/signup/free (100 free requests/month)',
          step2: 'Get your API key from the dashboard',
          step3: 'Add to backend/.env: AVIATIONSTACK_API_KEY=your_key_here',
          step4: 'Optionally set TEST_FLIGHT_CODE=BA123 (or any real flight)',
          step5: 'Restart backend: npm run dev',
        },
      });
    }

    console.log('\nTesting real API connection...');
    const testResult = await transportApi.testConnection();

    if (testResult.success) {
      console.log('Real API test successful!');
      res.json({
        success: true,
        message: testResult.message,
        data: testResult.data,
        proof: {
          source: 'AviationStack API',
          timestamp: new Date().toISOString(),
          apiConfigured: true,
        },
      });
    } else {
      console.log('Real API test failed');
      res.status(400).json({
        success: false,
        message: testResult.message,
      });
    }
  } catch (error: any) {
    console.error('Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/fdc-info', (req: Request, res: Response) => {
  res.json({
    currentImplementation: RealFDCService.getFDCInfo(),
    upgradeInstructions: {
      title: 'How to upgrade to full FDC trustless verification',
      steps: [
        {
          step: 1,
          title: 'Understand the limitation',
          description: 'FDC JsonApi attestations require API sources to be whitelisted by Flare attestation providers',
          currentStatus: 'AviationStack is not whitelisted',
        },
        {
          step: 2,
          title: 'Request whitelisting',
          description: 'Contact Flare team via Discord or support to request AviationStack whitelisting',
          links: {
            discord: 'https://discord.com/invite/flarenetwork',
            docs: 'https://dev.flare.network/fdc/overview',
          },
        },
        {
          step: 3,
          title: 'Configure FDC Hub',
          description: 'Once whitelisted, add FDC_HUB_ADDRESS to backend/.env',
          value: 'Get from FlareContractRegistry at 0xaD67FE66FCF317f0824f169c8FC99390C964f5c4',
        },
        {
          step: 4,
          title: 'Implement FDC request flow',
          description: 'Update RealFDCService to call FdcHub.requestAttestation()',
          note: 'Code structure already supports this upgrade path',
        },
        {
          step: 5,
          title: 'Deploy real FDC verifier',
          description: 'Replace MockFDCVerifier with FdcVerification contract',
          command: 'Update DelayClaimInsurance constructor with real verifier address',
        },
      ],
      currentBenefit: {
        title: 'What you get NOW with this hybrid approach',
        benefits: [
          'Real flight data from AviationStack API',
          'Actual delays, cancellations, and status',
          '30-60 second data freshness',
          'Provable transactions on Coston2 explorer',
          'Same contract interface (easy upgrade later)',
          'Relayer is trusted (not fully trustless yet)',
        ],
      },
      fullFDCBenefit: {
        title: 'What you get AFTER whitelisting',
        benefits: [
          'Everything from hybrid mode, PLUS:',
          'Cryptographic proof of data authenticity',
          'No trust in relayer required',
          'Merkle proof verification on-chain',
          'True decentralization',
          'Production-ready security',
        ],
      },
    },
  });
});

router.post('/test-claim-flow', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.body;
    const testTripId = tripId || 'TEST_FLIGHT_123';

    console.log(`\nTesting claim flow with trip: ${testTripId}`);

    const transportApi = new RealTransportAPI();
    const fdcService = new RealFDCService();

    console.log('Step 1: Fetching transport status...');
    const tripIdHash = `0x${'0'.repeat(64)}`;
    const travelDate = Math.floor(Date.now() / 1000) - 3600;
    
    const transportStatus = await transportApi.getStatus(tripIdHash, travelDate);
    console.log(`  Status: ${transportStatus.status}, Delay: ${transportStatus.delayMinutes}min`);

    console.log('Step 2: Creating attestation...');
    const attestation = await fdcService.createAttestation({
      tripIdHash,
      travelDate,
      cancelled: transportStatus.cancelled,
      delayMinutes: transportStatus.delayMinutes,
    });
    console.log(`  Attestation ID: ${attestation.attestationId}`);

    console.log('Claim flow test completed successfully');

    res.json({
      success: true,
      message: 'Claim flow test completed successfully',
      flowSteps: {
        step1_transportStatus: {
          status: transportStatus.status,
          delayMinutes: transportStatus.delayMinutes,
          cancelled: transportStatus.cancelled,
          source: transportStatus.source,
          isRealData: transportApi.isUsingRealAPI(),
        },
        step2_attestation: {
          attestationId: attestation.attestationId,
          proofElements: attestation.proof.merkleProof.length,
          observedAt: new Date(attestation.tripStatus.observedAt * 1000).toISOString(),
        },
        step3_wouldSubmit: {
          note: 'This is a dry-run - no transaction submitted',
          nextStep: 'Use POST /api/claim with a real policyId to submit on-chain',
        },
      },
      proof: {
        realDataUsed: transportApi.isUsingRealAPI(),
        dataSource: transportStatus.source,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Test flow error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as healthRouter };
