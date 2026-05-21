import express, { Request, Response, NextFunction } from 'express';
import https from 'https';
import http from 'http';
import cors from 'cors';
import { ZodError } from 'zod';
import config from './config';
import { ensureCertificate } from './tls';
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

http.createServer(app).listen(config.port, config.host, () => {
  console.log(
    `[print-bridge] HTTP listening on http://${config.host}:${config.port} ` +
      `(mode=${config.renderMode}, location=${config.bridgeLocation})`
  );
});

if (config.enableHttps) {
  ensureCertificate()
    .then(({ key, cert }) => {
      https.createServer({ key, cert }, app).listen(config.httpsPort, config.host, () => {
        console.log(
          `[print-bridge] HTTPS listening on https://${config.host}:${config.httpsPort} ` +
            `(self-signed; accept it once in the browser)`
        );
      });
    })
    .catch(err => {
      console.error('[print-bridge] no se pudo arrancar HTTPS:', err);
    });
}
