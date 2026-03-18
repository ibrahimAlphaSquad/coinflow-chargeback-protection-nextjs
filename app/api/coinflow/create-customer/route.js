import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';

/**
 * Creates a Coinflow customer and returns the wallet for checkout.
 * The wallet is deterministically derived from userId — same userId = same pubkey.
 *
 * Required: COINFLOW_API_KEY in .env (get from Coinflow dashboard)
 */
export async function POST(request) {
  const apiKey = process.env.COINFLOW_API_KEY;
  const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;
  const env = process.env.NEXT_PUBLIC_SANDBOX === 'true' ? 'sandbox' : 'prod';
  const baseUrl = `https://api-${env}.coinflow.cash`;

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
    return Response.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { userId = 'demo-user', email = 'demo@example.com', deviceId } = body;

  // Build headers for Coinflow API calls — x-device-id required for chargeback protection
  const buildHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(deviceId && { 'x-device-id': deviceId }),
    ...extra,
  });

  // Derive wallet pubkey from userId first (required for session key request)
  const hash = crypto.createHash('sha256').update(userId).digest();
  const keypair = Keypair.fromSeed(hash.slice(0, 32));
  const pubkey = keypair.publicKey.toString();

  // 1. Get session key — x-coinflow-auth-wallet is required
  const sessionRes = await fetch(`${baseUrl}/api/auth/session-key`, {
    method: 'GET',
    headers: buildHeaders({
      Authorization: apiKey,
      'x-coinflow-auth-user-id': userId,
      'x-coinflow-auth-wallet': pubkey,
      'x-coinflow-auth-blockchain': 'solana',
      'x-coinflow-auth-merchant-id': merchantId || '',
    }),
  });

  if (!sessionRes.ok) {
    const err = await sessionRes.text();
    console.error('Coinflow session key error:', sessionRes.status, err);
    return Response.json(
      { error: 'Failed to get session key', details: err },
      { status: sessionRes.status }
    );
  }

  const { key: sessionKey } = await sessionRes.json();
  if (!sessionKey) {
    return Response.json(
      { error: 'No session key in response' },
      { status: 500 }
    );
  }

  // 2. Create customer — Authorization + x-coinflow-auth-wallet required
  const createRes = await fetch(`${baseUrl}/api/customer`, {
    method: 'POST',
    headers: buildHeaders({
      Authorization: apiKey,
      'x-coinflow-auth-session-key': sessionKey,
      'x-coinflow-auth-user-id': userId,
      'x-coinflow-auth-wallet': pubkey,
      'x-coinflow-auth-blockchain': 'solana',
    }),
    body: JSON.stringify({ email, customerInfo: { firstName: 'Demo', lastName: 'User' } }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    // 409 = customer already exists — we can still return the wallet
    if (createRes.status !== 409) {
      console.error('Coinflow create customer error:', createRes.status, err);
      return Response.json(
        { error: 'Failed to create customer', details: err },
        { status: createRes.status }
      );
    }
  }

  return Response.json({
    wallet: { publicKey: keypair.publicKey },
    pubkey,
  });
}
