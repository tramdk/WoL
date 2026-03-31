import express from 'express';
import wol from 'wake_on_lan';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cors());

  app.post('/api/wake', (req, res) => {
    const { mac, address } = req.body;
    
    if (!mac) {
      return res.status(400).json({ error: 'MAC address is required' });
    }

    // address is optional, used if sending to a specific broadcast IP (e.g., public IP for WAN)
    const options = address ? { address } : {};

    wol.wake(mac, options, (error: any) => {
      if (error) {
        console.error('Wake-on-LAN Error:', error);
        return res.status(500).json({ error: 'Failed to send Wake-on-LAN packet' });
      }
      res.json({ success: true, message: `Magic packet sent to ${mac}` });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Explicitly serve index.html in dev mode to ensure it's transformed by Vite
    app.get('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        console.error(e.stack);
        res.status(500).end(e.stack);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
