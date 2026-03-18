'use client';

import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { CoinflowPurchase } from '@coinflowlabs/react';
import { useChargebackProtectionData } from '@/hooks/useChargebackProtectionData';

/**
 * CheckoutPage.jsx
 *
 * STEP 2 — Pass chargebackProtectionData to every <CoinflowPurchase>.
 *
 * For card-only checkout: we create a Coinflow customer via API, then use the
 * wallet derived from userId. Requires COINFLOW_API_KEY in .env.
 */

// ─── Demo data — replace with your real cart / product data ─────────────────
const DEMO_CART = [
  {
    id: 'sword12345',
    name: 'Legendary Sword',
    productType: 'inGameProduct',   // Contact Coinflow for your value
    quantity: 1,
    unitPrice: '29.99',
    currency: 'USD',
    description: 'A legendary sword with magical powers.',
    category: 'Weapon',
    imageUrl: 'https://example.com/images/sword.png',
    extraData: {
      weight: '15 lbs',
      dimensions: '40 in x 5 in',
      origin: 'Ancient Kingdom',
      craftedBy: 'Master Blacksmith',
      craftingDate: '2024-06-19',
    },
  },
  {
    id: 'shield99',
    name: 'Dragon Shield',
    productType: 'inGameProduct',
    quantity: 1,
    unitPrice: '19.99',
    currency: 'USD',
    description: 'An unbreakable shield forged from dragon scales.',
    category: 'Armor',
    imageUrl: 'https://example.com/images/shield.png',
    extraData: {
      weight: '10 lbs',
      material: 'Dragon Scale',
    },
  },
];
// ────────────────────────────────────────────────────────────────────────────

const DEMO_USER_ID = 'demo-user';
const DEMO_EMAIL = 'demo@example.com';

function getDeviceId(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const attempt = () => {
      const id = typeof window !== 'undefined' && window?.nSureSDK?.getDeviceId?.();
      if (id) return resolve(id);
      if (Date.now() - start > timeoutMs) return resolve('');
      setTimeout(attempt, 100);
    };
    attempt();
  });
}

export default function CheckoutPage() {
  const [purchased, setPurchased] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [walletError, setWalletError] = useState(null);

  // Create Coinflow customer and get wallet (required for x-coinflow-auth-wallet)
  useEffect(() => {
    const run = async () => {
      try {
        const deviceId = await getDeviceId();
        const res = await fetch('/api/coinflow/create-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: DEMO_USER_ID, email: DEMO_EMAIL, deviceId }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.details || data.error);
        setWallet({ publicKey: new PublicKey(data.pubkey) });
      } catch (err) {
        setWalletError(err.message);
      }
    };
    run();
  }, []);

  const transaction = undefined;

  const amount = DEMO_CART.reduce(
    (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
    0
  ).toFixed(2);

  // Build chargebackProtectionData from the cart
  const chargebackProtectionData = useChargebackProtectionData(DEMO_CART);

  if (purchased) {
    return (
      <div style={styles.successBox}>
        <h2>Purchase complete!</h2>
        <p>Your chargeback-protected transaction was submitted successfully.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Checkout</h2>

      {/* Order summary */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Order Summary</h3>
        {DEMO_CART.map((item) => (
          <div key={item.id} style={styles.lineItem}>
            <span>{item.name} × {item.quantity}</span>
            <span>${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={styles.divider} />
        <div style={{ ...styles.lineItem, fontWeight: 600 }}>
          <span>Total</span>
          <span>${amount}</span>
        </div>
      </div>

      {/*
        STEP 2 — CoinflowPurchase with chargebackProtectionData.
        Replace wallet, transaction, subtotal, and blockchain with your real values.
      */}
      <div style={styles.paymentCard}>
        <h3 style={styles.sectionTitle}>Payment Methods</h3>
        {walletError && (
          <div style={styles.error}>
            <strong>Could not load checkout:</strong> {walletError}
            <p style={{ marginTop: 8, fontSize: 13 }}>
              Add COINFLOW_API_KEY to .env and ensure your merchant ID is valid.
            </p>
          </div>
        )}
        {!wallet && !walletError && (
          <div style={styles.loading}>Setting up checkout…</div>
        )}
        {wallet ? (
          <div style={styles.paymentMethodsWrapper}>
            <CoinflowPurchase
              wallet={wallet}
              merchantId={process.env.NEXT_PUBLIC_MERCHANT_ID}
              transaction={transaction}
              subtotal={{ cents: Math.round(Number(amount) * 100), currency: 'USD' }}
              blockchain="solana"
              env={process.env.NEXT_PUBLIC_SANDBOX === 'true' ? 'sandbox' : 'prod'}
              chargebackProtectionData={chargebackProtectionData}
              onSuccess={() => setPurchased(true)}
              loaderBackground="#ffffff"
              theme={{
                primary: '#2563eb',
                background: '#ffffff',
                backgroundAccent: '#f8fafc',
                backgroundAccent2: '#f1f5f9',
                textColor: '#1e293b',
              }}
            />

          </div>
        ) : <div style={styles.secureBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secured by Coinflow
        </div>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 720,
    margin: '40px auto',
    padding: '0 24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#1e293b',
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 28,
    letterSpacing: '-0.02em',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: '24px 28px',
    marginBottom: 24,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  paymentCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: '24px 28px',
    marginBottom: 24,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  paymentMethodsWrapper: {
    position: 'relative',
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  secureBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid #f1f5f9',
    fontSize: 13,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 16,
  },
  lineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 15,
    marginBottom: 10,
  },
  divider: {
    borderTop: '1px solid #e2e8f0',
    margin: '12px 0',
  },
  error: {
    padding: 14,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    color: '#991b1b',
  },
  loading: {
    padding: 28,
    color: '#64748b',
    textAlign: 'center',
  },
  successBox: {
    maxWidth: 480,
    margin: '80px auto',
    textAlign: 'center',
    padding: '0 24px',
  },
};
