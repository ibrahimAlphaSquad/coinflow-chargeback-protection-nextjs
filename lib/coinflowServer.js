/**
 * Server-side Coinflow API helpers.
 * Used by Next.js API routes to proxy to Coinflow.
 */
import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';

export const env = process.env.NEXT_PUBLIC_SANDBOX === 'true' ? 'sandbox' : 'prod';
export const baseUrl = `https://api-${env}.coinflow.cash`;
export const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID;
export const apiKey = process.env.COINFLOW_API_KEY;

export function deriveWalletFromUserId(userId) {
  const hash = crypto.createHash('sha256').update(userId).digest();
  const keypair = Keypair.fromSeed(hash.slice(0, 32));
  return {
    keypair,
    pubkey: keypair.publicKey.toString(),
  };
}

export function buildCoinflowHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: apiKey,
    ...extra,
  };
}

export async function getSessionKey(userId, { deviceId, walletPubkey } = {}) {
  const { pubkey } = walletPubkey ? { pubkey: walletPubkey } : deriveWalletFromUserId(userId);
  const headers = buildCoinflowHeaders({
    'x-coinflow-auth-user-id': userId,
    'x-coinflow-auth-wallet': pubkey,
    'x-coinflow-auth-blockchain': 'solana',
    'x-coinflow-auth-merchant-id': merchantId || '',
    ...(deviceId && { 'x-device-id': deviceId }),
  });
  const res = await fetch(`${baseUrl}/api/auth/session-key`, {
    method: 'GET',
    headers,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Session key failed: ${res.status}`);
  }
  const { key } = await res.json();
  return key;
}
