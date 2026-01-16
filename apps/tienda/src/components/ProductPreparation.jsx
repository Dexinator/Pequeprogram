import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { storeService } from '../services/store.service';
import { categoryService } from '../services/api.js';
import OptionalAuthGuard from './auth/OptionalAuthGuard';
import { EMPLOYEE_ROLES } from '../config/routes.config';

// Componente de tarjeta de producto pendiente
const ProductCard = ({ product, onPrepare, onEditNotes }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-gray-500">{product.inventory_id}</p>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{product.subcategory_name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand_name}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          product.condition_state === 'excelente' ? 'bg-green-100 text-green-800' :
          product.condition_state === 'bueno' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {product.condition_state}
        </span>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        <p>Precio sugerido: ${product.final_sale_price}</p>
        <p>Stock: {product.quantity} piezas</p>
        <p>Ubicación: {product.location}</p>
      </div>

      {product.features && Object.keys(product.features).length > 0 && (
        <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          {Object.entries(product.features).slice(0, 3).map(([key, value]) => (
            <p key={key}>{key}: {value}</p>
          ))}
        </div>
      )}

      {/* Notas del producto */}
      {product.notes && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-sm">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium text-xs mb-1">Notas:</p>
          <p className="text-yellow-700 dark:text-yellow-300 text-xs">{product.notes}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEditNotes(product)}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded py-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          title="Agregar o editar notas"
        >
          {product.notes ? '✏️ Editar nota' : '📝 Agregar nota'}
        </button>
        <button
          onClick={() => onPrepare(product)}
          className="flex-1 bg-pink-600 text-white rounded py-2 hover:bg-pink-700 transition-colors"
        >
          Preparar
        </button>
      </div>
    </div>
  );
};

