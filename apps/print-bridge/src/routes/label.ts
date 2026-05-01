import { Router, Request, Response, NextFunction } from 'express';
import { labelPayloadSchema } from '../types/schemas';
import { renderLabelToZpl } from '../renderers/label.renderer';
import { sendToPrinter } from '../printers/dispatcher';
import config from '../config';

const router = Router();

router.post('/label', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = labelPayloadSchema.parse(req.body.payload);
    const copies = Math.max(1, Math.min(10, parseInt(req.body.copies, 10) || 1));

    const zpl = renderLabelToZpl(payload, {
      widthDots: config.label.widthDots,
      heightDots: config.label.heightDots,
    });
    const program = zpl.repeat(copies);
    const buffer = Buffer.from(program, 'utf8');

    await sendToPrinter('zebra', buffer);

    res.json({
      ok: true,
      mode: config.renderMode,
      bytes: buffer.length,
      copies,
      preview: config.renderMode === 'dryrun' ? zpl : undefined,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
