# InClaim Demo Purchase Flow - Setup Guide

## 🎯 What This Is

A complete **end-to-end demo** of the InClaim purchase flow where users:
1. **Search** for flights/trains with live provider quotes
2. **Purchase** tickets directly inside InClaim (not manual price entry)
3. **Track** their trip with real-time status monitoring
4. **Get verified refunds** via Flare FDC (mandatory verification gate)
5. **Automatic settlement** based on fixed compensation policies

**Critical:** All existing UI routes (`/`, `/create`, `/policies`, `/claim`, `/how-it-works`) remain **completely intact**. The demo runs on separate `/demo/*` routes.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Running backend server

### 1. Install Dependencies (if not already done)

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║              InClaim Backend - Demo Edition                ║
║         "File in a flash, get your cash" 🚀                ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on http://localhost:3001                   ║
```

### 3. Start Frontend

```bash
npm run dev
```

### 4. Access Demo Flow

Open browser to: **http://localhost:5173/demo**

---

## 📱 Demo Routes

| Route | Description |
|-------|-------------|
| `/demo` | Search landing page (flight/train selector + location search) |
| `/demo/results` | Live provider quotes with dynamic pricing |
| `/demo/checkout` | Payment flow + wallet connection |
| `/demo/trip/:bookingId` | Trip tracking + FDC verification + settlement |

**Existing routes remain unchanged:**
- `/` - Original homepage
- `/create` - Original create policy page
- `/policies` - My policies
- `/claim/:id` - Claim page
- `/how-it-works` - How it works page

---

## 🎬 Demo Flow Step-by-Step

### Step 1: Search
1. Go to `/demo`
2. Select **Flight** or **Train**
3. Enter origin (e.g., "London") → autocomplete shows airports/stations
4. Enter destination (e.g., "Paris")
5. Select travel date and passengers
6. Click **Search Live Quotes**

### Step 2: Browse Quotes
- See live quotes from multiple providers (British Airways, Air France, Eurostar, etc.)
- Quotes auto-refresh every 15 seconds with price changes (±5%)
- Each quote shows:
  - Provider name and trip ID
  - Departure/arrival times
  - Duration
  - Price with trend indicator (↑↓)
  - Fare class, baggage, seats available
- Click any quote to select

### Step 3: Checkout
- Review trip summary
- Enter passenger name and email
- Connect wallet (if not connected)
- Click **Pay & Book**
- Watch progress:
  1. Processing payment... (2s simulation)
  2. Booking with provider... (calls backend API)
  3. Booking confirmed! (PNR generated, email sent)
- Auto-redirects to trip page

### Step 4: Track Trip
**Trip Details:**
- View booking confirmation (PNR, passenger info, times)
- Live status tracking (on time / delayed / cancelled)
- Click **Refresh** to update status

**FDC Verification (CRITICAL):**
- Status data must be verified via FDC before settlement
- Click **Verify with FDC** button
- Backend calls FDC verification service (~2s)
- Shows:
  - ✅ Verification Successful or ❌ Failed
  - Verification ID
  - Attestation hash (proof on Flare)
  - Data integrity check
  - Timestamp

**Settlement:**
- Only available after successful FDC verification
- Click **Execute Settlement**
- Backend calculates refund based on **fixed policy**:
  - On time: 0% refund
  - 3-23h delay: 20% refund
  - ≥24h delay: 50% refund
  - Cancelled: 100% refund
- Shows breakdown:
  - Policy applied
  - Your refund amount
  - Provider receives amount
  - Transaction hash (simulated on-chain tx)

---

## 🔧 Backend Services

### Provider Quotes Service
**File:** `backend/src/services/providerQuotesService.ts`

- Generates realistic quotes from multiple providers
- Dynamic pricing (changes every 10 seconds)
- Returns: price, provider, times, fare class, baggage, seats

**API:** `GET /api/demo/quotes?origin=LHR&destination=CDG&date=2026-02-10&tripType=flight`

### Provider Booking Service
**File:** `backend/src/services/providerBookingService.ts`

- Creates instant booking with provider
- Generates airline-style PNR (6 chars: ABC123)
- Simulates 95% success rate
- Sends confirmation email (console log)

**API:** `POST /api/demo/purchase`

### Status Oracle Service
**File:** `backend/src/services/statusOracleService.ts`

- **Adapter pattern** for real/mock status data
- Currently uses **mock adapter** (no API keys needed)
- Returns: status, delay minutes, gate/terminal/platform, timestamps
- Mock simulates realistic delays:
  - 70% on time
  - 15% minor delay (30-210 min)
  - 10% major delay (6-16 hours)
  - 5% cancelled

**To use real APIs:** Implement `RealStatusAdapter` with AviationStack, FlightRadar24, etc.

**API:** `GET /api/demo/status/:tripId?tripType=flight&date=2026-02-10`

### FDC Verification Service
**File:** `backend/src/services/fdcVerificationService.ts`

**CRITICAL REQUIREMENT:** All settlements MUST pass FDC verification.

- Currently uses **mock FDC verifier** (simulates Flare FDC)
- 98% success rate simulation
- Generates attestation hash
- Checks data integrity

**To use real FDC:** 
1. Deploy FDC contract on Flare
2. Configure attestation providers
3. Implement `RealFDCVerifier` class
4. Set `useMock: false` in initialization

**API:** `POST /api/demo/fdc/verify`

### Settlement Engine
**File:** `backend/src/services/settlementEngine.ts`

**FIXED COMPENSATION POLICY** (hardcoded, not user-editable):

```typescript
export const SETTLEMENT_POLICY = {
  ON_TIME: { userRefundPercent: 0, providerReceivesPercent: 100 },
  MINOR_DELAY: { minDelayMinutes: 180, userRefundPercent: 20, providerReceivesPercent: 80 },
  MAJOR_DELAY: { minDelayMinutes: 1440, userRefundPercent: 50, providerReceivesPercent: 50 },
  CANCELLATION: { userRefundPercent: 100, providerReceivesPercent: 0 },
}
```

- Requires successful FDC verification (throws error if verification failed)
- Calculates split based on delay minutes
- Simulates on-chain transaction (~2-4s)
- Returns transaction hash

**API:** `POST /api/demo/settle`

---

## 🎨 Frontend Components

### DemoLanding
**File:** `src/pages/demo/DemoLanding.jsx`

- Hero section with InClaim branding + slogan
- Flight/Train toggle
- Autocomplete for origin/destination (150+ airports, 100+ stations)
- Date picker and passenger selector
- Beautiful, modern, animated UI

### DemoResults
**File:** `src/pages/demo/DemoResults.jsx`

- Quote cards with provider info, times, price
- Price trend indicators (↑↓ or stable)
- Auto-refresh every 15 seconds
- Animated list with framer-motion
- Click quote → navigate to checkout

### DemoCheckout
**File:** `src/pages/demo/DemoCheckout.jsx`

- Passenger information form
- Wallet connection (Wagmi + Reown AppKit)
- Trip summary sidebar
- Purchase progress stages:
  1. Paying
  2. Booking with provider
  3. Complete (shows PNR)
- Auto-redirect to trip page

### DemoTrip
**File:** `src/pages/demo/DemoTrip.jsx`

- Trip details card (PNR, passenger, route, times)
- **Live status tracking** with refresh button
- **FDC Verification card:**
  - "Verify with FDC" button
  - Shows verification result, attestation hash, data integrity
- **Settlement card:**
  - Only shown after successful FDC verification
  - "Execute Settlement" button
  - Shows policy applied, refund breakdown, transaction hash
- **Sidebar:**
  - Fixed compensation policy display
  - Payment details
  - Escrow status

---

## 🧪 Testing the Demo

### Test Scenario 1: On-Time Trip
1. Create booking
2. Check status → likely "on_time" (70% probability)
3. Verify with FDC → should succeed
4. Execute settlement → 0% refund (all to provider)

### Test Scenario 2: Delayed Trip
1. Create booking
2. Check status → might show "delayed" (25% probability)
3. Note delay minutes
4. Verify with FDC
5. Execute settlement:
   - If 3-23h delay → 20% refund
   - If ≥24h delay → 50% refund

### Test Scenario 3: Cancelled Trip
1. Create booking
2. Check status → might show "cancelled" (5% probability)
3. Verify with FDC
4. Execute settlement → 100% refund

### Refresh Status Until You Get Desired Scenario
- Click "Refresh" button on trip page
- Mock adapter generates new random status each time
- Keep refreshing until you get the scenario you want to demo

---

## 🔌 API Endpoints Reference

### Demo Endpoints (NEW)

```bash
# Search quotes
GET /api/demo/quotes?origin=LHR&destination=CDG&date=2026-02-10&tripType=flight&passengers=1

