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
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    const token = process.env.POLAR_ACCESS_TOKEN;
    if (!token) {
      return sendJson(res, 500, { error: 'POLAR_ACCESS_TOKEN is not configured' });
    }

    const body = req.body ?? {};
    const productId = body.productId || process.env.POLAR_PRODUCT_ID;
    if (!productId) {
      return sendJson(res, 500, { error: 'POLAR_PRODUCT_ID is not configured' });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const successUrl = body.successUrl || `${protocol}://${host}/?checkout=success`;

    const polarResponse = await fetch(`${POLAR_API}/checkouts/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        products: [productId],
        success_url: successUrl,
        customer_email: body.customerEmail || undefined,
      }),
    });

    const data: any = await polarResponse.json().catch(() => null);

    if (!polarResponse.ok) {
      return sendJson(res, 502, {
        error: data?.detail || data?.message || `Polar API error (${polarResponse.status})`,
      });
    }

    return sendJson(res, 200, { url: data?.url, id: data?.id });
  } catch (error: any) {
    return sendJson(res, 500, { error: error?.message || 'Unexpected server error' });
  }
}
