import os from 'os';
import config from '../config';
import { printRawBytesWindows } from './win32';
import { printRawBytesPosix } from './posix';

/**
 * Dispatches raw bytes (ESC/POS or ZPL) to a physical printer.
 *
 * Two transports:
 *   - Windows: shells out to PowerShell which uses the Win32 winspool.drv
 *     API to send bytes to a printer registered in the OS spooler. Pablo
 *     installs the official Epson and Zebra drivers in Windows, then sets
 *     EPSON_PRINTER_NAME / ZEBRA_PRINTER_NAME in the .env to the printer
 *     names exactly as they appear in "Devices and Printers".
 *   - Linux/macOS: writes bytes directly to a USB device path (typically
 *     /dev/usb/lpN). The bridge user must have permission on that device.
 *
 * RENDER_MODE=dryrun short-circuits both transports and returns immediately,
 * so the caller can still inspect the rendered bytes via the response.
 */

export type PrinterTarget = 'epson' | 'zebra';

export async function sendToPrinter(target: PrinterTarget, bytes: Buffer): Promise<void> {
  if (config.renderMode === 'dryrun') {
    return;
  }

  const settings = target === 'epson' ? config.epson : config.zebra;
  const platform = os.platform();

  if (platform === 'win32') {
    if (!settings.printerName) {
      throw new Error(
        `Falta configurar ${target === 'epson' ? 'EPSON_PRINTER_NAME' : 'ZEBRA_PRINTER_NAME'} ` +
          `en el .env del bridge. Debe coincidir EXACTAMENTE con el nombre que aparece ` +
          `en "Dispositivos e impresoras" de Windows (incluyendo mayúsculas y espacios).`
      );
    }
    await printRawBytesWindows(settings.printerName, bytes);
    return;
  }

  await printRawBytesPosix(settings.devicePath, bytes);
}
