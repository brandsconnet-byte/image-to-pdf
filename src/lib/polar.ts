const POLAR_API = 'https://api.polar.sh/v1';

function authHeaders(): Record<string, string> {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) {
    throw new Error('POLAR_ACCESS_TOKEN is not configured');
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

export interface CreateCheckoutParams {
  productId?: string;
  successUrl: string;
  customerEmail?: string;
}

export interface CheckoutResult {
  url: string;
  id: string;
}

export async function createCheckout({
  productId,
  successUrl,
  customerEmail,
}: CreateCheckoutParams): Promise<CheckoutResult> {
  const targetProductId = productId || process.env.POLAR_PRODUCT_ID;
  if (!targetProductId) {
    throw new Error('POLAR_PRODUCT_ID is not configured');
  }

  const response = await fetch(`${POLAR_API}/checkouts/`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: [targetProductId],
      success_url: successUrl,
      customer_email: customerEmail || undefined,
    }),
  });

  const data: any = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || JSON.stringify(data) || 'Failed to create Polar checkout');
  }

  return { url: data.url, id: data.id };
}

export async function getCheckout(checkoutId: string): Promise<any> {
  const response = await fetch(`${POLAR_API}/checkouts/${checkoutId}`, {
    headers: authHeaders(),
  });

  const data: any = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Failed to verify checkout');
  }

  return data;
}
