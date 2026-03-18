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
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;

  // Skip when disabled (e.g. no valid merchant ID yet) or placeholder — prevents 404 / "Not Found" JSON errors
  if (!merchantId) {
    return null;
  }

  const coinflowEnv = process.env.NEXT_PUBLIC_SANDBOX === 'true' ? 'sandbox' : 'prod';

  return <CoinflowPurchaseProtection merchantId={merchantId} coinflowEnv={coinflowEnv} />;
}
