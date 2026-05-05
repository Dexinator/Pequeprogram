import { z } from 'zod';

export const ticketPayloadSchema = z.object({
  version: z.literal(1),
  business: z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    rfc: z.string().nullable(),
    website: z.string().nullable(),
    logo_url: z.string().nullable(),
    footer_lines: z.array(z.string()),
  }),
  sale: z.object({
    id: z.number(),
    date: z.string(),
    location: z.string(),
    cashier: z.string(),
    barcode: z.object({
      value: z.string(),
      format: z.literal('CODE128'),
    }),
  }),
  client: z
    .object({
      id: z.number().nullable(),
      name: z.string(),
      phone: z.string().nullable(),
    })
    .nullable(),
  items: z.array(
    z.object({
      sku: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
      total: z.number(),
    })
  ),
  totals: z.object({
    items_count: z.number(),
    subtotal: z.number(),
    total: z.number(),
  }),
  payments: z.array(
    z.object({
      method: z.string(),
      label: z.string(),
      amount: z.number(),
      notes: z.string().nullable(),
    })
  ),
  store_credit_remaining: z.number().nullable(),
  notes: z.string().nullable(),
});

export const labelPayloadSchema = z.object({
  version: z.literal(1),
  business_name: z.string(),
  sku: z.string(),
  description: z.string(),
  brand: z.string().nullable(),
  size: z.string().nullable(),
  price: z.object({
    amount: z.number(),
    currency: z.literal('MXN'),
    formatted: z.string(),
  }),
  modality: z.enum(['compra', 'consignacion', 'credito_tienda', 'otros', 'desconocida']),
  barcode: z.object({
    value: z.string(),
    format: z.literal('CODE128'),
  }),
});

export const printOptionsSchema = z
  .object({
    show_sku_per_item: z.boolean().optional(),
    show_store_credit: z.boolean().optional(),
    show_sale_barcode: z.boolean().optional(),
  })
  .optional();
