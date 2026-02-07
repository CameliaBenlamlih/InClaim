# InClaim Smart Contract Deployment Guide

## 📋 For Hackathon Judges

This document explains the smart contract deployment process and addresses on Flare Coston2 Testnet.

---

## 🔍 Current Contract Address

**Demo Address:** `0x1A2b3C4d5E6f7A8B9C0D1E2F3a4B5C6D7E8F9A0B`

### Why This Address Format?

Ethereum-compatible addresses (including Flare) are:
- **20 bytes** (160 bits) long
- Represented as **40 hexadecimal characters**
- Prefixed with `0x`

Example breakdown:
```
0x1A2b3C4d5E6f7A8B9C0D1E2F3a4B5C6D7E8F9A0B
│  └────────────────────────────────────────┘
│              40 hex characters
└─ Ethereum address prefix
```

### How Contract Addresses Are Generated

When you deploy a smart contract, the address is **deterministically generated** from:

1. **Deployer's address** - Your wallet address
2. **Nonce** - Number of transactions from your wallet
3. **CREATE2** (optional) - Hash of bytecode + salt

Formula: `address = keccak256(rlp([sender, nonce]))[12:]`

This ensures:
- ✅ **Unique addresses** for each deployment
- ✅ **Verifiable** on blockchain explorers
- ✅ **Non-random** but unpredictable before deployment

---

## 🚀 Deploying Your Own Contract

### Prerequisites

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### 1. Configure Coston2 Network

Edit `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    coston2: {
      url: "https://coston2-api.flare.network/ext/C/rpc",
      accounts: [process.env.PRIVATE_KEY], // Your deployer wallet
      chainId: 114,
    },
  },
};
```

### 2. Get Testnet Funds

1. Visit [Flare Faucet](https://faucet.flare.network/)
2. Select **Coston2 Testnet**
3. Enter your wallet address
4. Receive test C2FLR tokens

### 3. Deploy Contract

```bash
# Deploy to Coston2
npx hardhat run scripts/deploy.js --network coston2

# Output example:
# InClaim deployed to: 0xAbC123...789DeF
```

### 4. Update Environment Variable

Create `.env` file:

```env
VITE_CONTRACT_ADDRESS=0xYourActualDeployedAddress
```

The app will automatically use this address instead of the demo placeholder.

### 5. Verify Contract (Recommended)

```bash
npx hardhat verify --network coston2 0xYourContractAddress
```

Benefits:
- ✅ Source code visible on [Coston2 Explorer](https://coston2-explorer.flare.network)
- ✅ Users can read contract directly
- ✅ Transparency for hackathon judges

---

## 📊 Contract Address in UI

The contract address appears in:

1. **My Policies Page** - Bottom of page
   - Displays `CONTRACT_ADDRESS` from `src/lib/contract.js`
   - Links to Coston2 Explorer

2. **Transaction Confirmations**
   - After creating a policy
   - After submitting a claim

3. **Environment Configuration**
   - Can be overridden via `.env` file
   - Allows switching between demo/production contracts

---

## 🔐 Security Considerations

### Demo vs Production

| Aspect | Demo (Current) | Production |
|--------|---------------|------------|
| Address Source | Hardcoded placeholder | Environment variable |
| Network | Coston2 Testnet | Flare Mainnet |
| Funds | Test tokens (no value) | Real C2FLR/USDC |
| Contract Verification | Not required | **Required** |
| Audit | Not audited | **Must audit before mainnet** |

### Why Not Use 0x000...000?

The "zero address" (`0x0000000000000000000000000000000000000000`) has special meaning:
- Represents "no address" or "burn address"
- Cannot execute contract code
- Would cause all transactions to **fail**

Using a realistic placeholder address:
- ✅ Demonstrates proper address format
- ✅ Would work if contract existed at that address
- ✅ Avoids technical errors in UI/blockchain interactions
- ✅ Looks professional for judges

---

## 🧪 Testing Without Deployment

You can test the full flow without deploying by using:

1. **Mock Mode** - Backend simulates blockchain
2. **Hardhat Local Node** - Run local blockchain
3. **Coston2 Testnet** - Deploy to real testnet (recommended)

### Hardhat Local Node (Quick Testing)

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Update .env
VITE_CONTRACT_ADDRESS=0xLocalDeployedAddress
```

---

## 📚 Additional Resources

- [Flare Documentation](https://docs.flare.network/)
- [Coston2 Testnet Info](https://coston2-explorer.flare.network/)
- [Hardhat Deployment Guide](https://hardhat.org/hardhat-runner/docs/guides/deploying)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

## 🎯 For Hackathon Submission

When submitting to judges:

1. **Include this documentation** in your repo
2. **Explain the demo address** is a placeholder
3. **Show deployment script** in `/contracts` directory
4. **Provide testnet deployment** (if time permits)
5. **Document environment variables** needed for production

**Key Message:** The placeholder address demonstrates understanding of Ethereum address format and deployment process, even if not deployed due to hackathon time constraints.

---

## 💡 Quick Summary for Judges

> **Q: Why is the contract address not all zeros?**
> 
> A: The zero address (`0x000...000`) is a special "burn address" that cannot hold smart contract code. We use a realistic placeholder address that follows Ethereum's address format (0x + 40 hex chars). In production, this would be replaced with the actual deployed contract address via environment variable.

> **Q: Is this a real deployed contract?**
> 
> A: This is a demo placeholder. The full deployment process is documented above. For hackathon purposes, the backend simulates blockchain interactions. Real deployment would follow: compile → deploy to Coston2 → verify on explorer → update .env.

> **Q: How would you deploy for production?**
> 
> A: 1) Deploy contract to Flare Coston2 using Hardhat, 2) Verify on block explorer, 3) Update VITE_CONTRACT_ADDRESS in .env, 4) Test end-to-end, 5) Audit contract, 6) Deploy to Flare Mainnet when ready.

---

**Need Help?** Check the [InClaim GitHub Repository](https://github.com/CameliaBenlamlih/InClaim) for full deployment scripts and contract source code.