// Modal de preparación
const PreparationModal = ({ product, onClose, onSave }) => {
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState(product.suggested_online_price || '');
  const [images, setImages] = useState([]);
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setErrors({});

    try {
      // Validar archivos antes de subir
      const validFiles = files.filter(file => {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} no es una imagen válida`);
        }
        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} excede el tamaño máximo de 5MB`);
        }
        return true;
      });

      // Subir todas las imágenes de una vez
      const uploadedUrls = await storeService.uploadImages(validFiles, product.inventory_id);
      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      setErrors({ images: error.message });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!weight || parseFloat(weight) <= 0) {
      newErrors.weight = 'El peso debe ser mayor a 0';
    }
    
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    
    if (images.length === 0) {
      newErrors.images = 'Debe agregar al menos una imagen';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        weight_grams: Math.round(parseFloat(weight) * 1000), // Convertir kg a gramos
        images: images,
        online_price: parseFloat(price),
        online_featured: featured
      };

      await storeService.prepareProductForStore(product.inventory_id, data);
      onSave();
    } catch (error) {
      setErrors({ general: error.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-full sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Preparar producto para tienda online</h2>
          
          {/* Información del producto */}
          <div className="bg-gray-50 rounded p-4 mb-4">
            <p className="text-sm text-gray-500">SKU: {product.inventory_id}</p>
            <h3 className="font-semibold">{product.subcategory_name} - {product.brand_name}</h3>
            <p className="text-sm">Condición: {product.condition_state} | Stock: {product.quantity}</p>
          </div>

          {errors.general && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {errors.general}
            </div>
          )}

          {/* Peso */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Peso (kilogramos) *
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 0.5"
              step="0.01"
              min="0.01"
            />
            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Ingrese el peso en kilogramos (ej: 0.5 para 500 gramos)
            </p>
          </div>

          {/* Precio */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Precio de venta online *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            {product.final_sale_price && (
              <p className="text-sm text-gray-500 mt-1">
                Precio sugerido en tienda física: ${product.final_sale_price}
              </p>
            )}
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Imágenes */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Imágenes del producto *
            </label>
            
            {/* Vista previa de imágenes */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Input de archivo */}
            <div className="flex items-center">
              <label className={`cursor-pointer px-4 py-2 rounded transition-colors ${
                uploading ? 'bg-gray-300 text-gray-500' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}>
                {uploading ? 'Subiendo...' : 'Seleccionar imágenes'}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <span className="ml-3 text-sm text-gray-500">
                {images.length} imagen(es) seleccionada(s)
              </span>
            </div>
            {errors.images && (
              <p className="text-red-500 text-sm mt-1">{errors.images}</p>
            )}
          </div>

          {/* Producto destacado */}
          <div className="mb-6 bg-brand-amarillo/10 p-4 rounded-lg border border-brand-amarillo/30">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="mt-1 h-5 w-5 text-brand-rosa focus:ring-brand-rosa border-gray-300 rounded"
              />
              <div>
                <span className="font-medium text-gray-900">⭐ Marcar como producto destacado</span>
                <p className="text-sm text-gray-600 mt-1">
                  Los productos destacados aparecerán en la sección principal de la tienda online
                </p>
              </div>
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar y publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para editar notas
const NotesModal = ({ product, onClose, onSave }) => {
  const [notes, setNotes] = useState(product.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await storeService.updateProductNotes(product.inventory_id, notes);
      onSave();
    } catch (err) {
      setError(err.message || 'Error al guardar las notas');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {product.notes ? 'Editar notas' : 'Agregar notas'}
          </h2>

          {/* Información del producto */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.inventory_id}</p>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{product.subcategory_name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand_name}</p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Campo de notas */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Notas del producto
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={4}
              placeholder="Escribe notas sobre el producto (ej: detalles de daños, accesorios incluidos, etc.)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Las notas son visibles internamente para el equipo
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar notas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const ProductPreparationContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notesProduct, setNotesProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    category_id: '',
    subcategory_id: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (filters.category_id) {
      loadSubcategories(filters.category_id);
    } else {
      setSubcategories([]);
    }
  }, [filters.category_id]);

  // Cargar datos cuando el componente se monta o los filtros cambian
  // El OptionalAuthGuard ya verificó la autenticación antes de renderizar este componente
  useEffect(() => {
    loadProducts();
    loadStats();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const data = await categoryService.getSubcategories(categoryId);
      setSubcategories(data);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await storeService.getPendingProducts(filters);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await storeService.getStoreStats();
      setStats(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleProductSaved = () => {
    setSelectedProduct(null);
    loadProducts();
    loadStats();
  };

  const handleNotesSaved = () => {
    setNotesProduct(null);
    loadProducts();
  };

  const handleCategoryChange = (categoryId) => {
    setFilters({
      ...filters,
      category_id: categoryId,
      subcategory_id: '', // Reset subcategory when category changes
      page: 1
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header con estadísticas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Preparación de productos</h1>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending_products}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">En línea</p>
              <p className="text-2xl font-bold text-green-600">{stats.online_products}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Hoy</p>
              <p className="text-2xl font-bold text-blue-600">{stats.prepared_today}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Esta semana</p>
              <p className="text-2xl font-bold text-purple-600">{stats.prepared_week}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor inventario</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(stats.total_inventory_value)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Filtro de ubicación */}
          <select
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value, page: 1})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todas las ubicaciones</option>
            <option value="Polanco">Polanco</option>
            <option value="Satélite">Satélite</option>
          </select>

          {/* Filtro de categoría */}
          <select
            value={filters.category_id}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Filtro de subcategoría */}
          <select
            value={filters.subcategory_id}
            onChange={(e) => setFilters({...filters, subcategory_id: e.target.value, page: 1})}
            disabled={!filters.category_id}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Todas las subcategorías</option>
            {subcategories.map(subcat => (
              <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
            ))}
          </select>

          {/* Botón para limpiar filtros */}
          {(filters.location || filters.category_id || filters.subcategory_id) && (
            <button
              onClick={() => setFilters({ location: '', category_id: '', subcategory_id: '', page: 1, limit: 12 })}
              className="px-3 py-2 text-pink-600 hover:text-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors text-sm font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
          No hay productos pendientes de preparación
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.inventory_id}
                product={product}
                onPrepare={setSelectedProduct}
                onEditNotes={setNotesProduct}
              />
            ))}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setFilters({...filters, page})}
                  className={`px-3 py-1 rounded ${
                    page === filters.page
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de preparación */}
      {selectedProduct && (
        <PreparationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={handleProductSaved}
        />
      )}

      {/* Modal de notas */}
      {notesProduct && (
        <NotesModal
          product={notesProduct}
          onClose={() => setNotesProduct(null)}
          onSave={handleNotesSaved}
        />
      )}
    </div>
  );
};

// Componente con guardia de autenticación
const ProductPreparationWithAuth = () => {
  return (
    <OptionalAuthGuard requireAuth={true} allowedRoles={EMPLOYEE_ROLES}>
      <ProductPreparationContent />
    </OptionalAuthGuard>
  );
};

// Componente principal que incluye los providers
const ProductPreparation = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductPreparationWithAuth />
      </CartProvider>
    </AuthProvider>
  );
};

export default ProductPreparation;