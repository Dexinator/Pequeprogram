import config from '../config';

/**
 * Dispatches raw bytes (ESC/POS or ZPL) to a physical printer.
 *
 * v0.1: Only dryrun is wired up. The live USB transport is intentionally
 * left as a stub — it will be implemented during the in-store visit, where
 * the actual USB device paths and permissions can be verified. Until then,
 * setting RENDER_MODE=live throws a clear error explaining what's missing.
 */

export type PrinterTarget = 'epson' | 'zebra';

export async function sendToPrinter(target: PrinterTarget, bytes: Buffer): Promise<void> {
  if (config.renderMode === 'dryrun') {
    return;
  }

  // RENDER_MODE=live — to be implemented when the bridge is installed in store.
  // The plan: open the USB device path (Linux) or use node-usb / @serialport/parsers
  // (Windows) and write bytes directly. Different code paths per OS to handle
  // the platform's USB permission model.
  throw new Error(
    `RENDER_MODE=live no está implementado todavía para ${target}. ` +
      `Cambia a RENDER_MODE=dryrun o espera a la fase de instalación en tienda. ` +
      `(${bytes.length} bytes pendientes de envío)`
  );
}
