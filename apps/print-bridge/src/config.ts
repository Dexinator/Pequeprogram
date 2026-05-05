import dotenv from 'dotenv';

dotenv.config();

export type RenderMode = 'live' | 'dryrun';

interface BridgeConfig {
  port: number;
  host: string;
  enableHttps: boolean;
  httpsPort: number;
  corsOrigins: string[];
  renderMode: RenderMode;
  bridgeLocation: string;
  epson: {
    interface: 'usb' | 'tcp' | 'serial';
    devicePath: string;
    printerName: string | null;
    vendorId: string | null;
    productId: string | null;
  };
  zebra: {
    interface: 'usb' | 'tcp' | 'serial';
    devicePath: string;
    printerName: string | null;
    vendorId: string | null;
    productId: string | null;
  };
  label: {
    widthDots: number;
    heightDots: number;
  };
}

function parseList(input: string | undefined): string[] {
  if (!input) return [];
  return input.split(',').map(s => s.trim()).filter(Boolean);
}

function parseInterface(input: string | undefined, fallback: 'usb' | 'tcp' | 'serial'): 'usb' | 'tcp' | 'serial' {
  const v = (input || '').toLowerCase();
  if (v === 'usb' || v === 'tcp' || v === 'serial') return v;
  return fallback;
}

function parseRenderMode(input: string | undefined): RenderMode {
  return input === 'live' ? 'live' : 'dryrun';
}

const config: BridgeConfig = {
  port: parseInt(process.env.PORT || '9100', 10),
  host: process.env.HOST || '127.0.0.1',
  enableHttps: (process.env.ENABLE_HTTPS || '').toLowerCase() === 'true',
  httpsPort: parseInt(process.env.HTTPS_PORT || '9443', 10),
  corsOrigins: parseList(process.env.CORS_ORIGINS) || [],
  renderMode: parseRenderMode(process.env.RENDER_MODE),
  bridgeLocation: process.env.BRIDGE_LOCATION || 'Polanco',
  epson: {
    interface: parseInterface(process.env.EPSON_INTERFACE, 'usb'),
    devicePath: process.env.EPSON_DEVICE_PATH || '/dev/usb/lp0',
    printerName: process.env.EPSON_PRINTER_NAME || null,
    vendorId: process.env.EPSON_VENDOR_ID || null,
    productId: process.env.EPSON_PRODUCT_ID || null,
  },
  zebra: {
    interface: parseInterface(process.env.ZEBRA_INTERFACE, 'usb'),
    devicePath: process.env.ZEBRA_DEVICE_PATH || '/dev/usb/lp1',
    printerName: process.env.ZEBRA_PRINTER_NAME || null,
    vendorId: process.env.ZEBRA_VENDOR_ID || null,
    productId: process.env.ZEBRA_PRODUCT_ID || null,
  },
  label: {
    widthDots: parseInt(process.env.LABEL_WIDTH_DOTS || '400', 10),
    heightDots: parseInt(process.env.LABEL_HEIGHT_DOTS || '200', 10),
  },
};

export default config;
