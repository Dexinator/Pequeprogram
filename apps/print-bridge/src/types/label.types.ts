/**
 * Mirror of packages/api/src/models/label.model.ts.
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
