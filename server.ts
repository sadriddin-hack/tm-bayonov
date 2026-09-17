import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.js';
import { MembershipService } from './server/services/membershipService.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'TM BAYONOV MMA TRAINING CENTER',
      version: '1.0.0',
      timezone: 'Asia/Dushanbe',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Run initial background expiration check on startup
  try {
    const result = MembershipService.evaluateMembershipsAndDebts(false);
    console.log('[TM BAYONOV MMA] Daily background evaluator initial run:', result);
  } catch (err) {
    console.error('Error running daily evaluation:', err);
  }

  // Periodic background check every hour
  setInterval(() => {
    try {
      MembershipService.evaluateMembershipsAndDebts(false);
    } catch (err) {
      console.error('Periodic background error:', err);
    }
  }, 60 * 60 * 1000);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TM BAYONOV MMA] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
