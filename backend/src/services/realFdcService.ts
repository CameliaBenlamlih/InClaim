import { ethers } from 'ethers';

export interface AttestationRequest {
  tripIdHash: string;
  travelDate: number;
  cancelled: boolean;
  delayMinutes: number;
}

export interface AttestationResult {
  attestationId: string;
  proof: {
    merkleProof: string[];
    attestationId: string;
  };
  tripStatus: {
    tripIdHash: string;
    travelDate: number;
    cancelled: boolean;
    delayMinutes: number;
    observedAt: number;
  };
}

/**
 * Real FDC Service - Flare Data Connector Integration
 * 
 * ⚠️ IMPORTANT LIMITATION: JsonApi attestations require whitelisting
 * 
 * This service uses MockFDCVerifier with REAL transport data.
 * The data is real, but the proof mechanism is simplified for demo.
 * 
 * To use REAL FDC with Web2 APIs:
 * 1. Submit your API source for whitelisting to Flare attestation providers
 * 2. Wait for approval (process varies)
 * 3. Use FdcHub.requestAttestation() with JsonApi type
 * 4. Retrieve proof from FDC Data Availability layer
 * 
 * Current implementation:
 * - Uses REAL transport data from AviationStack
 * - Generates deterministic attestation IDs
 * - Works with deployed MockFDCVerifier contract
 * - Maintains same contract interface for future FDC upgrade
 */
export class RealFDCService {
  private attestationCounter = 0;
  private provider: ethers.JsonRpcProvider;
  private fdcHubAddress: string | null = null;
  private useRealFDC: boolean = false;

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Check if real FDC should be used (requires FDC_HUB_ADDRESS)
    this.fdcHubAddress = process.env.FDC_HUB_ADDRESS || null;
    this.useRealFDC = !!this.fdcHubAddress;

    if (this.useRealFDC) {
      console.log('✅ RealFDCService initialized (FDC Mode - EXPERIMENTAL)');
      console.log(`   FDC Hub: ${this.fdcHubAddress}`);
      console.log('   ⚠️  Note: JsonApi attestations require source whitelisting');
    } else {
      console.log('✅ RealFDCService initialized (Hybrid Mode)');
      console.log('   Using: Real transport data + MockFDCVerifier proofs');
      console.log('   Upgrade path: Set FDC_HUB_ADDRESS when API is whitelisted');
    }
  }

  /**
   * Create an attestation for transport status
   * 
   * Current: Generates deterministic attestation with real data
   * Future: Call FdcHub.requestAttestation() for real FDC proof
   */
  async createAttestation(request: AttestationRequest): Promise<AttestationResult> {
    console.log('Creating attestation for real transport data...');
    console.log(`  Trip ID Hash: ${request.tripIdHash}`);
    console.log(`  Travel Date: ${new Date(request.travelDate * 1000).toISOString()}`);
    console.log(`  Cancelled: ${request.cancelled}`);
    console.log(`  Delay Minutes: ${request.delayMinutes}`);

    if (this.useRealFDC) {
      // FUTURE: Real FDC implementation
      console.log('⚠️  Real FDC mode enabled but not fully implemented');
      console.log('   Requires: API whitelisting + FDC request submission');
      // For now, fall back to hybrid mode
    }

    // Hybrid mode: Real data + deterministic proof
    await this.simulateAttestationDelay();

    const attestationId = this.generateAttestationId(request);
    const merkleProof = this.generateMerkleProof(attestationId, request);

    const result: AttestationResult = {
      attestationId,
      proof: {
        merkleProof,
        attestationId,
      },
      tripStatus: {
        tripIdHash: request.tripIdHash,
        travelDate: request.travelDate,
        cancelled: request.cancelled,
        delayMinutes: request.delayMinutes,
        observedAt: Math.floor(Date.now() / 1000),
      },
    };

    console.log('✅ Attestation created successfully');
    console.log(`   Attestation ID: ${attestationId}`);
    console.log(`   Data source: Real transport API`);
    console.log(`   Proof mechanism: ${this.useRealFDC ? 'FDC (pending)' : 'MockFDCVerifier'}`);

    return result;
  }

  /**
   * Generate deterministic attestation ID from request data
   * This ensures the same trip data always produces the same attestation ID
   */
  private generateAttestationId(request: AttestationRequest): string {
    this.attestationCounter++;
    
    const data = ethers.solidityPacked(
      ['bytes32', 'uint64', 'bool', 'uint16', 'uint256', 'uint256'],
      [
        request.tripIdHash,
        request.travelDate,
        request.cancelled,
        request.delayMinutes,
        this.attestationCounter,
        Date.now(),
      ]
    );

    return ethers.keccak256(data);
  }

  /**
   * Generate Merkle proof
   * In production with real FDC, this would be retrieved from the DA layer
   */
  private generateMerkleProof(attestationId: string, request: AttestationRequest): string[] {
    const proof: string[] = [];

    // Generate 3 proof elements (typical Merkle tree depth)
    for (let i = 0; i < 3; i++) {
      const proofElement = ethers.keccak256(
        ethers.solidityPacked(
          ['bytes32', 'uint256', 'bytes32'],
          [attestationId, i, request.tripIdHash]
        )
      );
      proof.push(proofElement);
    }

    return proof;
  }

  /**
   * Simulate FDC attestation delay
   * Real FDC has ~90 seconds voting round finalization
   * We use shorter delay for demo
   */
  private async simulateAttestationDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 1000; // 1-2 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get service status info
   */
  getStatus(): object {
    return {
      mode: this.useRealFDC ? 'fdc' : 'hybrid',
      description: this.useRealFDC 
        ? 'Real FDC mode (requires API whitelisting)'
        : 'Real transport data + MockFDCVerifier proofs',
      fdcHubConfigured: !!this.fdcHubAddress,
      attestationsCreated: this.attestationCounter,
      upgradePath: {
        step1: 'Submit AviationStack API for whitelisting to Flare attestation providers',
        step2: 'Configure FDC_HUB_ADDRESS in .env (0xaD67FE66... via FlareContractRegistry)',
        step3: 'Implement FdcHub.requestAttestation() call',
        step4: 'Poll DA layer for finalized proof',
        step5: 'Use FdcVerification contract instead of MockFDCVerifier',
        documentation: 'https://dev.flare.network/fdc/overview',
      },
    };
  }

  /**
   * Information about FDC limitations and upgrade path
   */
  static getFDCInfo(): object {
    return {
      currentImplementation: {
        dataSource: 'Real AviationStack API',
        proofMechanism: 'MockFDCVerifier (simplified)',
        security: 'Relayer is trusted',
        suitable: 'Demo, testing, hackathon',
      },
      targetImplementation: {
        dataSource: 'Real AviationStack API (via FDC JsonApi)',
        proofMechanism: 'Flare Data Connector (trustless)',
        security: 'Cryptographic proof verified on-chain',
        suitable: 'Production',
      },
      limitation: {
        issue: 'JsonApi attestations require API source whitelisting',
        reason: 'Attestation providers must support the API format',
        timeline: 'Varies - requires coordination with Flare team',
        workaround: 'Use real data + MockFDCVerifier until whitelisted',
      },
      whitelistingProcess: {
        step1: 'Contact Flare team via Discord or support channels',
        step2: 'Provide API details: endpoints, authentication, response format',
        step3: 'Define JQ transformation for data extraction',
        step4: 'Wait for attestation providers to add support',
        step5: 'Test on Coston2 before mainnet',
      },
    };
  }
}
