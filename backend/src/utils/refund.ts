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

export function getRefundPercent(delayMinutes: number, isCancelled: boolean = false): number {
  if (isCancelled) {
    return 100;
  }

  const delay = Number(delayMinutes);
  if (isNaN(delay) || delay < 0) {
    return 0;
  }

  if (delay >= 1440) {
    return 50;
  } else if (delay >= 180) {
    return 20;
  } else {
    return 0;
  }
}

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

export function getApplicablePolicy(delayMinutes: number, isCancelled: boolean = false) {
  if (isCancelled) {
    return COMPENSATION_POLICY.find(p => p.isCancellation);
  }

  const delay = Number(delayMinutes);
  if (isNaN(delay) || delay < 0) {
    return COMPENSATION_POLICY[0];
  }

  if (delay >= 1440) {
    return COMPENSATION_POLICY[2];
  } else if (delay >= 180) {
    return COMPENSATION_POLICY[1];
  } else {
    return COMPENSATION_POLICY[0];
  }
}

export function getPolicyBreakdown() {
  return COMPENSATION_POLICY.map(policy => ({
    label: policy.label,
    refundPercent: policy.refundPercent,
    description: policy.description,
  }));
}
