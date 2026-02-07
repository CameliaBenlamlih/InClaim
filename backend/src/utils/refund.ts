/**
 * Refund Calculation Utilities - Backend Version
 * Fixed compensation policy for DelayClaim escrow system
 */

/**
 * Fixed compensation policy (immutable)
 * These rules are the same for all users and cannot be modified
 */
export const COMPENSATION_POLICY = [
  { 
    label: '0–2h59', 
    minMinutes: 0, 
    maxMinutes: 179, 
    refundPercent: 0,
    description: 'No refund'
  },
  { 
    label: '≥ 3h', 
    minMinutes: 180, 
    maxMinutes: 1439, 
    refundPercent: 20,
    description: '20% instant refund'
  },
  { 
    label: '≥ 24h', 
    minMinutes: 1440, 
    maxMinutes: Infinity, 
    refundPercent: 50,
    description: '50% instant refund'
  },
  { 
    label: 'Cancellation', 
    minMinutes: null, 
    maxMinutes: null, 
    refundPercent: 100,
    description: '100% instant refund',
    isCancellation: true
  },
];

/**
 * Calculate refund percentage based on delay and cancellation status
 * @param delayMinutes - Delay in minutes
 * @param isCancelled - Whether the trip was cancelled
 * @returns Refund percentage (0, 20, 50, or 100)
 */
export function getRefundPercent(delayMinutes: number, isCancelled: boolean = false): number {
  // Cancellation always gets 100% refund
  if (isCancelled) {
    return 100;
  }

  // Ensure delayMinutes is a valid number
  const delay = Number(delayMinutes);
  if (isNaN(delay) || delay < 0) {
    return 0;
  }

  // Apply fixed policy rules
  if (delay >= 1440) { // >= 24 hours (24 * 60)
    return 50;
  } else if (delay >= 180) { // >= 3 hours (3 * 60)
    return 20;
  } else {
    return 0;
  }
}

/**
 * Calculate refund amount based on ticket price and delay
 * @param ticketPriceWei - Ticket price in Wei (BigInt)
 * @param delayMinutes - Delay in minutes
 * @param isCancelled - Whether the trip was cancelled
 * @returns Object with refundPercent and refundAmountWei
 */
export function calculateRefundWei(
  ticketPriceWei: bigint, 
  delayMinutes: number, 
  isCancelled: boolean = false
): { refundPercent: number; refundAmountWei: bigint } {
  const refundPercent = getRefundPercent(delayMinutes, isCancelled);
  const refundAmountWei = (ticketPriceWei * BigInt(refundPercent)) / BigInt(100);

  return {
    refundPercent,
    refundAmountWei,
  };
}

/**
 * Get the applicable policy rule for given delay/cancellation
 * @param delayMinutes - Delay in minutes
 * @param isCancelled - Whether the trip was cancelled
 * @returns The applicable policy rule
 */
export function getApplicablePolicy(delayMinutes: number, isCancelled: boolean = false) {
  if (isCancelled) {
    return COMPENSATION_POLICY.find(p => p.isCancellation);
  }

  const delay = Number(delayMinutes);
  if (isNaN(delay) || delay < 0) {
    return COMPENSATION_POLICY[0]; // 0% policy
  }

  // Find the applicable policy based on delay
  if (delay >= 1440) {
    return COMPENSATION_POLICY[2]; // >= 24h
  } else if (delay >= 180) {
    return COMPENSATION_POLICY[1]; // >= 3h
  } else {
    return COMPENSATION_POLICY[0]; // 0-2h59
  }
}

/**
 * Get policy breakdown for API responses
 * @returns Policy breakdown array
 */
export function getPolicyBreakdown() {
  return COMPENSATION_POLICY.map(policy => ({
    label: policy.label,
    refundPercent: policy.refundPercent,
    description: policy.description,
  }));
}
