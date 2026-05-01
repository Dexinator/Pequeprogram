/**
 * Builds a human-readable product description used in printed receipts and labels.
 * Format: "Subcategoría · Feature1, Feature2 · Marca"
 *
 * Per Pablo's request, the product condition/status is intentionally excluded.
 * Features are filtered by feature_definitions.offer_print = TRUE (resolved by caller).
 * For OTR products, the otherprods_items.product_name is used directly.
 */

const GENERIC_BRAND_NAMES = new Set(['sin marca', 'genérica', 'generica']);

export interface OfferFeatureDef {
  key: string;
  displayName: string;
  orderIndex: number;
}

export interface DescriptionInput {
  sku: string | null;
  subcategoryName: string | null;
  categoryName: string | null;
  brandName: string | null;
  features: Record<string, any> | null;
  offerFeatureDefs: OfferFeatureDef[];
  otrProductName: string | null;
}

export function buildProductDescription(input: DescriptionInput): string {
  if (typeof input.sku === 'string' && input.sku.startsWith('OTRP')) {
    return input.otrProductName || `Producto ${input.sku}`;
  }

  const parts: string[] = [];
  parts.push(input.subcategoryName || input.categoryName || 'Artículo');

  if (input.features && typeof input.features === 'object' && input.offerFeatureDefs.length > 0) {
    const featureBits: string[] = [];
    for (const def of input.offerFeatureDefs) {
      const raw = input.features[def.key];
      if (raw === undefined || raw === null || raw === '') continue;
      featureBits.push(formatFeatureValue(def.key, def.displayName, raw));
    }
    if (featureBits.length > 0) parts.push(featureBits.join(', '));
  }

  if (input.brandName && !GENERIC_BRAND_NAMES.has(String(input.brandName).toLowerCase())) {
    parts.push(input.brandName);
  }

  return parts.join(' · ');
}

function formatFeatureValue(key: string, displayName: string, value: any): string {
  const lowerKey = key.toLowerCase();
  if (lowerKey === 'talla' || lowerKey === 'size') return `Talla ${value}`;
  if (lowerKey === 'edad') return `${value}`;
  if (lowerKey === 'color') return `${value}`;
  return `${displayName}: ${value}`;
}