# Refresh single quote price
GET /api/demo/quotes/:quoteId/refresh

# Purchase ticket
POST /api/demo/purchase
Body: { quoteId, passengerName, passengerEmail, walletAddress }

# Get booking details
GET /api/demo/booking/:bookingId

# Get trip status
GET /api/demo/status/:tripId?tripType=flight&date=2026-02-10

# FDC verification (REQUIRED before settlement)
POST /api/demo/fdc/verify
Body: { tripId, tripType, date }

# Execute settlement (requires FDC verification)
POST /api/demo/settle
Body: { bookingId }

# Get settlement by booking
GET /api/demo/settlement/:bookingId

# Get fixed compensation policy
GET /api/demo/policy
```

### Legacy Endpoints (UNCHANGED)
```bash
POST /api/claim              # Process claim with FDC
GET  /api/claim/:id          # Get policy status
GET  /api/health/status      # System status
```

---

## 🎓 Key Concepts

### 1. No Manual Price Entry
- Users NEVER enter ticket price manually
- Prices come from provider quotes API
- Quotes refresh automatically showing market dynamics

### 2. FDC Verification Gate
- **MANDATORY** before any settlement/refund
- Verifies trip status data authenticity
- Returns attestation hash (proof on Flare blockchain)
- Settlement endpoint rejects requests without valid FDC verification

### 3. Fixed Compensation Policy
- **NOT user-editable**
- Hardcoded in `SETTLEMENT_POLICY` constant
- UI displays policy as read-only
- Backend enforces policy in settlement calculations

### 4. Escrow Model
- Funds locked at purchase time
- Released only after FDC-verified settlement
- Split calculated based on verified delay/cancellation status
- Simulates on-chain smart contract interaction

### 5. Timeline UX
The demo shows a clear progression:
```
Quote → Pay → Book → Track → FDC Verify → Settle
```

Each stage is visually distinct with status indicators, progress loaders, and success confirmations.

---

## 🛠️ Customization

### Add Real Flight API
1. Get API key from AviationStack or FlightAware
2. Edit `backend/src/services/statusOracleService.ts`
3. Implement `RealStatusAdapter.getFlightStatus()`
4. Initialize with `initializeStatusOracle(false)` (use real adapter)

### Add Real FDC Integration
1. Deploy FDC contract on Flare testnet/mainnet
2. Configure attestation providers
3. Edit `backend/src/services/fdcVerificationService.ts`
4. Implement `RealFDCVerifier.verify()`
5. Initialize with config:
```typescript
initializeFDCVerifier(false, {
  contractAddress: '0x...',
  providers: ['provider1', 'provider2']
});
```

### Modify Compensation Policy
Edit `backend/src/services/settlementEngine.ts`:
```typescript
export const SETTLEMENT_POLICY = {
  // Change percentages here
  MINOR_DELAY: {
    minDelayMinutes: 180,  // Change threshold
    userRefundPercent: 20, // Change percentage
    providerReceivesPercent: 80,
  },
  // ...
}
```

### Add More Providers
Edit `backend/src/services/providerQuotesService.ts`:
```typescript
const PROVIDERS: QuoteProvider[] = [
  { id: 'BA', name: 'British Airways', type: 'flight' },
  { id: 'YOUR_AIRLINE', name: 'Your Airline', type: 'flight' }, // Add here
  // ...
];
```

---

## 🐛 Troubleshooting

### "Quote not found or expired"
- Quotes are generated dynamically
- If you wait too long between search and checkout, quote ID may not be reconstructed properly
- Solution: Search again to generate fresh quotes

### "FDC verification failed"
- Mock FDC has 2% simulated failure rate
- Click "Verify with FDC" again
- In production, investigate FDC attestation provider availability

### "Settlement rejected: FDC verification failed"
- You must verify trip status via FDC BEFORE settlement
- Click "Verify with FDC" on trip page first
- Wait for ✅ Verification Successful
- Then click "Execute Settlement"

### Prices not updating
- Auto-refresh is every 15 seconds
- Click "Refresh Quotes" button manually
- Check backend console for API errors

### Backend not responding
- Ensure backend is running: `cd backend && npm run dev`
- Check port 3001 is not in use
- Verify CORS is enabled (already configured)

---

## 📊 Demo Control Panel (Admin)

For live presentations, you can manually set trip status:

```bash
POST /api/demo/admin/set-status
Body: {
  tripId: "BA123",
  date: "2026-02-10",
  status: "delayed",  # or "on_time", "cancelled"
  delayMinutes: 240
}
```

**Note:** Only available when using mock adapter. Real APIs cannot be manually controlled.

---

## 🎯 Presentation Tips

### For Live Demo on Stage

1. **Pre-create a booking** before going on stage
   - Save the PNR/booking ID
   - Navigate directly to `/demo/trip/:bookingId`
   
2. **Show the key differentiators:**
   - ✅ Live quotes (not manual price entry)
   - ✅ Instant booking confirmation
   - ✅ FDC verification gate (critical security)
   - ✅ Fixed, transparent policies
   - ✅ Automatic settlement

3. **Emphasize "No FDC = No Settlement"**
   - Try to settle without FDC verification → error
   - Verify with FDC → success
   - Then settle → works

4. **Show the math:**
   - Point to fixed policy sidebar
   - Show delay amount
   - Show calculated refund matches policy
   - Show provider still gets their share (fair)

### Key Talking Points

- **"File in a flash, get your cash"** - emphasize speed
- **"Buy inside InClaim"** - not bringing external tickets
- **"Live market quotes"** - see prices change in real-time
- **"FDC verified refunds"** - trustless, tamper-proof
- **"Fixed compensation"** - transparent, predictable, fair
- **"Blockchain escrow"** - funds secure, automatic release

---

## 🚦 What's Next

### For Production Deployment

1. **Replace mock adapters with real APIs:**
   - Flight status: AviationStack, FlightRadar24, FlightAware
   - Train status: National rail APIs, SNCF, DB
   - FDC: Real Flare Data Connector contract

2. **Deploy smart contracts:**
   - Escrow contract on Flare Network
   - FDC attestation integration
   - Update frontend to call real contract methods

3. **Add payment processing:**
   - Real USDC/stablecoin integration
   - Wallet transaction signing
   - Gas fee handling

4. **Database integration:**
   - Replace in-memory Maps with PostgreSQL/MongoDB
   - Store bookings, settlements, FDC verifications
   - Add booking history and user accounts

5. **Email service:**
   - Replace console.log with real email API (SendGrid, Mailgun)
   - Send actual confirmation emails

6. **Error handling and retry logic:**
   - Handle API timeouts gracefully
   - Retry failed FDC verifications
   - Fallback strategies

7. **Security hardening:**
   - Rate limiting on APIs
   - Input validation and sanitization
   - Authentication and authorization

---

## 📝 Summary

This demo implementation provides a **complete, production-quality UI/UX** for the InClaim purchase flow. It's built as a separate `/demo` route system that **does not interfere** with existing functionality.

**Core principles implemented:**
✅ No manual ticket price entry  
✅ Live provider quotes with dynamic pricing  
✅ Instant booking with confirmation  
✅ Real-time trip tracking  
✅ Mandatory FDC verification gate  
✅ Fixed, non-editable compensation policies  
✅ Transparent settlement calculations  
✅ Escrow-based fund management  

**Existing UI preserved:**
✅ All original routes (`/`, `/create`, `/policies`, etc.) work unchanged  
✅ No breaking changes to legacy functionality  
✅ Clean separation of concerns  

Ready for presentation and further development! 🚀
