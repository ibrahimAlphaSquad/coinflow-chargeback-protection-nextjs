'use client';

import { useState } from 'react';
import { createCoinflowDeposit } from '@/lib/coinflowApi';
import { isCoinflowEnabled, isPixSepaEnabled } from '@/utils/featureFlags';

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

export default function DepositPage() {
  const [amount, setAmount] = useState('50');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [sepaData, setSepaData] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeposit = async () => {
    setError(null);
    setRedirectUrl(null);
    setSepaData(null);
    setPixData(null);
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const data = await fetch('/api/payments/coinflow/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount) || 0,
          currency: 'USD',
          paymentMethods: paymentMethod === 'card' ? ['card', 'apple_pay', 'google_pay'] : [paymentMethod],
          paymentMethod,
          userId: DEMO_USER_ID,
          email: DEMO_EMAIL,
          deviceId,
        }),
      });
      const res = await data.json();
      if (!data.ok) {
        throw new Error(res.error || res.details || 'Deposit failed');
      }
      if (res.redirectUrl || res.link) {
        setRedirectUrl(res.redirectUrl || res.link);
      } else if (res.account || res.paymentId) {
        setSepaData(res);
      } else if (res.br_code) {
        setPixData(res);
      } else {
        throw new Error('Unexpected response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showCard = isCoinflowEnabled;
  const showSepaPix = isPixSepaEnabled;

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Deposit</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Amount (USD)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 16,
            border: '1px solid #e2e8f0',
            borderRadius: 8,
          }}
        />
      </div>

      {(showCard || showSepaPix) && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Payment method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 16,
              border: '1px solid #e2e8f0',
              borderRadius: 8,
            }}
          >
            {showCard && (
              <>
                <option value="card">Card / Apple Pay / Google Pay</option>
              </>
            )}
            {showSepaPix && (
              <>
                <option value="sepa">SEPA</option>
                <option value="pix">PIX (Brazil)</option>
              </>
            )}
            {!showCard && !showSepaPix && (
              <option value="card">Card (disabled - enable feature flags)</option>
            )}
          </select>
        </div>
      )}

      {error && (
        <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#991b1b', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <button
        onClick={handleDeposit}
        disabled={loading || !amount}
        style={{
          padding: '12px 24px',
          fontSize: 16,
          fontWeight: 600,
          background: loading ? '#94a3b8' : '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Creating…' : 'Continue to payment'}
      </button>

      {redirectUrl && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Complete your payment</h2>
          <iframe
            src={redirectUrl}
            title="Coinflow payment"
            style={{ width: '100%', minHeight: 500, border: '1px solid #e2e8f0', borderRadius: 12 }}
          />
        </div>
      )}

      {sepaData && (
        <div style={{ marginTop: 32, padding: 24, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>SEPA payment instructions</h2>
          <p><strong>Account:</strong> {sepaData.account}</p>
          <p><strong>Amount:</strong> {sepaData.amount?.cents / 100} {sepaData.amount?.currency}</p>
          <p><strong>Reference:</strong> {sepaData.paymentId}</p>
          <p style={{ marginTop: 12, color: '#64748b' }}>Complete the transfer from your bank within 5 minutes.</p>
        </div>
      )}

      {pixData && pixData.br_code && (
        <div style={{ marginTop: 32, padding: 24, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>PIX payment</h2>
          <p><strong>BR Code:</strong></p>
          <code style={{ display: 'block', wordBreak: 'break-all', marginTop: 8 }}>{pixData.br_code}</code>
          <p style={{ marginTop: 12, color: '#64748b' }}>Use this code in your banking app to complete the payment within 5 minutes.</p>
        </div>
      )}
    </div>
  );
}
