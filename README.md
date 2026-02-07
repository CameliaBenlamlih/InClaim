# DelayClaim - Trustless Travel Delay Compensation on Flare

**From Paperwork to Cryptographic Truth - Now with REAL Flight Data! ✈️**

DelayClaim solves a real-world consumer injustice: passengers rarely claim compensation for delayed/cancelled trains and flights due to paperwork and customer-service friction. DelayClaim turns "rights" into "automatics" - if a trip is objectively delayed or cancelled, a smart contract pays out instantly with no disputes.

## 🎯 Real Data Edition - What's New

✅ **Real flight data** from AviationStack API (free tier available)  
✅ **Real transactions** on Flare Coston2 blockchain  
✅ **Verifiable on explorer** - every transaction is public  
⚠️ **Hybrid FDC mode** - Real data + simplified proofs (upgrade path documented)

👉 **[Read the Complete Real Data Guide →](./REAL_DATA_GUIDE.md)**

## Key Innovation

**Real-world flight status verification** - the system fetches actual delay and cancellation data from aviation APIs and processes claims based on real events, not simulations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DelayClaim Architecture - Real Data Edition              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐     ┌──────────────┐     ┌─────────────────────────────────┐ │
│   │  User    │────▶│   Frontend   │────▶│      Smart Contract             │ │
│   │  Wallet  │     │  (React/Vite)│     │   (DelayClaimInsurance.sol)     │ │
│   └──────────┘     └──────────────┘     └─────────────────────────────────┘ │
│                           │                           │                      │
│                           │                           │                      │
│                           ▼                           │                      │
│                    ┌──────────────┐                   │                      │
│                    │   Backend    │                   │                      │
│                    │   Relayer    │                   │                      │
│                    └──────────────┘                   │                      │
│                           │                           │                      │
│              ┌────────────┴────────────┐              │                      │
│              ▼                         ▼              ▼                      │
│     ┌─────────────────┐     ┌─────────────────────────────────────────────┐ │
│     │ AviationStack   │     │         Hybrid FDC Mode                     │ │
│     │   Real API      │     │    Real Data + MockFDCVerifier              │ │
│     │  (30-60s data)  │     │    (Upgrade path to full FDC documented)    │ │
│     └─────────────────┘     └─────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Features

- **Real Flight Data**: Live status from AviationStack API (delays, cancellations, 30-60s latency)
- **Create Insurance Policies**: Cover flights or trains with customizable delay thresholds
- **Automated Claims**: Claims processed based on real aviation data
- **Instant Payouts**: Smart contract automatically pays when delay/cancellation is proven
- **Verifiable Transactions**: All transactions visible on Coston2 Explorer
- **Consumer-Grade UX**: One-click claims, transparent on-chain states

## Real vs Mock Data

| Component | Implementation | Status |
|-----------|----------------|--------|
| **Flight Status** | AviationStack API | ✅ **REAL** |
| **Blockchain** | Flare Coston2 | ✅ **REAL** |
| **Transactions** | MetaMask signed | ✅ **REAL** |
| **Smart Contract** | DelayClaimInsurance.sol | ✅ **REAL** |
| **FDC Proofs** | MockFDCVerifier (simplified) | ⚠️ **HYBRID** |

**Hybrid Mode**: Uses real transport data with simplified proof mechanism until AviationStack API is whitelisted by Flare attestation providers. Full upgrade path documented in [`REAL_DATA_GUIDE.md`](./REAL_DATA_GUIDE.md).

## Technology Stack

| Component | Technology |
|-----------|------------|
| Smart Contracts | Solidity 0.8.20, Hardhat |
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Wallet Connection | wagmi, @reown/appkit (WalletConnect) |
| Backend | Node.js, Express, TypeScript |
| Blockchain | Flare Coston2 Testnet |
| Data Verification | Flare Data Connector (FDC) |

## Project Structure

```
delayclaim/
├── contracts/                 # Solidity smart contracts
│   ├── contracts/
│   │   ├── DelayClaimInsurance.sol
│   │   ├── MockFDCVerifier.sol
│   │   └── interfaces/IFDCVerifier.sol
│   ├── scripts/deploy.js
│   ├── test/DelayClaimInsurance.test.js
│   └── hardhat.config.js
├── backend/                   # FDC Relayer service
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── claim.ts
│   │   │   └── mockTransport.ts
│   │   └── services/
│   │       ├── contractService.ts
│   │       ├── fdcService.ts
│   │       └── mockTransportApi.ts
│   └── package.json
├── src/                       # Frontend React app
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── App.jsx
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet
- C2FLR tokens from [Coston2 Faucet](https://faucet.flare.network/coston2)
- **[OPTIONAL]** AviationStack API key for real flight data (free, no credit card)

### 1. Clone and Install

```bash
# Install root dependencies (frontend)
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install contract dependencies (if redeploying)
cd contracts && npm install && cd ..
```

### 2. Get Real Flight Data API Key (Recommended)

```bash
# Visit https://aviationstack.com/signup/free
# - Sign up (no credit card required)
# - Get 100 free API requests per month
# - Copy your API key from the dashboard
```

### 3. Configure Environment

**Backend** - Create `backend/.env`:
```bash
cd backend
cp .env.example .env
# Edit .env and add:
```

```env
# Required
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
FDC_VERIFIER_ADDRESS=0x647A26E9656E659822e816f5fE02D979D6F2c0A4

