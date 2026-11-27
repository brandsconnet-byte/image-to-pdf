// Self-contained on purpose: the function must not import anything from outside
// api/, otherwise the Vercel Node runtime fails to resolve it at invocation time.
const POLAR_API = 'https://api.polar.sh/v1';

function sendJson(res: any, status: number, payload: unknown) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status).json(payload);
    return;
  }
  res.statusCode = status;
  res.end(JSON.stringify(payload));
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const checkoutId = (req.query ?? {}).checkoutId;
    if (!checkoutId || typeof checkoutId !== 'string') {
      return sendJson(res, 400, { error: 'checkoutId is required' });
    }

    const token = process.env.POLAR_ACCESS_TOKEN;
    if (!token) {
      return sendJson(res, 500, { error: 'POLAR_ACCESS_TOKEN is not configured' });
    }

    const polarResponse = await fetch(`${POLAR_API}/checkouts/${checkoutId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });

    const data: any = await polarResponse.json().catch(() => null);

    if (!polarResponse.ok) {
      return sendJson(res, 502, {
        error: data?.detail || data?.message || `Polar API error (${polarResponse.status})`,
      });
    }

    return sendJson(res, 200, data);
  } catch (error: any) {
    return sendJson(res, 500, { error: error?.message || 'Unexpected server error' });
  }
}
