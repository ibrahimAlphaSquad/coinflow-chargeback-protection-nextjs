import { getSessionKey, baseUrl, buildCoinflowHeaders } from '@/lib/coinflowServer';

/**
 * GET /api/payments/coinflow/cards
 * Returns saved cards, IBANs, PIX keys.
 * Query: userId
 */
export async function GET(request) {
  const apiKey = process.env.COINFLOW_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'COINFLOW_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'demo-user';

  try {
    const sessionKey = await getSessionKey(userId);
    const res = await fetch(`${baseUrl}/api/customer/v2`, {
      method: 'GET',
      headers: buildCoinflowHeaders({
        'x-coinflow-auth-session-key': sessionKey,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Customer fetch failed: ${res.status}`);
    }
    const data = await res.json();
    return Response.json(data.customer || data);
  } catch (err) {
    console.error('Get cards error:', err);
    return Response.json(
      { error: 'Failed to get payment methods', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/coinflow/cards
 * Add debit card token.
 * Body: cardToken, expYear, expMonth, userId, address (optional)
 */
export async function POST(request) {
  const apiKey = process.env.COINFLOW_API_KEY;
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;
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

  const { cardToken, expYear, expMonth, userId = 'demo-user', address } = body;
  if (!cardToken || !expYear || !expMonth) {
    return Response.json(
      { error: 'Missing cardToken, expYear, or expMonth' },
      { status: 400 }
    );
  }

  const payload = {
    cardToken,
    expYear: String(expYear).slice(-2),
    expMonth: String(expMonth).padStart(2, '0'),
    merchantId: merchantId || '',
  };
  if (address && typeof address === 'object') {
    payload.address = address;
  }

  let res;
  try {
    res = await fetch(`${baseUrl}/api/withdraw/debit-card`, {
      method: 'POST',
      headers: buildCoinflowHeaders({
        'x-coinflow-auth-user-id': userId,
      }),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Add card failed: ${res.status}`);
    }
    return Response.json(data);
  } catch (err) {
    console.error('Add card error:', err);
    return Response.json(
      { error: 'Failed to add card', details: err.message },
      { status: res?.status || 500 }
    );
  }
}
