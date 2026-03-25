'use client';

import { useRef, useState, useEffect } from 'react';
import {
  CoinflowCardNumberInput,
  CoinflowCvvInput,
} from '@coinflowlabs/react';
import { addCoinflowCard, createCoinflowWithdrawal, getCoinflowCards, getCoinflowSessionKey } from '@/lib/coinflowApi';
import { isCoinflowEnabled } from '@/utils/featureFlags';

const DEMO_USER_ID = 'demo-user';

const baseCss = {
  base: 'font-family: system-ui, sans-serif; padding: 0 12px; border: 1px solid #e2e8f0; margin: 0; width: 100%; font-size: 14px; line-height: 40px; height: 42px; box-sizing: border-box; border-radius: 8px;',
  focus: 'box-shadow: 0 0 0 2px #2563eb; border-color: #2563eb; outline: 0;',
  error: 'border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2);',
  cvv: {
    base: 'font-family: system-ui, sans-serif; padding: 0 12px; border: 1px solid #e2e8f0; margin: 0; width: 100%; font-size: 14px; line-height: 40px; height: 42px; box-sizing: border-box; border-radius: 8px;',
    focus: 'box-shadow: 0 0 0 2px #2563eb; border-color: #2563eb; outline: 0;',
    error: 'border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2);',
  },
};

export default function CardWithdrawForm() {
  const cardRef = useRef(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [amount, setAmount] = useState('25');
  const [useNewCard, setUseNewCard] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const env = process.env.NEXT_PUBLIC_SANDBOX === 'true' ? 'sandbox' : 'prod';
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const key = await getCoinflowSessionKey(DEMO_USER_ID);
        if (!cancelled) setSessionKey(key);
      } catch (e) {
        if (!cancelled) setError('Failed to get session key');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!sessionKey || !isCoinflowEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const customer = await getCoinflowCards(DEMO_USER_ID);
        const cards = customer?.cards || [];
        if (!cancelled) setSavedCards(cards);
      } catch {
        if (!cancelled) setSavedCards([]);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionKey]);

  const handleWithdraw = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      let token = selectedToken;
      if (useNewCard) {
        const { token: newToken } = await cardRef.current?.getToken?.();
        if (!newToken) throw new Error('Failed to get card token');
        await addCoinflowCard({
          token: newToken,
          expYear,
          expMonth,
          userId: DEMO_USER_ID,
        });
        token = newToken;
      }
      if (!token) throw new Error('No card selected');
      await createCoinflowWithdrawal({
        token,
        amount: parseFloat(amount) || 0,
        currency: 'USD',
        speed: 'card',
        userId: DEMO_USER_ID,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isCoinflowEnabled) {
    return (
      <div style={{ padding: 20, background: '#fef3c7', borderRadius: 12, color: '#92400e' }}>
        Card withdrawals are disabled. Set NEXT_PUBLIC_COINFLOW_ENABLED=true to enable.
      </div>
    );
  }

  if (!sessionKey || !merchantId) {
    return (
      <div style={{ padding: 20, color: '#64748b' }}>
        Loading checkout…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
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

      <div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Payment method</label>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="radio"
              name="cardMode"
              checked={useNewCard}
              onChange={() => { setUseNewCard(true); setSelectedToken(null); }}
            />
            New card
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="radio"
              name="cardMode"
              checked={!useNewCard}
              onChange={() => setUseNewCard(false)}
            />
            Saved card
          </label>
        </div>

        {useNewCard ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CoinflowCardNumberInput
              ref={cardRef}
              env={env}
              merchantId={merchantId}
              sessionKey={sessionKey}
              css={baseCss}
            />
            <CoinflowCvvInput />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Exp. month</label>
                <input
                  type="text"
                  placeholder="MM"
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Exp. year</label>
                <input
                  type="text"
                  placeholder="YY"
                  maxLength={2}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedCards.length === 0 ? (
              <p style={{ color: '#64748b' }}>No saved cards. Add a new card first.</p>
            ) : (
              savedCards.map((card) => (
                <label
                  key={card.token || card.last4}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    border: `2px solid ${selectedToken === card.token ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="savedCard"
                    checked={selectedToken === card.token}
                    onChange={() => setSelectedToken(card.token)}
                  />
                  <span>•••• {card.last4 || 'card'}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#991b1b' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, color: '#166534' }}>
          Withdrawal initiated successfully.
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={loading || (!useNewCard && !selectedToken)}
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
        {loading ? 'Processing…' : 'Withdraw'}
      </button>
    </div>
  );
}
