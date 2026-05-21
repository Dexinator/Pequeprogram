import { Router, Request, Response, NextFunction } from 'express';
import { ticketPayloadSchema, printOptionsSchema } from '../types/schemas';
import { renderTicketToEscpos } from '../renderers/ticket.renderer';
import { sendToPrinter } from '../printers/dispatcher';
import config from '../config';

const router = Router();

// Labels printed on each successive copy. Index 0 is the customer's; index 1
// is the store's. Anything beyond falls back to a generic "COPIA N" label.
const COPY_LABELS = ['ORIGINAL - CLIENTE', 'COPIA - TIENDA'];

router.post('/ticket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = ticketPayloadSchema.parse(req.body.payload);
    const options = printOptionsSchema.parse(req.body.options) || {};
    const copies = Math.max(1, Math.min(5, parseInt(req.body.copies, 10) || 1));

    const renderOptions = {
      showSkuPerItem: options.show_sku_per_item ?? false,
      showStoreCredit: options.show_store_credit ?? true,
      showSaleBarcode: options.show_sale_barcode ?? true,
    };

    const buffers: Buffer[] = [];
    const previews: string[] = [];
    for (let i = 0; i < copies; i++) {
      const copyLabel =
        copies > 1 ? COPY_LABELS[i] || `COPIA ${i + 1}` : null;
      const rendered = await renderTicketToEscpos(payload, {
        ...renderOptions,
        copyLabel,
      });
      buffers.push(rendered.buffer);
      previews.push(rendered.preview);
    }

    const buffer = Buffer.concat(buffers);
    await sendToPrinter('epson', buffer);

    res.json({
      ok: true,
      mode: config.renderMode,
      bytes: buffer.length,
      copies,
      preview: config.renderMode === 'dryrun' ? previews.join('\n---\n') : undefined,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
