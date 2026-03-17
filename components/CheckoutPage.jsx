'use client';

import { useMemo, useState } from 'react';
import { CoinflowPurchase } from '@coinflowlabs/react';
import { useChargebackProtectionData } from '@/hooks/useChargebackProtectionData';

/**
 * CheckoutPage.jsx
 *
 * STEP 2 — Pass chargebackProtectionData to every <CoinflowPurchase>.
 *
 * Replace the demo `wallet`, `transaction`, and `cartItems` values with your
 * real data. The wallet object shape depends on the blockchain you use
 * (Solana, Ethereum, Polygon, etc.) — refer to the Coinflow docs for details.
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

export default function CheckoutPage() {
  const [purchased, setPurchased] = useState(false);

  // Replace with your real wallet connection (useWallet, wagmi, etc.)
  const wallet = useMemo(() => ({
    /* your wallet object here */
  }), []);

  // Replace with your real transaction object
  const transaction = useMemo(() => ({
    /* your transaction object here */
  }), []);

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
        <h3 style={styles.sectionTitle}>Order summary</h3>
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
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Payment</h3>
        <CoinflowPurchase
          wallet={wallet}
          merchantId={process.env.NEXT_PUBLIC_MERCHANT_ID}
          transaction={transaction}
          subtotal={{ cents: Math.round(Number(amount) * 100), currency: 'USD' }}
          blockchain="solana"                          // Change to your blockchain
          env={process.env.NEXT_PUBLIC_SANDBOX === 'true' ? 'sandbox' : 'prod'}
          chargebackProtectionData={chargebackProtectionData}
          onSuccess={() => setPurchased(true)}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 560,
    margin: '40px auto',
    padding: '0 24px',
    fontFamily: 'system-ui, sans-serif',
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 24,
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 20,
    background: '#fff',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 14,
  },
  lineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 15,
    marginBottom: 10,
  },
  divider: {
    borderTop: '1px solid #e5e7eb',
    margin: '12px 0',
  },
  successBox: {
    maxWidth: 480,
    margin: '80px auto',
    textAlign: 'center',
    padding: '0 24px',
  },
};
