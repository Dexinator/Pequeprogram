/**
 * Builds a human-readable product description used in printed receipts and labels.
 * Format: "Subcategoría · Feature1, Feature2 · Marca"
 *
 * Per Pablo's request, the product condition/status is intentionally excluded.
 * Features are filtered by feature_definitions.offer_print = TRUE (resolved by caller).
 * For OTR products, the otherprods_items.product_name is used directly.
 *
 * En ropa la cabeza es la prenda, no la subcategoría: Pablo pidió (documento
 * del 16-nov-2026) que la etiqueta y el ticket digan "Sudadera" en lugar de
 * "Niña arriba de cintura", *"ya que a la gente le cuesta identificar lo que
 * compró"*. El tipo de prenda ya se captura en `features.tipo` desde el
 * formulario de ropa, así que no hace falta capturar nada nuevo.
 */

const GENERIC_BRAND_NAMES = new Set(['sin marca', 'genérica', 'generica']);

/** La llave donde el formulario de ropa guarda la prenda ("Sudadera", "Pants"). */
const CLOTHING_TYPE_KEYS = ['tipo'];
const SIZE_KEYS = ['talla', 'size'];

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
  /** `subcategories.is_clothing`: cambia la cabeza por el tipo de prenda. */
  isClothing?: boolean;
  /**
   * Para quien ya imprime la talla en un campo aparte (la etiqueta tiene su
   * propio renglón). El ticket y el comprobante no, así que ahí la talla entra
   * en la descripción: sin ella "Sudadera" no distingue una prenda de otra.
   */
  sizePrintedSeparately?: boolean;
}

export function buildProductDescription(input: DescriptionInput): string {
  if (typeof input.sku === 'string' && input.sku.startsWith('OTRP')) {
    return input.otrProductName || `Producto ${input.sku}`;
  }

  const parts: string[] = [];
  const garmentType = input.isClothing ? pickValue(input.features, CLOTHING_TYPE_KEYS) : null;
  parts.push(garmentType || input.subcategoryName || input.categoryName || 'Artículo');

  if (input.features && typeof input.features === 'object' && input.offerFeatureDefs.length > 0) {
    const featureBits: string[] = [];
    for (const def of input.offerFeatureDefs) {
      // El tipo ya es la cabeza: no repetirlo como "Tipo: Sudadera".
      if (garmentType && CLOTHING_TYPE_KEYS.includes(def.key.toLowerCase())) continue;
      const raw = input.features[def.key];
      if (raw === undefined || raw === null || raw === '') continue;
      featureBits.push(formatFeatureValue(def.key, def.displayName, raw));
    }
    if (featureBits.length > 0) parts.push(featureBits.join(', '));
  }

  // En ropa la talla no está marcada como `offer_print`, porque la etiqueta la
  // imprime aparte; en el ticket hay que agregarla a mano.
  if (input.isClothing && !input.sizePrintedSeparately) {
    const talla = pickValue(input.features, SIZE_KEYS);
    const yaIncluida = parts.some(p => p.includes('Talla '));
    if (talla && !yaIncluida) parts.push(`Talla ${talla}`);
  }

  if (input.brandName && !GENERIC_BRAND_NAMES.has(String(input.brandName).toLowerCase())) {
    parts.push(input.brandName);
  }

  return parts.join(' · ');
}

function pickValue(
  features: Record<string, any> | null | undefined,
  keys: string[]
): string | null {
  if (!features || typeof features !== 'object') return null;
  for (const key of keys) {
    const value = features[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return null;
}

function formatFeatureValue(key: string, displayName: string, value: any): string {
  const lowerKey = key.toLowerCase();
  if (lowerKey === 'talla' || lowerKey === 'size') return `Talla ${value}`;
  if (lowerKey === 'edad') return `${value}`;
  if (lowerKey === 'color') return `${value}`;
  return `${displayName}: ${value}`;
}
