'use client';

import { useState } from 'react';
import CardWithdrawForm from '@/components/CardWithdrawForm';
import SepaWithdrawForm from '@/components/SepaWithdrawForm';
import PixWithdrawForm from '@/components/PixWithdrawForm';
import { isCoinflowEnabled, isPixSepaEnabled } from '@/utils/featureFlags';

export default function WithdrawPage() {
  const [method, setMethod] = useState(
    isCoinflowEnabled ? 'card' : isPixSepaEnabled ? 'sepa' : 'card'
  );

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 24px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Withdraw</h1>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Withdrawal method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 16,
            border: '1px solid #e2e8f0',
            borderRadius: 8,
          }}
        >
          {isCoinflowEnabled && <option value="card">Card</option>}
          {isPixSepaEnabled && (
            <>
              <option value="sepa">SEPA</option>
              <option value="pix">PIX</option>
            </>
          )}
          {!isCoinflowEnabled && !isPixSepaEnabled && (
            <option value="card">Card (enable feature flags)</option>
          )}
        </select>
      </div>

      {method === 'card' && <CardWithdrawForm />}
      {method === 'sepa' && <SepaWithdrawForm />}
      {method === 'pix' && <PixWithdrawForm />}
    </div>
  );
}
