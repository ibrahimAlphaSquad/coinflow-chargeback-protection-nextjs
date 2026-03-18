/**
 * GET /api/coinflow/withdraws
 *
 * Fetches all withdraws associated with the merchant from Coinflow.
 * Supports query params: since, until, page, status, search, sortBy, sortDirection, speed, provider, limit
 *
 * @see https://docs.coinflow.cash/api-reference/api-reference/merchant/get-all-withdraws
 */
export async function GET(request) {
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

  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();
  const allowed = ['since', 'until', 'page', 'status', 'search', 'sortBy', 'sortDirection', 'speed', 'provider', 'limit'];
  for (const key of allowed) {
    const val = searchParams.get(key);
    if (val != null) params.set(key, val);
  }
  if (merchantId) params.set('merchantId', merchantId);

  const query = params.toString();
  const url = `${baseUrl}/api/merchant/withdraws${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: apiKey,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json(
      { error: 'Failed to fetch withdraws', details: err },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
