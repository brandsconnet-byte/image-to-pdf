import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN || 'polar_oat_h0vRbxGvgIadAm3Bl0IX7EcWA7UoOaENTSsl93OCaB6';
  const DEFAULT_PRODUCT_ID = process.env.POLAR_PRODUCT_ID || 'df9d7e1b-60d4-4ac2-8d91-aabb80d586ce';

  // API Routes
  app.post('/api/polar/checkout', async (req, res) => {
    try {
      const { productId, successUrl, customerEmail } = req.body;
      const targetProductId = productId || DEFAULT_PRODUCT_ID;
      
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['host'] || `localhost:${PORT}`;
      const defaultSuccessUrl = `${protocol}://${host}/?checkout=success`;

      const polarResponse = await fetch('https://api.polar.sh/v1/checkouts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: targetProductId,
          success_url: successUrl || defaultSuccessUrl,
          customer_email: customerEmail || undefined,
        })
      });

      const data = await polarResponse.json();

      if (!polarResponse.ok) {
        throw new Error(data.detail || data.message || 'Failed to create Polar checkout');
      }

      res.json({ url: data.url, id: data.id });
    } catch (error: any) {
      console.error('Polar Checkout Error:', error);
      res.status(500).json({ error: error.message || 'Failed to create Polar checkout' });
    }
  });

  app.get('/api/polar/verify', async (req, res) => {
    try {
      const { checkoutId } = req.query;
      if (!checkoutId || typeof checkoutId !== 'string') {
        return res.status(400).json({ error: 'checkoutId is required' });
      }

      const polarResponse = await fetch(`https://api.polar.sh/v1/checkouts/${checkoutId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${POLAR_ACCESS_TOKEN}`,
          'Accept': 'application/json'
        }
      });

      const data = await polarResponse.json();
      if (!polarResponse.ok) {
        throw new Error(data.detail || data.message || 'Failed to verify checkout');
      }

      res.json(data);
    } catch (error: any) {
      console.error('Polar Verify Error:', error);
      res.status(500).json({ error: error.message || 'Failed to verify checkout' });
    }
  });

  // Vite middleware for development or static serving for production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
