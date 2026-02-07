import { ethers, Contract, Wallet, JsonRpcProvider } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABIs (minimal for required functions)
const INSURANCE_ABI = [
  'function getPolicy(uint256 policyId) view returns (tuple(address owner, uint8 tripType, bytes32 tripIdHash, uint64 travelDate, uint16 thresholdMinutes, uint256 payoutAmount, uint64 deadline, uint8 status, uint64 createdAt))',
  'function submitTripProof(uint256 policyId, tuple(bytes32 tripIdHash, uint64 travelDate, bool cancelled, uint16 delayMinutes, uint64 observedAt) tripStatus, tuple(bytes32[] merkleProof, bytes32 attestationId) proof)',
  'function policyCounter() view returns (uint256)',
  'function poolBalance() view returns (uint256)',
];

const VERIFIER_ABI = [
  'function registerAttestation(bytes32 attestationId)',
  'function attestationExists(bytes32 attestationId) view returns (bool)',
];

export interface Policy {
  owner: string;
  tripType: number;
  tripIdHash: string;
  travelDate: bigint;
  thresholdMinutes: number;
  payoutAmount: bigint;
  deadline: bigint;
  status: number;
  createdAt: bigint;
}

export interface TripStatus {
  tripIdHash: string;
  travelDate: bigint;
  cancelled: boolean;
  delayMinutes: number;
  observedAt: bigint;
}

export interface FDCProof {
  merkleProof: string[];
  attestationId: string;
}

export class ContractService {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private insuranceContract: Contract;
  private verifierContract: Contract;

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc';
    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const verifierAddress = process.env.FDC_VERIFIER_ADDRESS;

    if (!privateKey) {
      throw new Error('RELAYER_PRIVATE_KEY not configured');
    }

    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS not configured');
    }

    this.provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, this.provider);
    
    this.insuranceContract = new Contract(contractAddress, INSURANCE_ABI, this.wallet);
    
    if (verifierAddress) {
      this.verifierContract = new Contract(verifierAddress, VERIFIER_ABI, this.wallet);
    } else {
      // Create dummy contract for demo mode
      this.verifierContract = new Contract(ethers.ZeroAddress, VERIFIER_ABI, this.wallet);
    }

    console.log('ContractService initialized');
    console.log(`  Relayer address: ${this.wallet.address}`);
    console.log(`  Contract address: ${contractAddress}`);
    console.log(`  Verifier address: ${verifierAddress || 'Not configured (demo mode)'}`);
  }

  /**
   * Get policy details from the contract
   */
  async getPolicy(policyId: string | number): Promise<Policy | null> {
    try {
      const policy = await this.insuranceContract.getPolicy(policyId);
      
      return {
        owner: policy.owner,
        tripType: Number(policy.tripType),
        tripIdHash: policy.tripIdHash,
        travelDate: policy.travelDate,
        thresholdMinutes: Number(policy.thresholdMinutes),
        payoutAmount: policy.payoutAmount,
        deadline: policy.deadline,
        status: Number(policy.status),
        createdAt: policy.createdAt,
      };
    } catch (error) {
      console.error('Error getting policy:', error);
      return null;
    }
  }

  /**
   * Register attestation in the mock verifier
   */
  async registerAttestation(attestationId: string): Promise<void> {
    try {
      if (this.verifierContract.target === ethers.ZeroAddress) {
        console.log('  Verifier not configured, skipping registration');
        return;
      }

      const exists = await this.verifierContract.attestationExists(attestationId);
      if (exists) {
        console.log('  Attestation already registered');
        return;
      }

      const tx = await this.verifierContract.registerAttestation(attestationId);
      await tx.wait();
      console.log(`  Registered attestation: ${attestationId}`);
    } catch (error) {
      console.error('Error registering attestation:', error);
      // Don't throw - this might fail if verifier is not deployed
    }
  }

  /**
   * Submit trip proof to the insurance contract
   */
  async submitTripProof(
    policyId: string | number,
    tripStatus: TripStatus,
    proof: FDCProof
  ): Promise<ethers.TransactionResponse> {
    const tx = await this.insuranceContract.submitTripProof(
      policyId,
      {
        tripIdHash: tripStatus.tripIdHash,
        travelDate: tripStatus.travelDate,
        cancelled: tripStatus.cancelled,
        delayMinutes: tripStatus.delayMinutes,
        observedAt: tripStatus.observedAt,
      },
      {
        merkleProof: proof.merkleProof,
        attestationId: proof.attestationId,
      }
    );

    return tx;
  }

  /**
   * Get relayer wallet address
   */
  getRelayerAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get relayer balance
   */
  async getRelayerBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get contract pool balance
   */
  async getPoolBalance(): Promise<string> {
    const balance = await this.insuranceContract.poolBalance();
    return ethers.formatEther(balance);
  }

  /**
   * Get total policies count
   */
  async getPolicyCount(): Promise<number> {
    const count = await this.insuranceContract.policyCounter();
    return Number(count);
  }
}
