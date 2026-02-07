# 🎯 DelayClaim - Deployment Summary & Quick Reference

## Deployed Contracts (Coston2)

| Contract | Address | Explorer |
|----------|---------|----------|
| **DelayClaimInsurance** | `0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8` | [View](https://coston2-explorer.flare.network/address/0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8) |
| **MockFDCVerifier** | `0x647A26E9656E659822e816f5fE02D979D6F2c0A4` | [View](https://coston2-explorer.flare.network/address/0x647A26E9656E659822e816f5fE02D979D6F2c0A4) |
| **Pool Balance** | 10.0 C2FLR | - |

## Network Configuration

| Parameter | Value |
|-----------|-------|
| **Network** | Flare Coston2 Testnet |
| **Chain ID** | 114 (0x72) |
| **RPC URL** | `https://coston2-api.flare.network/ext/C/rpc` |
| **Explorer** | `https://coston2-explorer.flare.network` |
| **Currency** | C2FLR |
| **Faucet** | https://faucet.flare.network/coston2 |

## Environment Variables Setup

### Backend (`backend/.env`)

```bash
# Blockchain
PORT=3001
RPC_URL=https://coston2-api.flare.network/ext/C/rpc
RELAYER_PRIVATE_KEY=your_relayer_private_key_here

# Contracts
CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
FDC_VERIFIER_ADDRESS=0x647A26E9656E659822e816f5fE02D979D6F2c0A4

# Real Data (optional but recommended)
AVIATIONSTACK_API_KEY=your_api_key_here
TEST_FLIGHT_CODE=BA123

# Fallback
MOCK_DEFAULT_STATUS=DELAYED
MOCK_DEFAULT_DELAY_MINUTES=90
```

### Frontend (`.env.local`)

```bash
VITE_CONTRACT_ADDRESS=0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8
VITE_BACKEND_URL=http://localhost:3001
```

## Quick Start Commands

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Configure environment
cp .env.local.example .env.local
cd backend && cp .env.example .env && cd ..

# 3. Get AviationStack API key (free)
# Visit: https://aviationstack.com/signup/free
# Add to backend/.env: AVIATIONSTACK_API_KEY=...

# 4. Start backend
cd backend && npm run dev

# 5. Start frontend (new terminal)
npm run dev
```

## Testing & Validation

### 1. Check Real Data Status

```bash
curl http://localhost:3001/api/health/status | jq .realDataStatus
```

**Expected output:**
```json
{
  "isRealData": true,
  "message": "✅ Using real flight data from AviationStack"
}
```

### 2. Test API Connection

```bash
curl http://localhost:3001/api/health/test-real-data | jq
```

### 3. Dry-Run Claim Flow

```bash
curl -X POST http://localhost:3001/api/health/test-claim-flow \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

### 4. Verify Transaction on Explorer

After submitting a claim:
1. Copy transaction hash from response
2. Visit: https://coston2-explorer.flare.network
3. Search for your transaction
4. Verify "To" address matches contract: `0x52E2e5960962Eac37C03aD48Fbfb7293E9Dc8EB8`

## How to Prove It's Real

### ✅ Real Flight Data
- Backend logs show "AviationStack Real API"
- API test endpoint returns actual flight status
- Delay/cancellation data matches real-world flights

### ✅ Real Blockchain
- Transactions visible on Coston2 Explorer
- MetaMask shows Coston2 network (Chain ID: 114)
- Gas fees paid in C2FLR

### ✅ Real Contract
- Contract deployed at fixed address
- Pool balance visible on-chain
- Events emitted for every policy/claim

### ⚠️ Hybrid FDC
- Uses real data from AviationStack
- Proof mechanism simplified (MockFDCVerifier)
- Upgrade path to full FDC documented

## System Architecture

```
User Wallet (MetaMask)
     │
     ├──▶ Frontend (React)
     │         │
     │         └──▶ Smart Contract (Coston2)
     │                   - DelayClaimInsurance
     │                   - Real transactions
     │                   - Explorer visible
     │
     └──▶ Backend (Express)
               │
               ├──▶ RealTransportAPI
               │         └──▶ AviationStack
               │              (Real flight data)
               │
               └──▶ RealFDCService
                     └──▶ MockFDCVerifier
                          (Hybrid mode)
```

## Useful Links

- **Frontend**: http://localhost:5173 (default Vite port)
- **Backend**: http://localhost:3001
- **Explorer**: https://coston2-explorer.flare.network
- **Faucet**: https://faucet.flare.network/coston2
- **Real Data Guide**: [REAL_DATA_GUIDE.md](./REAL_DATA_GUIDE.md)
- **AviationStack**: https://aviationstack.com
- **Flare Docs**: https://dev.flare.network

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "No API key configured" | Add `AVIATIONSTACK_API_KEY` to `backend/.env` |
| "API connection failed" | Check API key is correct, no extra spaces |
| Frontend can't connect | Verify backend is running, check `VITE_BACKEND_URL` |
| Transaction reverts | Check relayer has C2FLR, contract addresses correct |
| MetaMask wrong network | Switch to Coston2 (Chain ID: 114) |

## Support & Documentation

- **Full Guide**: [REAL_DATA_GUIDE.md](./REAL_DATA_GUIDE.md)
- **Main README**: [README.md](./README.md)
- **Flare Discord**: https://discord.com/invite/flarenetwork

---

**Last Updated**: February 2026  
**Version**: Real Data Edition v1.0  
**Status**: ✅ Ready for testing & demo
