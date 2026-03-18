# Coinflow Chargeback Protection — Next.js

A ready-to-use Next.js App Router integration for Coinflow's chargeback protection system.

## Project structure

```
app/
  layout.jsx              # Root layout — mounts CoinflowProtection globally
  page.jsx                 # Home page
  checkout/
    page.jsx               # Checkout route
components/
  CoinflowProtection.jsx    # Mount on EVERY page (loads nSure SDK)
  CheckoutPage.jsx         # CoinflowPurchase with chargebackProtectionData
  Nav.jsx                  # Navigation
hooks/
  useChargebackProtectionData.js  # Builds the data array from your cart
data/
  productTypes.js          # All valid productType values
```

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `NEXT_PUBLIC_MERCHANT_ID` — your Coinflow merchant ID
- `COINFLOW_API_KEY` — your API key from the Merchant Dashboard (e.g. `coinflow_sandbox_<key>` for sandbox)

### 3. Run

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

## Chargeback Protection (nSure SDK)

1. **nSure script** — Loaded in layout via `NSureScript` (uses `COINFTEST` for sandbox)
2. **`<CoinflowProtection />`** — Rendered in root layout with `coinflowEnv`
3. **`chargebackProtectionData`** — Passed to `CoinflowPurchase`
4. **`x-device-id`** — Sent with create-customer API (from `window.nSureSDK.getDeviceId()`)

For 403 errors: whitelist your domain in the [Coinflow Merchant Dashboard](https://sandbox-merchant.coinflow.cash/frame-ancestors).

## Integration checklist

- [x] nSure SDK script on every page
- [x] `<CoinflowProtection />` is rendered on **every page** (in root layout)
- [ ] `chargebackProtectionData` is passed to **every** `<CoinflowPurchase>`
- [ ] `productType` value confirmed with Coinflow
- [ ] `rawProductData` includes as many product fields as possible
- [ ] `NEXT_PUBLIC_SANDBOX=false` set before going to production
- [ ] Production `partnerId` received from Coinflow (used internally by the SDK)

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/coinflow/create-customer` | POST | Create a Coinflow customer and return a wallet for checkout |
| `/api/coinflow/withdraws` | GET | Fetch all merchant withdraws ([docs](https://docs.coinflow.cash/api-reference/api-reference/merchant/get-all-withdraws)) |

Query params for `/api/coinflow/withdraws`: `since`, `until`, `page`, `status`, `search`, `sortBy`, `sortDirection`, `speed`, `provider`, `limit`

## What each file does

| File | Purpose |
|------|---------|
| `CoinflowProtection.jsx` | Invisible component that loads the nSure fraud SDK on every page |
| `CheckoutPage.jsx` | Checkout UI — replace demo wallet/transaction with your real data |
| `useChargebackProtectionData.js` | Maps your cart items to the required data shape |
| `productTypes.js` | Reference list of all valid `productType` strings |

## Resources

- [Coinflow docs](https://docs.coinflow.cash)
- [Chargeback Protection overview](https://docs.coinflow.cash/guides/checkout/payment-security-risk-management/fraud-protection/about-chargeback-protection)
- [Card Checkout API reference](https://docs.coinflow.cash/api-reference/api-reference/checkout/card-checkout)
