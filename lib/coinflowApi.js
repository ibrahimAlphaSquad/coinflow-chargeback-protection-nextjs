/**
 * Frontend API client for Coinflow flows.
 * All calls go through Next.js API routes that proxy to Coinflow.
 */

const BASE = '/api/payments/coinflow';

async function fetchApi(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.details || 'Request failed');
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

/**
 * Create a card/Apple Pay/Google Pay deposit.
 * Returns redirectUrl to display in iframe.
 */
export async function createCoinflowDeposit({
  amount,
  currency = 'USD',
  paymentMethods = ['card'],
  userId,
  email,
  deviceId,
}) {
  const data = await fetchApi('/deposit', {
    method: 'POST',
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency,
      paymentMethods,
      userId,
      email,
      deviceId,
    }),
  });
  return data.redirectUrl || data.link;
}

/**
 * Create a withdrawal (card, SEPA, or PIX).
 */
export async function createCoinflowWithdrawal({
  token,
  amount,
  currency = 'USD',
  speed = 'card',
  userId,
  paymentMethod,
}) {
  return fetchApi('/withdrawal', {
    method: 'POST',
    body: JSON.stringify({
      token,
      amount: Math.round(Number(amount) * 100),
      currency,
      speed: speed || (paymentMethod === 'sepa' ? 'iban' : paymentMethod === 'pix' ? 'pix' : 'card'),
      userId,
    }),
  });
}

/**
 * Get saved cards, IBANs, and PIX keys.
 */
export async function getCoinflowCards(userId) {
  return fetchApi(`/cards?userId=${encodeURIComponent(userId)}`);
}

/**
 * Add a card token (from CoinflowCardNumberInput getToken()).
 */
export async function addCoinflowCard({ token, expYear, expMonth, userId, address }) {
  return fetchApi('/cards', {
    method: 'POST',
    body: JSON.stringify({
      cardToken: token,
      expYear: String(expYear).slice(-2),
      expMonth: String(expMonth).padStart(2, '0'),
      userId,
      address,
    }),
  });
}

/**
 * Register or use saved IBAN for SEPA.
 */
export async function addCoinflowIban({ iban, firstName, lastName, country, email, userId, token }) {
  return fetchApi('/ibans', {
    method: 'POST',
    body: JSON.stringify({
      number: iban,
      firstName,
      lastName,
      country,
      email,
      userId,
      token,
    }),
  });
}

/**
 * Create PIX deposit or add PIX key.
 */
export async function addCoinflowPixKey({ pixKey, keyType, userId }) {
  return fetchApi('/pix', {
    method: 'POST',
    body: JSON.stringify({
      pixKey,
      keyType,
      userId,
    }),
  });
}

/**
 * Send fraud/risk event (sign-up, KYC, etc.).
 */
export async function sendCoinflowPayerEvent({ eventType, userId, email, ...rest }) {
  return fetchApi('/event', {
    method: 'POST',
    body: JSON.stringify({
      eventType,
      userId,
      email,
      ...rest,
    }),
  });
}

/**
 * Get session key for card tokenization (CoinflowCardNumberInput).
 */
export async function getCoinflowSessionKey(userId, deviceId) {
  const data = await fetchApi(
    `/session-key?userId=${encodeURIComponent(userId)}${deviceId ? `&deviceId=${encodeURIComponent(deviceId)}` : ''}`
  );
  return data.key || data.sessionKey;
}
