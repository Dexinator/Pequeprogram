import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import config from './config';
import healthRoutes from './routes/health';
import ticketRoutes from './routes/ticket';
import labelRoutes from './routes/label';

const app = express();

app.use(express.json({ limit: '256kb' }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS bloqueado para origen: ${origin}`));
    },
  })
);

app.use(healthRoutes);
app.use('/print', ticketRoutes);
app.use('/print', labelRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: 'payload_invalido',
      issues: err.errors,
    });
    return;
  }
  console.error('[print-bridge] error:', err);
  res.status(500).json({
    ok: false,
    error: err.message || 'error_interno',
  });
});

app.listen(config.port, config.host, () => {
  console.log(
    `[print-bridge] listening on http://${config.host}:${config.port} ` +
      `(mode=${config.renderMode}, location=${config.bridgeLocation})`
  );
});
