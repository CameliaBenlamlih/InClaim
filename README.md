# InClaim - Trustless Travel Delay Compensation on Flare

**File in a flash, get your cash.**

Passengers rarely claim compensation for delayed or cancelled flights and trains due to paperwork and customer-service friction. InClaim turns rights into automatics -- if a trip is objectively delayed or cancelled, a smart contract pays out instantly with no disputes.

## Screenshots

![Trip Tracking - Booking Details](Picture%201.png)

![Trip Tracking - Live Status](Picture%202.png)

## Architecture

```
User Wallet  -->  Frontend (React/Vite)  -->  Smart Contract (DelayClaimInsurance.sol)
                        |                              |
                        v                              |
                  Backend Relayer                      |
                        |                              |
              +---------+---------+                    |
              v                   v                    v
     Transport Status API    FDC Verification (MockFDCVerifier / Flare FDC)
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Smart Contracts | Solidity 0.8.20, Hardhat |
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Wallet | wagmi, @reown/appkit (WalletConnect) |
| Backend | Node.js, Express, TypeScript |
| Blockchain | Flare Coston2 Testnet |
| Data Verification | Flare Data Connector (FDC) |

## Features

- **Book & Protect**: Search live quotes, book tickets, and lock payment in blockchain escrow in one flow
- **FDC Verification**: Trip status verified through Flare Data Connector attestation before any settlement
- **Fixed Compensation Policy**: On time 0%, 3-23h delay 20%, 24h+ delay 50%, cancellation 100%
- **Automatic Settlement**: FDC-gated settlement engine calculates and executes refunds
- **Confirmation Emails**: Booking confirmation with protection details sent automatically

## Project Structure

```
InClaim/
├── contracts/
│   ├── contracts/
│   │   ├── DelayClaimInsurance.sol
│   │   ├── MockFDCVerifier.sol
│   │   └── interfaces/IFDCVerifier.sol
│   ├── scripts/deploy.js
│   └── hardhat.config.js
├── backend/
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── demo.ts
│       │   ├── claim.ts
│       │   └── health.ts
│       └── services/
│           ├── fdcService.ts
│           ├── fdcVerificationService.ts
│           ├── settlementEngine.ts
│           ├── statusOracleService.ts
│           ├── providerQuotesService.ts
│           ├── providerBookingService.ts
│           ├── contractService.ts
│           └── emailService.ts
├── src/
│   ├── App.jsx
│   ├── components/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── HowItWorksPage.jsx
│   │   └── demo/
│   │       ├── DemoLanding.jsx
│   │       ├── DemoResults.jsx
│   │       ├── DemoCheckout.jsx
│   │       └── DemoTrip.jsx
│   └── lib/
│       ├── contract.js
│       ├── refund.js
│       ├── utils.js
│       └── web3.js
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet
- C2FLR tokens from [Coston2 Faucet](https://faucet.flare.network/coston2)

### Install

```bash
npm install
cd backend && npm install && cd ..
cd contracts && npm install && cd ..
```

### Configure

**Backend** (`backend/.env`):
```env
RELAYER_PRIVATE_KEY=your_relayer_private_key
CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
FDC_VERIFIER_ADDRESS=0x647A26E9656E659822e816f5fE02D979D6F2c0A4
```

**Frontend** (`.env.local`):
```env
VITE_CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
VITE_BACKEND_URL=http://localhost:3001
```

### Run

```bash
cd backend && npm run dev
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## User Flow

1. **Search** -- Enter origin, destination, date on the Book & Protect page
2. **Select** -- Choose from live provider quotes with real-time pricing
3. **Book** -- Enter passenger details, connect wallet, confirm purchase
4. **Track** -- View live trip status (on time / delayed / cancelled)
5. **Verify** -- Click "Verify with FDC" to attest trip status through Flare Data Connector
6. **Settle** -- Execute settlement; refund calculated per fixed compensation policy

## FDC Verification Flow

```
1. User clicks "Verify with FDC"
2. Backend fetches current trip status from transport API
3. Status data is hashed (SHA-256) for integrity
4. FDC verification service attests the data
5. Attestation hash + verification ID returned
6. User clicks "Execute Settlement"
7. Backend re-verifies via FDC (mandatory gate)
8. Settlement engine calculates refund per fixed policy
9. Settlement executed, transaction hash returned
```

Settlement is rejected if FDC verification fails. No verification = no refund.

## Smart Contracts

### DelayClaimInsurance.sol

- `createPolicy()` -- Create insurance policy (pays premium)
- `submitTripProof()` -- Submit FDC proof to claim payout
- `expirePolicy()` -- Expire policy after deadline
- `fundPool()` / `withdrawPool()` -- Manage insurance pool

### MockFDCVerifier.sol

- `registerAttestation()` -- Register valid attestation (owner only)
- `verifyAttestation()` -- Verify attestation + Merkle proof
- `attestationExists()` -- Check if attestation is registered

### Security

- Attestation replay prevention (used attestation IDs tracked)
- Checks-effects-interactions pattern
- Pool balance validation before payout
- Deadline enforcement on claims
- Owner-only withdrawals with 90% safety limit

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demo/quotes` | Search travel quotes |
| POST | `/api/demo/purchase` | Book a ticket |
| GET | `/api/demo/booking/:id` | Get booking details |
| GET | `/api/demo/status/:tripId` | Get live trip status |
| POST | `/api/demo/fdc/verify` | FDC verification |
| POST | `/api/demo/settle` | Execute settlement |
| GET | `/api/demo/policy` | Get compensation policy |
| GET | `/api/health/status` | System health |

## Network

| Parameter | Value |
|-----------|-------|
| Chain ID | 114 |
| RPC | https://coston2-api.flare.network/ext/C/rpc |
| Explorer | https://coston2-explorer.flare.network |
| Currency | C2FLR |
| Faucet | https://faucet.flare.network/coston2 |

## FDC Upgrade Path

The current implementation uses a MockFDCVerifier with real transport data. To upgrade to full trustless FDC:

1. Submit transport API source for whitelisting to Flare attestation providers
2. Configure `FDC_HUB_ADDRESS` from FlareContractRegistry
3. Implement `FdcHub.requestAttestation()` with JsonApi type
4. Poll DA layer for finalized proof
5. Replace MockFDCVerifier with FdcVerification contract

The contract interface is designed to support this upgrade without changes to the frontend.

## Feedback on Building with Flare

Building InClaim on Flare was a great experience overall. The Coston2 testnet is fast and reliable -- transactions confirm in seconds, which made the development loop very smooth. The faucet works well and we never ran out of test tokens.

The Flare Data Connector is the standout feature. The concept of having decentralized attestation of off-chain data baked into the protocol is exactly what insurance use cases need. Being able to verify real-world events (flight delays, cancellations) on-chain without relying on a single oracle is powerful.

That said, the FDC JsonApi attestation type requires API sources to be whitelisted by attestation providers, which means we couldn't go fully trustless during the hackathon. We worked around this with a hybrid approach (real transport data + MockFDCVerifier), but the architecture is ready to plug into the real FDC once whitelisting is in place. The documentation on dev.flare.network was clear about this limitation and the upgrade path.

The EVM compatibility made deployment straightforward -- standard Hardhat workflow, standard Solidity, no surprises. The Coston2 explorer is solid for debugging transactions.

One area for improvement: more example code for FDC JsonApi attestation requests would help developers get started faster. The conceptual docs are good, but end-to-end code samples for common patterns (API data verification, proof submission) would reduce onboarding time significantly.

Overall, Flare feels like the right chain for data-dependent dApps. The native data protocols (FDC, FTSO) set it apart from general-purpose L1s where you'd have to build or integrate oracle infrastructure yourself.

## License

MIT

## Links

- [Flare Network](https://flare.network)
- [Flare Data Connector](https://dev.flare.network/fdc/overview)
- [Coston2 Faucet](https://faucet.flare.network/coston2)
- [Coston2 Explorer](https://coston2-explorer.flare.network)
