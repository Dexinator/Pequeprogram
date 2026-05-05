import { Router, Request, Response, NextFunction } from 'express';
import { ticketPayloadSchema, printOptionsSchema } from '../types/schemas';
import { renderTicketToEscpos } from '../renderers/ticket.renderer';
import { sendToPrinter } from '../printers/dispatcher';
import config from '../config';

const router = Router();

router.post('/ticket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = ticketPayloadSchema.parse(req.body.payload);
    const options = printOptionsSchema.parse(req.body.options) || {};

    const { buffer, preview } = await renderTicketToEscpos(payload, {
      showSkuPerItem: options.show_sku_per_item ?? false,
      showStoreCredit: options.show_store_credit ?? true,
      showSaleBarcode: options.show_sale_barcode ?? true,
    });

    await sendToPrinter('epson', buffer);

    res.json({
      ok: true,
      mode: config.renderMode,
      bytes: buffer.length,
      preview: config.renderMode === 'dryrun' ? preview : undefined,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
