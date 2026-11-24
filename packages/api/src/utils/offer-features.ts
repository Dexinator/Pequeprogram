import { PoolClient } from 'pg';
import { OfferFeatureDef } from './product-description';

/**
 * Qué características de un producto se imprimen, por subcategoría.
 *
 * La bandera vive en `feature_definitions.offer_print` y la consultan el
 * ticket, el comprobante de apartado, la etiqueta y el detalle de venta. Antes
 * cada servicio tenía su propia copia de esta consulta; está aquí para que la
 * descripción de un artículo salga igual en los cuatro lugares.
 */
export async function fetchOfferFeatureDefs(
  dbClient: PoolClient,
  subcategoryIds: number[]
): Promise<Map<number, OfferFeatureDef[]>> {
  const porSubcategoria = new Map<number, OfferFeatureDef[]>();
  const ids = Array.from(new Set(subcategoryIds.filter(id => typeof id === 'number')));
  if (ids.length === 0) return porSubcategoria;

  const result = await dbClient.query(
    `SELECT subcategory_id, name, display_name, order_index
       FROM feature_definitions
      WHERE subcategory_id = ANY($1::int[])
        AND offer_print = TRUE
      ORDER BY subcategory_id, order_index`,
    [ids]
  );

  for (const row of result.rows) {
    const lista = porSubcategoria.get(row.subcategory_id) || [];
    lista.push({
      key: row.name,
      displayName: row.display_name,
      orderIndex: row.order_index,
    });
    porSubcategoria.set(row.subcategory_id, lista);
  }
  return porSubcategoria;
}

/** Las de una sola subcategoría, para quien procesa un artículo a la vez. */
export async function fetchOfferFeatureDefsFor(
  dbClient: PoolClient,
  subcategoryId: number | null | undefined
): Promise<OfferFeatureDef[]> {
  if (typeof subcategoryId !== 'number') return [];
  const mapa = await fetchOfferFeatureDefs(dbClient, [subcategoryId]);
  return mapa.get(subcategoryId) || [];
}
