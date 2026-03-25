/**
 * Feature flags for Coinflow integration.
 * - isCoinflowEnabled: gates card, Apple Pay, Google Pay
 * - isPixSepaEnabled: gates SEPA and PIX
 */
export const isCoinflowEnabled =
  process.env.NEXT_PUBLIC_COINFLOW_ENABLED === 'true';

export const isPixSepaEnabled =
  process.env.NEXT_PUBLIC_PIX_SEPA_ENABLED !== 'false';
