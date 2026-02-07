import { Router, Request, Response } from 'express';
import { ContractService } from '../services/contractService';
import { RealFDCService } from '../services/realFdcService';
import { RealTransportAPI } from '../services/realTransportApi';
import { getRefundPercent, calculateRefundWei, getPolicyBreakdown } from '../utils/refund';

const router = Router();
const contractService = new ContractService();
const fdcService = new RealFDCService();
const transportApi = new RealTransportAPI();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { policyId } = req.body;

    if (!policyId) {
      return res.status(400).json({ error: 'Policy ID is required' });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing claim for Policy #${policyId}`);
    console.log('='.repeat(60));

    console.log('\n1. Fetching policy details...');
    const policy = await contractService.getPolicy(policyId);
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (policy.status !== 0) {
      const statusNames = ['ACTIVE', 'CLAIMED', 'REJECTED', 'EXPIRED'];
      return res.status(400).json({ 
        error: `Policy is not active. Current status: ${statusNames[policy.status]}` 
      });
    }

    console.log(`   Trip ID Hash: ${policy.tripIdHash}`);
    console.log(`   Travel Date: ${new Date(Number(policy.travelDate) * 1000).toISOString()}`);
    console.log(`   Threshold: ${policy.thresholdMinutes} minutes`);
    console.log(`   Payout: ${policy.payoutAmount} wei`);

    console.log('\n2. Querying transport status...');
    const transportStatus = await transportApi.getStatus(
      policy.tripIdHash,
      Number(policy.travelDate)
    );
    
    console.log(`   Status: ${transportStatus.status}`);
    console.log(`   Delay: ${transportStatus.delayMinutes} minutes`);
    console.log(`   Cancelled: ${transportStatus.cancelled}`);

    console.log('\n3. Creating FDC attestation...');
    const attestation = await fdcService.createAttestation({
      tripIdHash: policy.tripIdHash,
      travelDate: Number(policy.travelDate),
      cancelled: transportStatus.cancelled,
      delayMinutes: transportStatus.delayMinutes,
    });

    console.log(`   Attestation ID: ${attestation.attestationId}`);
    console.log(`   Merkle Proof: [${attestation.proof.merkleProof.length} elements]`);

    console.log('\n4. Registering attestation in verifier...');
    await contractService.registerAttestation(attestation.attestationId);
    console.log('   Attestation registered!');

    console.log('\n5. Submitting proof to contract...');
    const tripStatus = {
      tripIdHash: policy.tripIdHash,
      travelDate: BigInt(policy.travelDate),
      cancelled: transportStatus.cancelled,
      delayMinutes: transportStatus.delayMinutes,
      observedAt: BigInt(Math.floor(Date.now() / 1000)),
    };

    const tx = await contractService.submitTripProof(
      policyId,
      tripStatus,
      attestation.proof
    );

    console.log(`   Transaction Hash: ${tx.hash}`);
    console.log('   Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log(`   Confirmed in block ${receipt?.blockNumber}`);

    const refundPercent = getRefundPercent(transportStatus.delayMinutes, transportStatus.cancelled);
    const { refundAmountWei } = calculateRefundWei(
      BigInt(policy.payoutAmount), 
      transportStatus.delayMinutes, 
      transportStatus.cancelled
    );
    
    const qualifies = refundPercent > 0;
    const outcome = qualifies ? 'CLAIMED' : 'REJECTED';

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Claim Result: ${outcome}`);
    console.log(`Refund: ${refundPercent}% (${refundAmountWei.toString()} wei)`);
    console.log('='.repeat(60));

    res.json({
      success: true,
      policyId,
      outcome,
      delayMinutes: transportStatus.delayMinutes,
      cancelled: transportStatus.cancelled,
      refundPercent,
      refundAmount: refundAmountWei.toString(),
      ticketPrice: policy.payoutAmount.toString(),
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      explorerUrl: `https://coston2-explorer.flare.network/tx/${tx.hash}`,
      policyBreakdown: getPolicyBreakdown(),
    });

  } catch (error: any) {
    console.error('Claim error:', error);
    res.status(500).json({ 
      error: 'Failed to process claim',
      message: error.message 
    });
  }
});

router.get('/:policyId', async (req: Request, res: Response) => {
  try {
    const { policyId } = req.params;
    
    const policy = await contractService.getPolicy(policyId);
    
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    const statusNames = ['ACTIVE', 'CLAIMED', 'REJECTED', 'EXPIRED'];

    res.json({
      policyId,
      status: statusNames[policy.status],
      statusCode: policy.status,
      owner: policy.owner,
      tripIdHash: policy.tripIdHash,
      travelDate: Number(policy.travelDate),
      thresholdMinutes: policy.thresholdMinutes,
      ticketPrice: policy.payoutAmount.toString(),
      deadline: Number(policy.deadline),
      policyBreakdown: getPolicyBreakdown(),
    });

  } catch (error: any) {
    console.error('Get policy error:', error);
    res.status(500).json({ 
      error: 'Failed to get policy',
      message: error.message 
    });
  }
});

export { router as claimRouter };
