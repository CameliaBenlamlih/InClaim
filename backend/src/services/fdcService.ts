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
 * FDC Service - Flare Data Connector Integration
 * 
 * In production, this would:
 * 1. Submit attestation request to FDC
 * 2. Wait for attestation to be finalized
 * 3. Retrieve Merkle proof from FDC
 * 
 * For hackathon demo, we simulate the FDC flow with deterministic proofs
 */
export class FDCService {
  private attestationCounter = 0;

  constructor() {
    console.log('FDCService initialized (Demo Mode)');
    console.log('  In production, this would connect to Flare Data Connector');
  }

  /**
   * Create an attestation for transport status
   * 
   * Production flow:
   * 1. Call FDC Hub's requestAttestation()
   * 2. Wait for voting round to finalize
   * 3. Retrieve proof from FDC
   * 
   * Demo flow:
   * - Generate deterministic attestation ID
   * - Create mock Merkle proof
   */
  async createAttestation(request: AttestationRequest): Promise<AttestationResult> {
    console.log('Creating FDC attestation...');
    console.log(`  Trip ID Hash: ${request.tripIdHash}`);
    console.log(`  Travel Date: ${new Date(request.travelDate * 1000).toISOString()}`);
    console.log(`  Cancelled: ${request.cancelled}`);
    console.log(`  Delay Minutes: ${request.delayMinutes}`);

    // Simulate FDC attestation delay
    await this.simulateAttestationDelay();

    // Generate attestation ID from request data
    const attestationId = this.generateAttestationId(request);
    
    // Generate mock Merkle proof
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

    console.log('Attestation created successfully');
    console.log(`  Attestation ID: ${attestationId}`);

    return result;
  }

  /**
   * Generate deterministic attestation ID from request data
   */
  private generateAttestationId(request: AttestationRequest): string {
    this.attestationCounter++;
    
    // Create unique attestation ID from request data + counter + timestamp
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
   * Generate mock Merkle proof
   * 
   * In production, this would be retrieved from FDC after attestation is finalized
   */
  private generateMerkleProof(attestationId: string, request: AttestationRequest): string[] {
    // Generate deterministic proof elements
    const proof: string[] = [];

    // Create 3 proof elements (typical Merkle tree depth)
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
   * In production, waiting for voting round finalization takes ~90 seconds
   */
  private async simulateAttestationDelay(): Promise<void> {
    // For demo, use shorter delay (1-2 seconds)
    const delay = Math.random() * 1000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Verify an attestation (for testing)
   */
  async verifyAttestation(attestationId: string): Promise<boolean> {
    // In demo mode, all properly formatted attestations are valid
    return attestationId.startsWith('0x') && attestationId.length === 66;
  }

  /**
   * Get FDC status info
   */
  getStatus(): object {
    return {
      mode: 'demo',
      description: 'Using simulated FDC attestations',
      productionNote: 'In production, connect to Flare Data Connector for trustless verification',
      attestationsCreated: this.attestationCounter,
    };
  }
}
