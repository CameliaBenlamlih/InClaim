# 🚀 DelayClaim - Real Data Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Current Implementation](#current-implementation)
3. [Quick Start](#quick-start)
4. [Setup Instructions](#setup-instructions)
5. [Testing & Validation](#testing--validation)
6. [FDC Upgrade Path](#fdc-upgrade-path)
7. [Troubleshooting](#troubleshooting)

---

## Overview

DelayClaim now uses **REAL flight data** from AviationStack API. The system operates in a **hybrid mode**:

- ✅ **Real Data**: Flight status, delays, cancellations from AviationStack
- ✅ **Real Transactions**: On-chain transactions on Coston2
- ✅ **Real Explorer**: Verifiable on Coston2 Explorer
- ⚠️ **Hybrid Proof**: MockFDCVerifier (simplified) until API whitelisting

### What's Real vs Mock

| Component | Status | Notes |
|-----------|--------|-------|
| Flight Data | ✅ **REAL** | AviationStack API (30-60s latency) |
| Blockchain | ✅ **REAL** | Flare Coston2 Testnet |
| Transactions | ✅ **REAL** | MetaMask signatures, explorer visible |
| Contract | ✅ **REAL** | DelayClaimInsurance.sol deployed |
| FDC Proof | ⚠️ **HYBRID** | Deterministic proof until whitelisting |

---

## Current Implementation

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   DelayClaim - Real Data                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User Wallet (MetaMask)                                     │
│        │                                                     │
│        ├──▶ Frontend (React/Vite)                           │
│        │         │                                           │
│        │         ├──▶ Smart Contract (Coston2)              │
│        │         │    - DelayClaimInsurance.sol             │
│        │         │    - Real transactions                   │
│        │         │                                           │
│        │         └──▶ Backend (Express/TS)                  │
│        │                   │                                 │
│        │                   ├──▶ RealTransportAPI            │
│        │                   │    └──▶ AviationStack API      │
│        │                   │         (Real flight data)     │
│        │                   │                                 │
│        │                   └──▶ RealFDCService              │
│        │                        └──▶ MockFDCVerifier        │
│        │                             (Hybrid mode)          │
│        │                                                     │
│        └──▶ Coston2 Explorer                                │
│             (Verify all transactions)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User creates policy** → Transaction on Coston2
2. **User initiates claim** → Backend fetches **real flight data**
3. **Backend creates attestation** → Deterministic proof with real data
4. **Backend submits proof** → Transaction calls smart contract
5. **Contract verifies** → MockFDCVerifier accepts proof
6. **Payout decision** → Based on **real** delay/cancellation data

---

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask with Coston2 configured
- C2FLR tokens from [faucet](https://faucet.flare.network/coston2)

### 1. Get AviationStack API Key (FREE)

```bash
# Visit https://aviationstack.com/signup/free
# - No credit card required
# - 100 free requests/month
# - Real-time flight data
# - Copy your API key from dashboard
```

### 2. Configure Backend

```bash
cd backend

# Copy the example and edit
cp .env.example .env

# Edit backend/.env and add:
AVIATIONSTACK_API_KEY=your_api_key_here
TEST_FLIGHT_CODE=BA123  # Optional: any real flight
```

### 3. Configure Frontend

```bash
cd ..  # Back to root

# Create .env.local
echo "VITE_CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8" > .env.local
echo "VITE_BACKEND_URL=http://localhost:3001" >> .env.local
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (from root)
cd ..
npm install
```

### 5. Start Everything

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (from root)
npm run dev
```

---

## Setup Instructions

### Detailed Backend Configuration

Edit `backend/.env`:

```bash
# ============================================================
# REQUIRED - Smart Contract & Blockchain
# ============================================================
PORT=3001
RPC_URL=https://coston2-api.flare.network/ext/C/rpc
RELAYER_PRIVATE_KEY=your_relayer_private_key_here
CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
FDC_VERIFIER_ADDRESS=0x647A26E9656E659822e816f5fE02D979D6F2c0A4

# ============================================================
# REQUIRED FOR REAL DATA - AviationStack
# ============================================================
AVIATIONSTACK_API_KEY=your_key_here

# Optional: Customize test flight
TEST_FLIGHT_CODE=BA123

# ============================================================
# OPTIONAL - Future FDC Integration
# ============================================================
# Leave empty for hybrid mode
FDC_HUB_ADDRESS=

# ============================================================
# FALLBACK - If API key not set
# ============================================================
MOCK_DEFAULT_STATUS=DELAYED
MOCK_DEFAULT_DELAY_MINUTES=90
```

### Frontend Configuration

Create `.env.local` in root:

```bash
VITE_CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
VITE_BACKEND_URL=http://localhost:3001
```

---

## Testing & Validation

### 1. Test API Connection

```bash
# Check system status
curl http://localhost:3001/api/health/status

# Test real API connection
curl http://localhost:3001/api/health/test-real-data
```

**Expected Output (Success):**
```json
{
  "success": true,
  "message": "Successfully connected to AviationStack API",
  "data": {
    "flightIata": "BA123",
    "status": "active",
    "delay": 15
  },
  "proof": {
    "source": "AviationStack API",
    "apiConfigured": true
  }
}
```

### 2. Test Claim Flow (Dry Run)

```bash
curl -X POST http://localhost:3001/api/health/test-claim-flow \
  -H "Content-Type: application/json" \
  -d '{"tripId": "TEST_FLIGHT"}'
```

This tests the entire flow without submitting a transaction.

### 3. Verify Real Data in Logs

When backend starts, you should see:

```
✅ RealTransportAPI: AviationStack API configured
   API Key: abc12345...
✅ RealFDCService initialized (Hybrid Mode)
   Using: Real transport data + MockFDCVerifier proofs
```

### 4. Create & Claim a Real Policy

1. **Frontend**: Create a policy
   - Connect MetaMask
   - Go to "Create Policy"
   - Enter trip details
   - Confirm transaction

2. **Backend**: Check logs when claiming
   ```
   📡 Fetching real flight data from AviationStack...
   ✅ Real flight data retrieved: DELAYED, 45min delay
   ```

3. **Explorer**: Verify transaction
   - Open: https://coston2-explorer.flare.network
   - Search your transaction hash
   - Check "To" address matches contract
   - View contract call data

### 5. Prove It's Real Data

**Evidence checklist:**
- [ ] Backend logs show "AviationStack API"
- [ ] API test endpoint returns real flight data
- [ ] Transaction visible on Coston2 Explorer
- [ ] "To" address = `0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8`
- [ ] Delay/status matches current flight info
- [ ] Can verify flight on flight tracking websites

---

## FDC Upgrade Path

### Current: Hybrid Mode

**What you have now:**
- ✅ Real flight data (AviationStack)
- ✅ Real blockchain transactions
- ⚠️ Simplified proof mechanism (MockFDCVerifier)
- ⚠️ Relayer is trusted

**Security model:**
- Users trust the relayer to fetch correct data
- Data is real, but not cryptographically proven
- Suitable for: demos, hackathons, MVPs

### Target: Full FDC Mode

**What you need:**
- ✅ Everything from hybrid mode, PLUS:
- ✅ Cryptographic Merkle proof
- ✅ No trust in relayer required
- ✅ FDC consensus verification

**Security model:**
- Users trust Flare's decentralized attestation network
- Data is cryptographically proven
- Suitable for: production, real money

### The Limitation: API Whitelisting

**Why can't we use FDC now?**

FDC's JsonApi attestation type allows querying any Web2 API, but requires the API to be **whitelisted** by Flare's attestation providers. This ensures:
- Attestation providers can reliably fetch the data
- API format is understood and parseable
- JQ transformations work correctly

**Current status:** AviationStack is not whitelisted.

### Whitelisting Process

```bash
# Step 1: Contact Flare
Discord: https://discord.com/invite/flarenetwork
Email: Via support channels
Forum: https://forum.flare.network

# Step 2: Provide API Details
API URL: http://api.aviationstack.com/v1/flights
Auth: API key in query params
Response: JSON with flight data
JQ Transform: .data[0].flight_status, .data[0].departure.delay

# Step 3: Wait for Implementation
Timeframe: Varies (days to weeks)
Testing: Available on Coston2 first

# Step 4: Configure Backend
FDC_HUB_ADDRESS=0x... (from FlareContractRegistry)

# Step 5: Deploy New Verifier
Deploy FdcVerification contract
Update DelayClaimInsurance to use real verifier
```

### Implementation After Whitelisting

Once AviationStack is whitelisted:

```typescript
// In realFdcService.ts
async createAttestation(request: AttestationRequest) {
  // 1. Prepare JsonApi attestation request
  const attestationRequest = {
    attestationType: 'JsonApi',
    url: 'http://api.aviationstack.com/v1/flights',
    jqTransform: '.data[0] | {status: .flight_status, delay: .departure.delay}',
    // ... other fields
  };

  // 2. Submit to FdcHub
  const tx = await fdcHub.requestAttestation(
    encodedRequest,
    { value: attestationFee }
  );
  
  // 3. Wait for voting round finalization (~90 seconds)
  const roundId = await getRoundIdFromTx(tx);
  await waitForRoundFinalization(roundId);
  
  // 4. Retrieve proof from DA layer
  const proof = await fetchProofFromDALayer(roundId, requestHash);
  
  return proof;
}
```

### Check FDC Info

```bash
curl http://localhost:3001/api/health/fdc-info
```

This returns detailed upgrade instructions and current status.

---

## Troubleshooting

### Issue: "No API key configured"

**Symptom:**
```
⚠️ RealTransportAPI: No API key configured, using mock fallback
```

**Solution:**
1. Get free API key: https://aviationstack.com/signup/free
2. Add to `backend/.env`: `AVIATIONSTACK_API_KEY=your_key_here`
3. Restart backend: `npm run dev`

### Issue: "API connection failed"

**Symptom:**
```json
{
  "success": false,
  "message": "API connection failed: Request failed with status code 401"
}
```

**Solutions:**
- Check API key is correct
- Ensure no extra spaces in `.env` file
- Verify you haven't exceeded free plan (100 req/month)
- Test API key directly:
  ```bash
  curl "http://api.aviationstack.com/v1/flights?access_key=YOUR_KEY&flight_iata=BA123"
  ```

### Issue: "No flight data found"

**Symptom:**
```
⚠️ No real flight data found, using mock fallback
```

**Solutions:**
- Change `TEST_FLIGHT_CODE` to an active flight
- Use IATA codes (e.g., BA123, AF1234, LH456)
- Check flight exists on https://www.flightradar24.com
- Wait for flight to be active (not scheduled far in future)

### Issue: Transaction fails on-chain

**Symptom:**
Transaction reverts with "Invalid FDC proof"

**Solutions:**
- Check `FDC_VERIFIER_ADDRESS` matches deployed MockFDCVerifier
- Ensure backend successfully called `registerAttestation()`
- Check logs for attestation ID
- Verify contract address in `.env` matches deployment

### Issue: Frontend can't connect

**Symptom:**
- "Cannot connect to backend"
- CORS errors

**Solutions:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Verify `VITE_BACKEND_URL=http://localhost:3001` in `.env.local`
3. Check vite proxy config in `vite.config.js`
4. Clear browser cache and hard reload

### Issue: MetaMask not on Coston2

**Solution:**
Add Coston2 network to MetaMask:
- Network Name: `Coston2`
- RPC URL: `https://coston2-api.flare.network/ext/C/rpc`
- Chain ID: `114`
- Symbol: `C2FLR`
- Explorer: `https://coston2-explorer.flare.network`

### Check System Health

```bash
# Comprehensive health check
curl http://localhost:3001/api/health/status | jq

# Look for:
# - realDataActive: true
# - apiConfigured: true
# - relayerBalance: > 0 C2FLR
```

---

## API Limits & Costs

### AviationStack Free Plan

- **Requests**: 100/month
- **Cost**: $0 (no credit card)
- **Data**: Real-time flight status
- **Latency**: 30-60 seconds
- **Coverage**: Global, 13,000+ airlines

### Upgrade Options

If you need more requests:

| Plan | Requests/Month | Cost |
|------|----------------|------|
| Free | 100 | $0 |
| Basic | 10,000 | $49.99/mo |
| Professional | 100,000 | $149.99/mo |
| Business | 500,000 | $499.99/mo |

### Monitoring Usage

```bash
# Check your API usage
# Login to: https://aviationstack.com/dashboard
# View: API Calls This Month
```

---

## Production Checklist

Before going to mainnet:

- [ ] Get AviationStack API key whitelisted by Flare
- [ ] Deploy real FdcVerification contract
- [ ] Update DelayClaimInsurance to use real verifier
- [ ] Test full FDC flow on Coston2
- [ ] Audit smart contracts
- [ ] Set up monitoring and alerts
- [ ] Upgrade to paid AviationStack plan if needed
- [ ] Deploy to Flare mainnet
- [ ] Update frontend to mainnet RPC

---

## Additional Resources

- **Flare Docs**: https://dev.flare.network
- **FDC Overview**: https://dev.flare.network/fdc/overview
- **AviationStack Docs**: https://aviationstack.com/documentation
- **Coston2 Explorer**: https://coston2-explorer.flare.network
- **Coston2 Faucet**: https://faucet.flare.network/coston2

---

## Support

For issues or questions:

1. Check this guide's Troubleshooting section
2. Review backend logs for error messages
3. Test endpoints: `/api/health/*`
4. Check Flare Discord: https://discord.com/invite/flarenetwork

---

**Last Updated**: February 2026  
**Version**: Real Data Edition v1.0
