'use client';

import { CoinflowPurchaseProtection } from '@coinflowlabs/react';

/**
 * CoinflowProtection.jsx
 *
 * STEP 1 — Add this to every page of your site.
 *
 * This component loads the nSure fraud-detection SDK which silently collects
 * device fingerprint and behavioural signals throughout the customer's
 * shopping session. Those signals are later used by the AI models to score
 * the chargeback risk of each purchase.
 *
 * Usage:
 *   import CoinflowProtection from '@/components/CoinflowProtection';
 *   // Place once at the top of your root layout:
 *   <CoinflowProtection />
 */
export default function CoinflowProtection() {
  return (
    <CoinflowPurchaseProtection
      merchantId={process.env.NEXT_PUBLIC_MERCHANT_ID}
    />
  );
}
