/**
 * FDC Verification Service
 * CRITICAL: All settlements MUST pass FDC verification
 * No verification = No settlement/refund
 */

import type { TripStatus } from './statusOracleService';

export interface FDCVerificationRequest {
  tripId: string;
  tripType: 'flight' | 'train';
  scheduledDeparture: Date;
  actualDeparture?: Date;
  status: string;
  delayMinutes: number;
  dataSourceHash: string; // Hash of the external data source response
}

export interface FDCVerificationResult {
  verified: boolean;
  verificationId: string;
  timestamp: Date;
  attestationHash?: string; // FDC attestation proof hash
  fdcRequestId?: string;
  errorReason?: string;
  dataIntegrity: 'valid' | 'tampered' | 'unverifiable';
}

/**
 * Mock FDC Verifier (for demo without real FDC connection)
 * In production, this connects to Flare Data Connector
 */
class MockFDCVerifier {
  private verificationCache = new Map<string, FDCVerificationResult>();
  
  async verify(request: FDCVerificationRequest): Promise<FDCVerificationResult> {
    // Simulate FDC API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const verificationId = `FDC-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Simulate 98% success rate (FDC can fail occasionally)
    const success = Math.random() > 0.02;
    
    if (!success) {
      return {
        verified: false,
        verificationId,
        timestamp: new Date(),
        errorReason: 'FDC attestation provider unavailable. Retry later.',
        dataIntegrity: 'unverifiable',
      };
    }
    
    // Simulate data integrity check
    const dataValid = Math.random() > 0.01; // 99% data integrity
    
    const result: FDCVerificationResult = {
      verified: dataValid,
      verificationId,
      timestamp: new Date(),
      attestationHash: dataValid 
        ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
        : undefined,
      fdcRequestId: `FDC-REQ-${Math.floor(Math.random() * 1000000)}`,
      dataIntegrity: dataValid ? 'valid' : 'tampered',
      errorReason: dataValid ? undefined : 'Data integrity check failed - source data potentially tampered',
    };
    
    this.verificationCache.set(verificationId, result);
    
    console.log(`🔐 FDC Verification: ${result.verified ? '✅ VERIFIED' : '❌ FAILED'}`);
    console.log(`   Verification ID: ${verificationId}`);
    console.log(`   Trip: ${request.tripId} (${request.tripType})`);
    console.log(`   Status: ${request.status}, Delay: ${request.delayMinutes}min`);
    if (result.attestationHash) {
      console.log(`   Attestation Hash: ${result.attestationHash.substring(0, 20)}...`);
    }
    
    return result;
  }
  
  async getVerification(verificationId: string): Promise<FDCVerificationResult | null> {
    return this.verificationCache.get(verificationId) || null;
  }
}

/**
 * Real FDC Verifier (for production)
 * Connects to Flare Data Connector smart contract
 */
class RealFDCVerifier {
  private fdcContractAddress: string;
  private attestationProviders: string[];
  
  constructor(config: { contractAddress: string; providers: string[] }) {
    this.fdcContractAddress = config.contractAddress;
    this.attestationProviders = config.providers;
  }
  
  async verify(request: FDCVerificationRequest): Promise<FDCVerificationResult> {
    // TODO: Implement real FDC smart contract interaction
    // 1. Submit attestation request to FDC
    // 2. Wait for consensus from attestation providers
    // 3. Verify Merkle proof
    // 4. Return attestation hash
    
    throw new Error('Real FDC verification not implemented. Use mock verifier or configure FDC contract.');
  }
  
  async getVerification(verificationId: string): Promise<FDCVerificationResult | null> {
    throw new Error('Real FDC verification not implemented.');
  }
}

// Singleton verifier instance
let verifier: MockFDCVerifier | RealFDCVerifier;

export function initializeFDCVerifier(useMock: boolean = true, config?: any) {
  if (useMock) {
    verifier = new MockFDCVerifier();
  } else {
    if (!config?.contractAddress || !config?.providers) {
      throw new Error('FDC configuration required for real verifier');
    }
    verifier = new RealFDCVerifier(config);
  }
}

export async function verifyTripStatus(
  tripStatus: TripStatus,
  dataSourceHash: string
): Promise<FDCVerificationResult> {
  if (!verifier) {
    initializeFDCVerifier(true); // Default to mock
  }
  
  const request: FDCVerificationRequest = {
    tripId: tripStatus.tripId,
    tripType: tripStatus.tripType,
    scheduledDeparture: tripStatus.scheduledDeparture,
    actualDeparture: tripStatus.actualDeparture,
    status: tripStatus.status,
    delayMinutes: tripStatus.delayMinutes,
    dataSourceHash,
  };
  
  return verifier.verify(request);
}

export async function getFDCVerification(verificationId: string): Promise<FDCVerificationResult | null> {
  if (!verifier) {
    initializeFDCVerifier(true);
  }
  return verifier.getVerification(verificationId);
}

// Initialize with mock by default
initializeFDCVerifier(true);
