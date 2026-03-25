import { baseUrl, buildCoinflowHeaders, getSessionKey } from '@/lib/coinflowServer';

const PAYMENT_METHOD_MAP = {
  card: 'card',
  apple_pay: 'applePay',
  google_pay: 'googlePay',
  sepa: 'sepa',
  pix: 'pix',
};

/**
 * POST /api/payments/coinflow/deposit
 * Creates a deposit and returns redirectUrl (card) or SEPA/PIX details.
 * Body: amount (cents or dollars), currency, paymentMethods, userId, email, deviceId, paymentMethod (sepa|pix for non-card)
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

  const {
    amount,
    currency = 'USD',
    paymentMethods = ['card'],
    paymentMethod,
    userId = 'demo-user',
    email = 'demo@example.com',
    deviceId,
    // SEPA
    iban,
    token: ibanToken,
    firstName,
    lastName,
    country,
    // PIX
    pixKey,
    keyType,
  } = body;

  const cents = Number(amount) > 100 ? Math.round(Number(amount)) : Math.round(Number(amount) * 100);
  const subtotal = { currency, cents };

  // Card / Apple Pay / Google Pay — Get Checkout Link
  const isCard = !paymentMethod || ['card', 'apple_pay', 'google_pay'].includes(paymentMethod);
  if (isCard) {
    const allowedPaymentMethods = (paymentMethods || ['card']).map(
      (m) => PAYMENT_METHOD_MAP[m] || m
    ).filter(Boolean);
    if (allowedPaymentMethods.length === 0) allowedPaymentMethods.push('card');

    try {
      const res = await fetch(`${baseUrl}/api/checkout/link`, {
        method: 'POST',
        headers: buildCoinflowHeaders({
          'x-coinflow-auth-user-id': userId,
        }),
        body: JSON.stringify({
          subtotal,
          email,
          blockchain: 'solana',
          allowedPaymentMethods,
          settlementType: 'USDC',
          merchantId: merchantId || '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `Checkout link failed: ${res.status}`);
      }
      return Response.json({
        redirectUrl: data.link,
        link: data.link,
      });
    } catch (err) {
      console.error('Deposit (card) error:', err);
      return Response.json(
        { error: 'Failed to create deposit', details: err.message },
        { status: 500 }
      );
    }
  }

  // SEPA
  if (paymentMethod === 'sepa') {
    try {
      const sessionKey = await getSessionKey(userId, { deviceId });
      const endpoint = ibanToken
        ? `${baseUrl}/api/checkout/iban/token`
        : `${baseUrl}/api/checkout/iban`;
      const payload = ibanToken
        ? {
            token: ibanToken,
            subtotal: { ...subtotal, currency: currency === 'USD' ? 'EUR' : currency },
            merchantId: merchantId || '',
            settlementType: 'USDC',
          }
        : {
            subtotal: { ...subtotal, currency: currency === 'USD' ? 'EUR' : currency },
            data: {
              number: iban,
              firstName: firstName || 'User',
              lastName: lastName || 'Name',
              country: country || 'DE',
              email,
            },
            merchantId: merchantId || '',
            settlementType: 'USDC',
          };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: buildCoinflowHeaders({
          'x-coinflow-auth-session-key': sessionKey,
        }),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `SEPA deposit failed: ${res.status}`);
      }
      return Response.json(data);
    } catch (err) {
      console.error('Deposit (SEPA) error:', err);
      return Response.json(
        { error: 'Failed to create SEPA deposit', details: err.message },
        { status: 500 }
      );
    }
  }

  // PIX
  if (paymentMethod === 'pix') {
    try {
      const sessionKey = await getSessionKey(userId, { deviceId });
      const res = await fetch(`${baseUrl}/api/checkout/pix`, {
        method: 'POST',
        headers: buildCoinflowHeaders({
          'x-coinflow-auth-session-key': sessionKey,
        }),
        body: JSON.stringify({
          subtotal: { ...subtotal, currency: currency === 'USD' ? 'BRL' : currency },
          email,
          merchantId: merchantId || '',
          settlementType: 'USDC',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `PIX deposit failed: ${res.status}`);
      }
      return Response.json({ br_code: data.brCode || data.br_code, ...data });
    } catch (err) {
      console.error('Deposit (PIX) error:', err);
      return Response.json(
        { error: 'Failed to create PIX deposit', details: err.message },
        { status: 500 }
      );
    }
  }

  return Response.json(
    { error: 'Unsupported payment method', paymentMethod, paymentMethods },
    { status: 400 }
  );
}
