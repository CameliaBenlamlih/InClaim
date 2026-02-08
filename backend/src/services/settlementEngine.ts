import { ethers } from 'ethers';
import dotenv from 'dotenv';
import type { TripStatus } from './statusOracleService';
import type { FDCVerificationResult } from './fdcVerificationService';

dotenv.config();

export const SETTLEMENT_POLICY = {
  ON_TIME: {
    condition: 'on_time',
    userRefundPercent: 0,
    providerReceivesPercent: 100,
    description: 'Trip arrived on time',
  },
  MINOR_DELAY: {
    condition: 'delay_1h_to_24h',
    minDelayMinutes: 60,
    maxDelayMinutes: 1439,
    userRefundPercent: 20,
    providerReceivesPercent: 80,
    description: 'Delay between 1-23 hours',
  },
  MAJOR_DELAY: {
    condition: 'delay_24h_plus',
    minDelayMinutes: 1440,
    userRefundPercent: 50,
    providerReceivesPercent: 50,
    description: 'Delay 24 hours or more',
  },
  CANCELLATION: {
    condition: 'cancelled',
    userRefundPercent: 100,
    providerReceivesPercent: 0,
    description: 'Trip cancelled',
  },
} as const;

export interface SettlementCalculation {
  totalAmount: number;
  userRefund: number;
  providerPayment: number;
  refundPercent: number;
  appliedPolicy: keyof typeof SETTLEMENT_POLICY;
  reason: string;
}

export interface Settlement {
  id: string;
  bookingId: string;
  tripId: string;
  tripType: 'flight' | 'train';
  tripStatus: TripStatus;
  fdcVerification: FDCVerificationResult;
  calculation: SettlementCalculation;
  executed: boolean;
  executedAt?: Date;
  transactionHash?: string;
  createdAt: Date;
}

const settlements = new Map<string, Settlement>();

export function calculateSettlement(
  totalAmount: number,
  tripStatus: TripStatus
): SettlementCalculation {
  let appliedPolicy: keyof typeof SETTLEMENT_POLICY;
  let refundPercent: number;
  let reason: string;
  
  if (tripStatus.status === 'cancelled') {
    appliedPolicy = 'CANCELLATION';
    refundPercent = SETTLEMENT_POLICY.CANCELLATION.userRefundPercent;
    reason = SETTLEMENT_POLICY.CANCELLATION.description;
  } else if (tripStatus.delayMinutes >= SETTLEMENT_POLICY.MAJOR_DELAY.minDelayMinutes) {
    appliedPolicy = 'MAJOR_DELAY';
    refundPercent = SETTLEMENT_POLICY.MAJOR_DELAY.userRefundPercent;
    reason = SETTLEMENT_POLICY.MAJOR_DELAY.description;
  } else if (tripStatus.delayMinutes >= SETTLEMENT_POLICY.MINOR_DELAY.minDelayMinutes) {
    appliedPolicy = 'MINOR_DELAY';
    refundPercent = SETTLEMENT_POLICY.MINOR_DELAY.userRefundPercent;
    reason = SETTLEMENT_POLICY.MINOR_DELAY.description;
  } else {
    appliedPolicy = 'ON_TIME';
    refundPercent = SETTLEMENT_POLICY.ON_TIME.userRefundPercent;
    reason = SETTLEMENT_POLICY.ON_TIME.description;
  }
  
  const userRefund = Math.round(totalAmount * (refundPercent / 100) * 100) / 100;
  const providerPayment = Math.round((totalAmount - userRefund) * 100) / 100;
  
  return {
    totalAmount,
    userRefund,
    providerPayment,
    refundPercent,
    appliedPolicy,
    reason,
  };
}

export async function createSettlement(params: {
  bookingId: string;
  tripId: string;
  tripType: 'flight' | 'train';
  totalAmount: number;
  tripStatus: TripStatus;
  fdcVerification: FDCVerificationResult;
}): Promise<Settlement> {
  const { bookingId, tripId, tripType, totalAmount, tripStatus, fdcVerification } = params;
  
  if (!fdcVerification.verified) {
    throw new Error(`Settlement rejected: FDC verification failed. ${fdcVerification.errorReason || 'Unknown error'}`);
  }
  
  const calculation = calculateSettlement(totalAmount, tripStatus);
  
  const settlementId = `SETTLE-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const settlement: Settlement = {
    id: settlementId,
    bookingId,
    tripId,
    tripType,
    tripStatus,
    fdcVerification,
    calculation,
    executed: false,
    createdAt: new Date(),
  };
  
  settlements.set(settlementId, settlement);
  
  console.log(`Settlement Created: ${settlementId}`);
  console.log(`   Policy Applied: ${calculation.appliedPolicy}`);
  console.log(`   User Refund: $${calculation.userRefund} (${calculation.refundPercent}%)`);
  console.log(`   Provider Receives: $${calculation.providerPayment}`);
  console.log(`   FDC Verified: ${fdcVerification.verificationId}`);
  
  return settlement;
}

export async function executeSettlement(settlementId: string): Promise<Settlement> {
  const settlement = settlements.get(settlementId);
  if (!settlement) {
    throw new Error('Settlement not found');
  }
  
  if (settlement.executed) {
    throw new Error('Settlement already executed');
  }
  
  const rpcUrl = process.env.RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc';
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('RELAYER_PRIVATE_KEY not configured - cannot send transaction');
  }
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const settlementData = ethers.toUtf8Bytes(JSON.stringify({
    type: 'INCLAIM_SETTLEMENT',
    settlementId: settlement.id,
    bookingId: settlement.bookingId,
    tripId: settlement.tripId,
    policy: settlement.calculation.appliedPolicy,
    refundPercent: settlement.calculation.refundPercent,
    refundAmount: settlement.calculation.userRefund,
    fdcVerificationId: settlement.fdcVerification.verificationId,
    timestamp: Date.now(),
  }));
  
  console.log(`Sending settlement transaction on Coston2...`);
  
  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: ethers.parseEther('0.001'),
    data: ethers.hexlify(settlementData),
  });
  
  console.log(`Transaction sent: ${tx.hash}`);
  const receipt = await tx.wait();
  console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);
  
  settlement.executed = true;
  settlement.executedAt = new Date();
  settlement.transactionHash = tx.hash;
  
  settlements.set(settlementId, settlement);
  
  console.log(`Settlement Executed: ${settlementId}`);
  console.log(`   Transaction: https://coston2-explorer.flare.network/tx/${tx.hash}`);
  console.log(`   User receives: $${settlement.calculation.userRefund}`);
  console.log(`   Provider receives: $${settlement.calculation.providerPayment}`);
  
  return settlement;
}

export async function getSettlement(settlementId: string): Promise<Settlement | null> {
  return settlements.get(settlementId) || null;
}

export async function getSettlementByBooking(bookingId: string): Promise<Settlement | null> {
  for (const settlement of settlements.values()) {
    if (settlement.bookingId === bookingId) {
      return settlement;
    }
  }
  return null;
}

export function getSettlementPolicy() {
  return SETTLEMENT_POLICY;
}
