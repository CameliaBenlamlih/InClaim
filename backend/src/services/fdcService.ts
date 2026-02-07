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

export class FDCService {
  private attestationCounter = 0;

  constructor() {
    console.log('FDCService initialized (Demo Mode)');
    console.log('  In production, this would connect to Flare Data Connector');
  }

  
  async createAttestation(request: AttestationRequest): Promise<AttestationResult> {
    console.log('Creating FDC attestation...');
    console.log(`  Trip ID Hash: ${request.tripIdHash}`);
    console.log(`  Travel Date: ${new Date(request.travelDate * 1000).toISOString()}`);
    console.log(`  Cancelled: ${request.cancelled}`);
    console.log(`  Delay Minutes: ${request.delayMinutes}`);

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

    console.log('Attestation created successfully');
    console.log(`  Attestation ID: ${attestationId}`);

    return result;
  }

  
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

  
  private generateMerkleProof(attestationId: string, request: AttestationRequest): string[] {
    const proof: string[] = [];

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

  
  private async simulateAttestationDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  
  async verifyAttestation(attestationId: string): Promise<boolean> {
    return attestationId.startsWith('0x') && attestationId.length === 66;
  }

  
  getStatus(): object {
    return {
      mode: 'demo',
      description: 'Using simulated FDC attestations',
      productionNote: 'In production, connect to Flare Data Connector for trustless verification',
      attestationsCreated: this.attestationCounter,
    };
  }
}
