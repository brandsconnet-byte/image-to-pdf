import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCheckout, getCheckout } from './src/lib/polar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // API Routes
  app.post('/api/polar/checkout', async (req, res) => {
    try {
      const { productId, successUrl, customerEmail } = req.body;

      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['host'] || `localhost:${PORT}`;
      const defaultSuccessUrl = `${protocol}://${host}/?checkout=success`;

      const result = await createCheckout({
        productId,
        successUrl: successUrl || defaultSuccessUrl,
        customerEmail,
      });

      res.json(result);
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

      const data = await getCheckout(checkoutId);
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
