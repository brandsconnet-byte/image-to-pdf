import { createCheckout } from '../../src/lib/polar';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, successUrl, customerEmail } = req.body ?? {};

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const defaultSuccessUrl = `${protocol}://${host}/?checkout=success`;

    const result = await createCheckout({
      productId,
      successUrl: successUrl || defaultSuccessUrl,
      customerEmail,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Polar Checkout Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create Polar checkout' });
  }
}
