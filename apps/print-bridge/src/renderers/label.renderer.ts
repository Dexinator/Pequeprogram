import { LabelPayloadV1 } from '../types/label.types';

interface RenderOptions {
  widthDots: number;
  heightDots: number;
}

/**
 * Generates a ZPL II program for the Zebra GC420t (203 dpi = 8 dots/mm).
 *
 * Calibrated for the Entrepeques roll: 49 mm × 51 mm (392 × 408 dots), nearly
 * square with slightly more height than width. The layout is anchored by
 * vertical bands so it degrades reasonably on other sizes:
 *
 *   ┌──────────────────────────┐
 *   │ Entrepeques        [CONS]│  header band — business + modality marker
 *   │ Brand · Talla X          │  info band — brand and size
 *   │ Descripción (3 líneas    │
 *   │ máximo, hace wrap)       │
 *   ├──────────────────────────┤
 *   │                          │
 *   │        $250.00           │  price band — large centered amount
 *   │                          │
 *   ├──────────────────────────┤
 *   │  ║║║║║║║║║║║║║║║         │  barcode band — Code128 with SKU under
 *   │       ROP-001234         │
 *   └──────────────────────────┘
 *
 * Font sizes (^A0N,height,width) are scaled to the height so the same code
 * still produces something readable if widthDots/heightDots change.
 */
export function renderLabelToZpl(payload: LabelPayloadV1, opts: RenderOptions): string {
  const { widthDots, heightDots } = opts;

  // Calibration margins (dots), tunable per printer via .env. Defaults keep the
  // original 12-dot border. The GC420t's real printable area is offset
  // down-and-in from the nominal label edges, so the top line and the
  // right-aligned date were being clipped; bump LABEL_MARGIN_TOP / _RIGHT to
  // pull content into the printable zone. No rebuild needed to retune — edit
  // .env and restart the service.
  const marginTop = parseInt(process.env.LABEL_MARGIN_TOP || '12', 10);
  const marginRight = parseInt(process.env.LABEL_MARGIN_RIGHT || '12', 10);
  const marginLeft = parseInt(process.env.LABEL_MARGIN_LEFT || '12', 10);
  const margin = marginLeft;
  const innerWidth = widthDots - marginLeft - marginRight;

  // Vertical bands as fractions of total height. Anchored to absolute Y for
  // stability across slightly different rolls. The layout is pulled up and the
  // fonts trimmed a little vs. the original calibration so the footer (SKU +
  // inventory date) keeps ~10 mm of clearance from the bottom edge: the real
  // roll prints a hair shorter than the configured 408 dots and the date — the
  // bottom-most element — was getting clipped.
  const headerY = marginTop;                                    // business line
  const brandY = headerY + Math.round(heightDots * 0.065);      // brand + size
  const descY = brandY + Math.round(heightDots * 0.075);        // description block
  const descHeight = Math.round(heightDots * 0.18);             // 3 lines of description
  const priceY = descY + descHeight + Math.round(heightDots * 0.025);
  const barcodeY = priceY + Math.round(heightDots * 0.20);

  // Font sizes scale with the height so the proportions stay readable on
  // different rolls. Tuned for 408 dots tall.
  const headerFont = Math.max(16, Math.round(heightDots * 0.048));  // ~20 at 408
  const brandFont = Math.max(20, Math.round(heightDots * 0.065));   // ~27 at 408
  const descFont = Math.max(18, Math.round(heightDots * 0.052));    // ~21 at 408
  const priceFont = Math.max(40, Math.round(heightDots * 0.16));    // ~65 at 408
  const barcodeHeight = Math.max(40, Math.round(heightDots * 0.16)); // ~65 at 408
  const footerFont = Math.max(14, Math.round(heightDots * 0.042));   // ~17 at 408
  const footerY = barcodeY + barcodeHeight + Math.round(heightDots * 0.025);

  const escape = (s: string) => (s ?? '').replace(/\^/g, ' ').replace(/~/g, ' ');

  const businessLine = escape(payload.business_name);
  const brandSizeLine = [payload.brand, payload.size].filter(Boolean).join('  ·  ');
  const description = escape(payload.description);
  const priceText = escape(payload.price.formatted);
  const barcodeValue = escape(payload.barcode.value);
  const skuText = escape(payload.sku);
  const inventoryDate = payload.inventory_date ? escape(payload.inventory_date) : '';
  const modalityMark = modalityIndicator(payload.modality);

  return [
    '^XA',
    `^PW${widthDots}`,
    `^LL${heightDots}`,
    '^LH0,0',
    '^CI28',

    // Header — business name on the left, modality marker on the right.
    `^FO${margin},${headerY}^A0N,${headerFont},${headerFont}^FD${businessLine}^FS`,
    modalityMark
      ? `^FO${margin},${headerY}^A0N,${headerFont},${headerFont}^FB${innerWidth},1,0,R,0^FD${modalityMark}^FS`
      : '',

    brandSizeLine
      ? `^FO${margin},${brandY}^A0N,${brandFont},${brandFont}^FB${innerWidth},1,0,C,0^FD${escape(brandSizeLine)}^FS`
      : '',

    `^FO${margin},${descY}^A0N,${descFont},${descFont}^FB${innerWidth},3,2,L,0^FD${description}^FS`,

    // Price — centered horizontally using ^FB.
    `^FO${margin},${priceY}^A0N,${priceFont},${priceFont}^FB${innerWidth},1,0,C,0^FD${priceText}^FS`,

    // Code128 barcode. We disable the built-in human-readable line (`N` after
    // the height) because we render our own footer with SKU + date below.
    `^FO${margin},${barcodeY}^BY2,3,${barcodeHeight}^BCN,${barcodeHeight},N,N,N^FD${barcodeValue}^FS`,

    // Footer line: SKU on the left, inventory month/year on the right.
    `^FO${margin},${footerY}^A0N,${footerFont},${footerFont}^FB${innerWidth},1,0,L,0^FD${skuText}^FS`,
    inventoryDate
      ? `^FO${margin},${footerY}^A0N,${footerFont},${footerFont}^FB${innerWidth},1,0,R,0^FD${inventoryDate}^FS`
      : '',

    '^XZ',
  ].filter(Boolean).join('\n');
}

function modalityIndicator(modality: LabelPayloadV1['modality']): string {
  switch (modality) {
    case 'consignacion':
      return '[CONS]';
    case 'credito_tienda':
      return '[CRED]';
    case 'otros':
      return '[OTR]';
    default:
      return '';
  }
}
