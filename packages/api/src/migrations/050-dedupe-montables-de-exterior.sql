-- 050 — "Montables de exterior" estaba dos veces, y solo en producción.
--
-- Pablo lo reportó (Slack, 25-nov-2026): *"en producción aparece Montables de
-- exterior tanto en a pasear como en juguetes aunque en staging no está"*.
-- Confirmado: producción tiene 55 subcategorías y staging 54, y la de más es
-- la id 54 "Montables de exterior" bajo la categoría 6 (A jugar), gemela de la
-- id 5 bajo la categoría 1 (A pasear).
--
-- El duplicado viene de la semilla del propio repo: `data/subcategories.csv`
-- trae las dos (renglones 6 y 55), con el **mismo SKU `MDEP`**. Producción es
-- la carga fiel de ese archivo; staging y local son los que están limpios. El
-- CSV queda corregido en el mismo cambio para que no reviva en un reseed.
--
-- Que compartan SKU ha sido un riesgo latente: los IDs de inventario se
-- generan del SKU y la secuencia es común, así que `MDEP001`…`MDEP018` están
-- repartidos entre las dos subcategorías. El lado bueno es que consolidar
-- **no cambia ningún código de inventario**.
--
-- No se borra nada: la subcategoría se desactiva (`is_active = false`), que es
-- lo que ya respetan los endpoints de subcategorías y de marcas, así que
-- desaparece del valuador y del POS y el cambio se revierte con un UPDATE.
--
-- Lo que se mueve a la id 5, revisado uno por uno en producción antes de
-- escribir esto:
--   * 7 artículos valuados (ninguno vendido; solo MDEP001 tiene existencia).
--     Sus `features` usan las llaves `modelo` y `tipo`, las mismas que define
--     la id 5 —donde además están marcadas como imprimibles—, así que la
--     descripción no pierde nada y hasta gana.
--   * 11 citas con artículos de esa subcategoría, una de ellas **futura**
--     (1-dic-2026). Se mueven para que no apunten a una subcategoría
--     desactivada. El nombre es idéntico, así que la cita dice lo mismo.
--   * 11 de las 13 marcas (Berg, Kettler, Radio Flyer, Peg Perego, Mercedes…):
--     son marcas que la tienda registró justo para estos artículos y se
--     perderían de la lista. Las dos que ya existen en la id 5 —Power Wheels y
--     Step2, sin uso— se desactivan en lugar de duplicarse.
--
-- Quedan como filas muertas, a propósito: las 2 definiciones de características
-- y los 9 factores de valuación de la id 54 (la id 5 tiene los suyos, 4 y 9),
-- y un descuento "Montables Eléctricos 60% OFF" que ya estaba inactivo. Nada
-- de eso se consulta de una subcategoría desactivada, y borrarlo solo perdería
-- el rastro de lo que había.
--
-- Todo va condicionado a que la id 54 sea de verdad la gemela, para que en
-- staging y local —donde no existe— y en cualquier ambiente donde ese id sea
-- otra cosa, la migración no haga nada.

DO $$
DECLARE
  v_duplicada CONSTANT integer := 54;
  v_buena     CONSTANT integer := 5;
  v_categoria integer;
  v_movidos   integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM subcategories
     WHERE id = v_duplicada AND name = 'Montables de exterior' AND sku = 'MDEP'
  ) THEN
    RAISE NOTICE '050: no hay subcategoría % duplicada de "Montables de exterior"; nada que hacer.', v_duplicada;
    RETURN;
  END IF;

  SELECT category_id INTO v_categoria FROM subcategories WHERE id = v_buena;

  -- Artículos valuados: también la categoría, o quedarían con la categoría de
  -- juguetes y la subcategoría de "A pasear".
  UPDATE valuation_items
     SET subcategory_id = v_buena,
         category_id    = v_categoria
   WHERE subcategory_id = v_duplicada;
  GET DIAGNOSTICS v_movidos = ROW_COUNT;
  RAISE NOTICE '050: % artículos valuados movidos a la subcategoría %.', v_movidos, v_buena;

  UPDATE appointment_items
     SET subcategory_id = v_buena
   WHERE subcategory_id = v_duplicada;
  GET DIAGNOSTICS v_movidos = ROW_COUNT;
  RAISE NOTICE '050: % artículos de citas movidos.', v_movidos;

  -- Primero las que no se repiten; las que sobren son las que ya existían.
  UPDATE brands b
     SET subcategory_id = v_buena,
         updated_at     = NOW()
   WHERE b.subcategory_id = v_duplicada
     AND NOT EXISTS (
       SELECT 1 FROM brands o
        WHERE o.subcategory_id = v_buena
          AND lower(o.name) = lower(b.name)
     );
  GET DIAGNOSTICS v_movidos = ROW_COUNT;
  RAISE NOTICE '050: % marcas movidas.', v_movidos;

  UPDATE brands
     SET is_active  = false,
         updated_at = NOW()
   WHERE subcategory_id = v_duplicada
     AND is_active = true;
  GET DIAGNOSTICS v_movidos = ROW_COUNT;
  RAISE NOTICE '050: % marcas repetidas desactivadas.', v_movidos;

  UPDATE subcategories
     SET is_active  = false,
         updated_at = NOW()
   WHERE id = v_duplicada;
  RAISE NOTICE '050: subcategoría % desactivada.', v_duplicada;
END $$;

COMMENT ON TABLE subcategories IS
  'Subcategorías de producto. La id 54 ("Montables de exterior" bajo A jugar) está desactivada por la migración 050: era una gemela de la id 5, con el mismo SKU MDEP, y solo existía en producción.';
