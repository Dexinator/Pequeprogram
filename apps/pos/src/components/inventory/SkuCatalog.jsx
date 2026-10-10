import React, { useState, useEffect, useMemo } from 'react';
import { productsService } from '../../services/products.service';

/**
 * Catálogo de claves de producto (AUTP → Autoasientos, ANDP → Andaderas…).
 *
 * Es solo consulta: la fuente de verdad es `subcategories.sku`, que es la
 * clave con la que se arman los IDs de inventario. No se edita desde aquí
 * porque cambiar un SKU rompería los IDs ya generados.
 */
export default function SkuCatalog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const categories = await productsService.getCategories();

        // Las subcategorías se piden por categoría (es el endpoint que existe).
        // Son pocas categorías y esto se carga una sola vez al abrir la pestaña.
        const porCategoria = await Promise.all(
          categories.map(async (cat) => {
            const subs = await productsService.getSubcategories(cat.id);
            return subs.map((sub) => ({
              sku: sub.sku || '—',
              subcategoria: sub.name,
              categoria: cat.name,
              activa: sub.is_active !== false,
            }));
          })
        );

        if (cancelled) return;
        setRows(porCategoria.flat());
      } catch (err) {
        if (!cancelled) setError(err?.message || 'No se pudo cargar el catálogo de claves.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Busca por clave y por nombre: "ANDP" y "andadera" deben encontrar lo mismo
  const filtradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.sku.toLowerCase().includes(q) ||
        r.subcategoria.toLowerCase().includes(q) ||
        r.categoria.toLowerCase().includes(q)
    );
  }, [rows, search]);

  // Agrupadas por categoría, que es como están en la cabeza de quien las usa
  const grupos = useMemo(() => {
    const mapa = new Map();
    filtradas.forEach((r) => {
      if (!mapa.has(r.categoria)) mapa.set(r.categoria, []);
      mapa.get(r.categoria).push(r);
    });
    return Array.from(mapa.entries()).map(([categoria, items]) => [
      categoria,
      items.sort((a, b) => a.sku.localeCompare(b.sku)),
    ]);
  }, [filtradas]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-1">Claves de producto</h3>
        <p className="text-sm text-gray-600 mb-4">
          La clave es el prefijo del ID de inventario. Por ejemplo, un autoasiento
          con clave <span className="font-mono font-medium">AUTP</span> genera IDs
          como <span className="font-mono font-medium">AUTP012</span>.
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busca por clave o por nombre: AUTP, andadera, carriola…"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />

        {!loading && !error && (
          <p className="text-sm text-gray-500 mt-2">
            {filtradas.length} de {rows.length} claves
          </p>
        )}
      </div>

      {loading && (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Cargando claves…
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!loading && !error && filtradas.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          No hay claves que coincidan con “{search}”.
        </div>
      )}

      {!loading &&
        !error &&
        grupos.map(([categoria, items]) => (
          <div key={categoria} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b">
              <h4 className="font-medium text-gray-700">{categoria}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="px-6 py-2 text-left w-32">Clave</th>
                    <th className="px-6 py-2 text-left">Subcategoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((r) => (
                    <tr key={`${categoria}-${r.sku}-${r.subcategoria}`} className={r.activa ? '' : 'text-gray-400'}>
                      <td className="px-6 py-2 font-mono font-medium text-pink-600">{r.sku}</td>
                      <td className="px-6 py-2">
                        {r.subcategoria}
                        {!r.activa && <span className="ml-2 text-xs">(inactiva)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
}
