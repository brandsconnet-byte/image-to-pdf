import { getCheckout } from '../../src/lib/polar';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { checkoutId } = req.query ?? {};
    if (!checkoutId || typeof checkoutId !== 'string') {
      return res.status(400).json({ error: 'checkoutId is required' });
    }

    const data = await getCheckout(checkoutId);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Polar Verify Error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify checkout' });
  }
}
