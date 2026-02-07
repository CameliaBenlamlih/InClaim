export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1A2b3C4d5E6f7A8B9C0D1E2F3a4B5C6D7E8F9A0B';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const CONTRACT_ABI = [
  {
    type: 'event',
    name: 'PolicyCreated',
    inputs: [
      { name: 'policyId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'tripIdHash', type: 'bytes32', indexed: false },
      { name: 'travelDate', type: 'uint64', indexed: false },
      { name: 'payoutAmount', type: 'uint256', indexed: false },
      { name: 'thresholdMinutes', type: 'uint16', indexed: false },
      { name: 'deadline', type: 'uint64', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PolicyResolved',
    inputs: [
      { name: 'policyId', type: 'uint256', indexed: true },
      { name: 'outcome', type: 'uint8', indexed: false },
      { name: 'delayMinutes', type: 'uint16', indexed: false },
      { name: 'cancelled', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PolicyExpired',
    inputs: [
      { name: 'policyId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'PoolFunded',
    inputs: [
      { name: 'funder', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'policies',
    inputs: [{ name: 'policyId', type: 'uint256' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'tripType', type: 'uint8' },
      { name: 'tripIdHash', type: 'bytes32' },
      { name: 'travelDate', type: 'uint64' },
      { name: 'thresholdMinutes', type: 'uint16' },
      { name: 'payoutAmount', type: 'uint256' },
      { name: 'deadline', type: 'uint64' },
      { name: 'status', type: 'uint8' },
      { name: 'createdAt', type: 'uint64' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'policyCounter',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolBalance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserPolicies',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPolicy',
    inputs: [{ name: 'policyId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'owner', type: 'address' },
          { name: 'tripType', type: 'uint8' },
          { name: 'tripIdHash', type: 'bytes32' },
          { name: 'travelDate', type: 'uint64' },
          { name: 'thresholdMinutes', type: 'uint16' },
          { name: 'payoutAmount', type: 'uint256' },
          { name: 'deadline', type: 'uint64' },
          { name: 'status', type: 'uint8' },
          { name: 'createdAt', type: 'uint64' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createPolicy',
    inputs: [
      { name: 'tripType', type: 'uint8' },
      { name: 'tripIdString', type: 'string' },
      { name: 'travelDate', type: 'uint64' },
      { name: 'thresholdMinutes', type: 'uint16' },
      { name: 'payoutAmount', type: 'uint256' },
      { name: 'deadline', type: 'uint64' },
    ],
    outputs: [{ name: 'policyId', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'submitTripProof',
    inputs: [
      { name: 'policyId', type: 'uint256' },
      {
        name: 'tripStatus',
        type: 'tuple',
        components: [
          { name: 'tripIdHash', type: 'bytes32' },
          { name: 'travelDate', type: 'uint64' },
          { name: 'cancelled', type: 'bool' },
          { name: 'delayMinutes', type: 'uint16' },
          { name: 'observedAt', type: 'uint64' },
        ],
      },
      {
        name: 'proof',
        type: 'tuple',
        components: [
          { name: 'merkleProof', type: 'bytes32[]' },
          { name: 'attestationId', type: 'bytes32' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'expirePolicy',
    inputs: [{ name: 'policyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'fundPool',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'withdrawPool',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

export const PolicyStatus = {
  0: 'ACTIVE',
  1: 'CLAIMED',
  2: 'REJECTED',
  3: 'EXPIRED',
  ACTIVE: 0,
  CLAIMED: 1,
  REJECTED: 2,
  EXPIRED: 3,
};

export const TripType = {
  0: 'FLIGHT',
  1: 'TRAIN',
  FLIGHT: 0,
  TRAIN: 1,
};

export const EXPLORER_URL = 'https://coston2-explorer.flare.network';

export function getTxExplorerUrl(txHash) {
  return `${EXPLORER_URL}/tx/${txHash}`;
}

export function getAddressExplorerUrl(address) {
  return `${EXPLORER_URL}/address/${address}`;
}
