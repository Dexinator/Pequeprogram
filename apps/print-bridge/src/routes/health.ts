import { Router, Request, Response } from 'express';
import config from '../config';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'entrepeques-print-bridge',
    version: '0.1.0',
    mode: config.renderMode,
    location: config.bridgeLocation,
    capabilities: {
      ticket: { format: 'ESC/POS', target: 'epson' },
      label: { format: 'ZPL', target: 'zebra' },
    },
  });
});

export default router;