# Real Data (optional but recommended)
AVIATIONSTACK_API_KEY=your_api_key_here

# Fallback if no API key
MOCK_DEFAULT_STATUS=DELAYED
MOCK_DEFAULT_DELAY_MINUTES=90
```

**Frontend** - Create `.env.local` in root:
```bash
cd ..  # Back to root
cp .env.local.example .env.local
```

Content:
```env
VITE_CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
VITE_BACKEND_URL=http://localhost:3001
```

### 4. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend (from root)
cd ..
npm run dev
```

### 5. Test Real Data Connection

```bash
# Check if real API is working
curl http://localhost:3001/api/health/test-real-data

# View system status
curl http://localhost:3001/api/health/status
```

**Expected**: You should see `"realDataActive": true` if API key is configured.

### 6. Get Test Tokens

Get C2FLR tokens from the [Flare Coston2 Faucet](https://faucet.flare.network/coston2).

## Demo Walkthrough

### Creating a Policy

1. Connect your wallet to Coston2 testnet
2. Navigate to "Create Policy"
3. Select trip type (Flight/Train)
4. Enter trip ID (e.g., "BA123")
5. Select travel date
6. Choose delay threshold (default: 60 minutes)
7. Select payout amount (1/5/10 C2FLR)
8. Confirm transaction (pays 10% premium)

### Claiming Compensation

1. Go to "My Policies"
2. Find your active policy
3. Click "Claim" to start verification
4. Watch the FDC verification flow:
   - **Step 1**: Fetching transport status
   - **Step 2**: Creating FDC attestation
   - **Step 3**: Submitting proof to contract
   - **Step 4**: Claim resolved!
5. If delayed/cancelled: Payout received instantly
6. If on-time: Claim rejected (no payout)

### Testing with Real Data

If you configured AviationStack API key:

```bash
# Test real API connection
curl http://localhost:3001/api/health/test-real-data

# Test complete claim flow (dry run, no transaction)
curl -X POST http://localhost:3001/api/health/test-claim-flow \
  -H "Content-Type: application/json" \
  -d '{"tripId": "TEST_FLIGHT"}'

# Check system status
curl http://localhost:3001/api/health/status
```

### Testing Different Scenarios (Mock Fallback)

If no API key configured, use mock mode:

```bash
# Test delayed flight (90 minutes)
curl -X POST http://localhost:3001/api/mock/config \
  -H "Content-Type: application/json" \
  -d '{"defaultStatus": "DELAYED", "defaultDelayMinutes": 90}'

# Test cancelled train
curl -X POST http://localhost:3001/api/mock/config \
  -H "Content-Type: application/json" \
  -d '{"defaultStatus": "CANCELLED"}'

# Test on-time (claim rejected)
curl -X POST http://localhost:3001/api/mock/config \
  -H "Content-Type: application/json" \
  -d '{"defaultStatus": "ON_TIME", "defaultDelayMinutes": 0}'
```

## How FDC Verification Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FDC Attestation Flow                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. USER INITIATES CLAIM                                                     │
│     └──▶ Frontend calls POST /api/claim { policyId }                        │
│                                                                              │
│  2. BACKEND QUERIES TRANSPORT STATUS                                         │
│     └──▶ Gets delay/cancellation data from external API                     │
│                                                                              │
│  3. FDC ATTESTATION REQUEST                                                  │
│     └──▶ Backend creates attestation request with trip data                 │
│     └──▶ Waits for FDC voting round to finalize                             │
│     └──▶ Retrieves Merkle proof from FDC                                    │
│                                                                              │
│  4. ON-CHAIN VERIFICATION                                                    │
│     └──▶ Backend submits proof to smart contract                            │
│     └──▶ Contract verifies proof via FDC Verifier                           │
│     └──▶ Contract checks: tripId + date match policy                        │
│                                                                              │
│  5. PAYOUT DECISION                                                          │
│     └──▶ If cancelled OR delay >= threshold: PAY policy.owner               │
│     └──▶ Else: REJECT claim (no payout)                                     │
│                                                                              │
│  TRUST MODEL:                                                                │
│  - Backend is NOT trusted (acts as relayer only)                            │
│  - FDC proof is cryptographically verified on-chain                         │
│  - Contract only pays on valid, matching FDC attestation                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Attestation Schema

```solidity
struct TripStatus {
    bytes32 tripIdHash;    // keccak256(tripIdString)
    uint64 travelDate;     // Unix timestamp
    bool cancelled;        // True if trip cancelled
    uint16 delayMinutes;   // Delay in minutes
    uint64 observedAt;     // When status was checked
}
```

## Smart Contract Details

### Policy Lifecycle

```
CREATED ──▶ ACTIVE ──┬──▶ CLAIMED (payout sent)
                     ├──▶ REJECTED (no payout)
                     └──▶ EXPIRED (deadline passed)
```

### Key Functions

| Function | Description |
|----------|-------------|
| `createPolicy()` | Create new insurance policy (pays premium) |
| `submitTripProof()` | Submit FDC proof to claim payout |
| `expirePolicy()` | Expire policy after deadline |
| `fundPool()` | Add funds to insurance pool |
| `withdrawPool()` | Owner withdraws from pool (safety limits) |

### Security Features

- **Double-claim prevention**: Attestation IDs tracked, can't reuse
- **Pool balance checks**: Reverts if insufficient funds
- **Checks-effects-interactions**: Follows best practices
- **Deadline enforcement**: Claims must be within deadline
- **Owner-only withdrawals**: With 90% safety limit

## API Reference

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/claim` | Process claim with real data verification |
| GET | `/api/claim/:policyId` | Get policy status |
| GET | `/api/health/status` | System status & real data config |
| GET | `/api/health/test-real-data` | Test AviationStack API connection |
| GET | `/api/health/fdc-info` | FDC upgrade path documentation |
| POST | `/api/health/test-claim-flow` | Dry-run claim flow test |
| GET | `/api/mock/status` | Get mock transport status (fallback) |
| POST | `/api/mock/config` | Configure mock responses (fallback) |
| GET | `/health` | Basic health check |

### Claim Request

```json
POST /api/claim
{
  "policyId": 1
}
```

### Claim Response

```json
{
  "success": true,
  "policyId": 1,
  "outcome": "CLAIMED",
  "delayMinutes": 90,
  "cancelled": false,
  "thresholdMinutes": 60,
  "txHash": "0x...",
  "blockNumber": 12345678,
  "explorerUrl": "https://coston2-explorer.flare.network/tx/0x..."
}
```

## Network Configuration

### Flare Coston2 Testnet

| Parameter | Value |
|-----------|-------|
| Chain ID | 114 |
| RPC URL | https://coston2-api.flare.network/ext/C/rpc |
| Explorer | https://coston2-explorer.flare.network |
| Currency | C2FLR |
| Faucet | https://faucet.flare.network/coston2 |

### Adding to MetaMask

```
Network Name: Coston2
RPC URL: https://coston2-api.flare.network/ext/C/rpc
Chain ID: 114
Symbol: C2FLR
Explorer: https://coston2-explorer.flare.network
```

## Running Tests

```bash
cd contracts
npx hardhat test
```

Test coverage includes:
- Policy creation
- Claim with valid FDC proof
- Claim rejection on insufficient delay
- Claim rejection on wrong tripId
- Policy expiration
- Pool funding and withdrawal

## Current Status & Roadmap

### ✅ Completed (Real Data Edition)
- Real flight data integration (AviationStack)
- Real blockchain transactions (Coston2)
- Hybrid FDC mode implementation
- Comprehensive testing endpoints
- Documentation for production upgrade

### 🚧 In Progress
- **API Whitelisting**: Request AviationStack whitelisting by Flare attestation providers
- **Train Data**: Integration with rail APIs
- **Multi-source**: Fallback to alternative flight APIs

### 🔮 Future Improvements
1. **Full FDC Integration**: Upgrade to trustless FDC after API whitelisting
2. **Real FDC Verifier**: Deploy FdcVerification contract instead of mock
3. **Dynamic Pricing**: Use FTSO price feeds for multi-currency payouts
4. **Claim History**: On-chain event indexing with subgraphs
5. **Mobile App**: React Native version
6. **Multi-chain**: Deploy to Flare mainnet + other chains
7. **More Data Sources**: Support multiple aviation APIs for redundancy

### 📖 Documentation
- **[REAL_DATA_GUIDE.md](./REAL_DATA_GUIDE.md)**: Complete setup and testing guide
- **[FDC Upgrade Path](./REAL_DATA_GUIDE.md#fdc-upgrade-path)**: How to transition to full FDC
- **[Troubleshooting](./REAL_DATA_GUIDE.md#troubleshooting)**: Common issues and solutions

## License

MIT

## Links

- [Flare Network](https://flare.network)
- [Flare Data Connector Docs](https://docs.flare.network/tech/data-connector/)
- [Coston2 Faucet](https://faucet.flare.network/coston2)
- [Coston2 Explorer](https://coston2-explorer.flare.network)
