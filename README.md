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

Edit `.env` and set your `NEXT_PUBLIC_MERCHANT_ID`.

### 3. Run

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

## Integration checklist

- [x] `<CoinflowProtection />` is rendered on **every page** (in root layout)
- [ ] `chargebackProtectionData` is passed to **every** `<CoinflowPurchase>`
- [ ] `productType` value confirmed with Coinflow
- [ ] `rawProductData` includes as many product fields as possible
- [ ] `NEXT_PUBLIC_SANDBOX=false` set before going to production
- [ ] Production `partnerId` received from Coinflow (used internally by the SDK)

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
