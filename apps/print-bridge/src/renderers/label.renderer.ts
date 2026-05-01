import { LabelPayloadV1 } from '../types/label.types';

interface RenderOptions {
  widthDots: number;
  heightDots: number;
}

/**
 * Generates a ZPL II program for the Zebra GC420t (203 dpi).
 *
 * Layout (50x25 mm = 400x200 dots default):
 *   line 1: business name (small)
 *   line 2: brand + size (medium)
 *   line 3: description, wrapped (medium)
 *   line 4: large price
 *   bottom: Code128 barcode + SKU text
 *
 * The label uses ^FB for text blocks so long descriptions wrap automatically.
 * Adjust widthDots / heightDots to switch label stock without code changes.
 */
export function renderLabelToZpl(payload: LabelPayloadV1, opts: RenderOptions): string {
  const { widthDots, heightDots } = opts;

  const margin = 12;
  const innerWidth = widthDots - margin * 2;

  const businessLineY = margin;
  const brandLineY = businessLineY + 28;
  const descBlockY = brandLineY + 30;
  const descBlockHeight = 50;
  const priceY = descBlockY + descBlockHeight + 6;
  const barcodeY = priceY + 56;

  const escape = (s: string) => s.replace(/\^/g, ' ').replace(/~/g, ' ');

  const businessLine = escape(payload.business_name);
  const brandSizeLine = [payload.brand, payload.size].filter(Boolean).join('  ·  ');
  const description = escape(payload.description);
  const priceText = escape(payload.price.formatted);
  const barcodeValue = escape(payload.barcode.value);

  const modalityMark = modalityIndicator(payload.modality);

  return [
    '^XA',
    `^PW${widthDots}`,
    `^LL${heightDots}`,
    '^LH0,0',
    '^CI28',

    `^FO${margin},${businessLineY}^A0N,20,20^FD${businessLine}${modalityMark}^FS`,

    brandSizeLine
      ? `^FO${margin},${brandLineY}^A0N,24,24^FD${escape(brandSizeLine)}^FS`
      : '',

    `^FO${margin},${descBlockY}^A0N,22,22^FB${innerWidth},2,2,L,0^FD${description}^FS`,

    `^FO${margin},${priceY}^A0N,52,52^FD${priceText}^FS`,

    `^FO${margin},${barcodeY}^BY2,3,40^BCN,40,Y,N,N^FD${barcodeValue}^FS`,

    '^XZ',
  ].filter(Boolean).join('\n');
}

function modalityIndicator(modality: LabelPayloadV1['modality']): string {
  switch (modality) {
    case 'consignacion':
      return '   [CONS]';
    case 'credito_tienda':
      return '   [CRED]';
    case 'otros':
      return '   [OTR]';
    default:
      return '';
  }
}
