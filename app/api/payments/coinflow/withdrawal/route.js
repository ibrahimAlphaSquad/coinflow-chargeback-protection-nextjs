import { baseUrl, buildCoinflowHeaders, deriveWalletFromUserId } from '@/lib/coinflowServer';

/**
 * POST /api/payments/coinflow/withdrawal
 * Create a withdrawal (card, SEPA, or PIX).
 * Body: token, amount (cents or dollars), currency, speed, userId
 */
export async function POST(request) {
  const apiKey = process.env.COINFLOW_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'COINFLOW_API_KEY is not configured' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { token, amount, currency = 'USD', speed, userId = 'demo-user' } = body;

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  const cents = Number(amount) > 100 ? Math.round(Number(amount)) : Math.round(Number(amount) * 100);
  const { pubkey } = deriveWalletFromUserId(userId);

  const payoutSpeed = speed || 'card';
  const payload = {
    wallet: pubkey,
    blockchain: 'solana',
    userId,
    amount: { cents },
    speed: payoutSpeed,
    account: token,
  };

  try {
    const res = await fetch(`${baseUrl}/api/merchant/withdraws/payout`, {
      method: 'POST',
      headers: buildCoinflowHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Withdrawal failed: ${res.status}`);
    }
    return Response.json(data);
  } catch (err) {
    console.error('Withdrawal error:', err);
    return Response.json(
      { error: 'Failed to create withdrawal', details: err.message },
      { status: 500 }
    );
  }
}
