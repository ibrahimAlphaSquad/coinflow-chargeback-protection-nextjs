import { getSessionKey } from '@/lib/coinflowServer';

/**
 * GET /api/payments/coinflow/session-key
 * Returns session key for card tokenization.
 * Query: userId, deviceId (optional)
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
  const deviceId = searchParams.get('deviceId') || null;

  try {
    const key = await getSessionKey(userId, { deviceId });
    return Response.json({ key });
  } catch (err) {
    console.error('Session key error:', err);
    return Response.json(
      { error: 'Failed to get session key', details: err.message },
      { status: 500 }
    );
  }
}
