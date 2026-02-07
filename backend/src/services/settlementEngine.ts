/**
 * Settlement Engine
 * Fixed compensation policies - NOT user-editable
 * Settlement only executed after successful FDC verification
 */

import type { TripStatus } from './statusOracleService';
import type { FDCVerificationResult } from './fdcVerificationService';

// FIXED COMPENSATION POLICY - HARDCODED, NOT EDITABLE
export const SETTLEMENT_POLICY = {
  ON_TIME: {
    condition: 'on_time',
    userRefundPercent: 0,
    providerReceivesPercent: 100,
    description: 'Trip arrived on time',
  },
  MINOR_DELAY: {
    condition: 'delay_3h_to_24h',
    minDelayMinutes: 180, // 3 hours
    maxDelayMinutes: 1439, // <24 hours
    userRefundPercent: 20,
    providerReceivesPercent: 80,
    description: 'Delay between 3-23 hours',
  },
  MAJOR_DELAY: {
    condition: 'delay_24h_plus',
    minDelayMinutes: 1440, // 24 hours
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

// In-memory settlement storage
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
  
  // CRITICAL: Verify FDC verification passed
  if (!fdcVerification.verified) {
    throw new Error(`Settlement rejected: FDC verification failed. ${fdcVerification.errorReason || 'Unknown error'}`);
  }
  
  // Calculate settlement amounts
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
  
  console.log(`💰 Settlement Created: ${settlementId}`);
  console.log(`   Policy Applied: ${calculation.appliedPolicy}`);
  console.log(`   User Refund: $${calculation.userRefund} (${calculation.refundPercent}%)`);
  console.log(`   Provider Receives: $${calculation.providerPayment}`);
  console.log(`   FDC Verified: ✅ ${fdcVerification.verificationId}`);
  
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
  
  // Simulate on-chain transaction
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  
  // Generate mock transaction hash
  const txHash = `0x${Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;
  
  settlement.executed = true;
  settlement.executedAt = new Date();
  settlement.transactionHash = txHash;
  
  settlements.set(settlementId, settlement);
  
  console.log(`✅ Settlement Executed: ${settlementId}`);
  console.log(`   Transaction Hash: ${txHash.substring(0, 20)}...`);
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
