/**
 * LabelPayload v1 — formato del payload para imprimir etiquetas de producto
 * en la Zebra GC420t (ZPL). Es un contrato congelado: si cambia, debe ser v2.
 *
 * El bridge local convierte este payload a ZPL según la dimensión de etiqueta
 * configurada (40x25 mm, 50x25 mm, etc.). El backend NO genera ZPL para
 * mantener el payload independiente del modelo de impresora.
 */

export interface LabelPayloadV1 {
  version: 1;
  business_name: string;
  sku: string;
  description: string;
  brand: string | null;
  size: string | null;
  price: LabelPrice;
  modality: LabelModality;
  barcode: {
    value: string;
    format: 'CODE128';
  };
}

export interface LabelPrice {
  amount: number;
  currency: 'MXN';
  formatted: string;
}

export type LabelModality =
  | 'compra'
  | 'consignacion'
  | 'credito_tienda'
  | 'otros'
  | 'desconocida';
