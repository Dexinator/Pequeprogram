import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { storeService } from '../services/store.service';
import OptionalAuthGuard from './auth/OptionalAuthGuard';
import { EMPLOYEE_ROLES } from '../config/routes.config';

// Componente de tarjeta de producto pendiente
const ProductCard = ({ product, onPrepare }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-gray-500">{product.inventory_id}</p>
          <h3 className="font-semibold text-gray-900">{product.subcategory_name}</h3>
          <p className="text-sm text-gray-600">{product.brand_name}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          product.condition_state === 'excelente' ? 'bg-green-100 text-green-800' :
          product.condition_state === 'bueno' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {product.condition_state}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        <p>Precio sugerido: ${product.final_sale_price}</p>
        <p>Stock: {product.quantity} piezas</p>
        <p>Ubicación: {product.location}</p>
      </div>

      {product.features && Object.keys(product.features).length > 0 && (
        <div className="mb-3 text-xs text-gray-500">
          {Object.entries(product.features).slice(0, 3).map(([key, value]) => (
            <p key={key}>{key}: {value}</p>
          ))}
        </div>
      )}

      <button
        onClick={() => onPrepare(product)}
        className="w-full bg-pink-600 text-white rounded py-2 hover:bg-pink-700 transition-colors"
      >
        Preparar para tienda
      </button>
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
        weight_grams: parseInt(weight),
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
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
              Peso (gramos) *
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: 500"
            />
            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
            )}
          </div>

          {/* Precio */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Precio de venta online *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
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

// Componente principal
const ProductPreparationContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    category_id: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });

  // Cargar datos cuando el componente se monta o los filtros cambian
  // El OptionalAuthGuard ya verificó la autenticación antes de renderizar este componente
  useEffect(() => {
    loadProducts();
    loadStats();
  }, [filters]);

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
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_products}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">En línea</p>
              <p className="text-2xl font-bold text-green-600">{stats.online_products}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Hoy</p>
              <p className="text-2xl font-bold text-blue-600">{stats.prepared_today}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Esta semana</p>
              <p className="text-2xl font-bold text-purple-600">{stats.prepared_week}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Valor inventario</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.total_inventory_value)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value, page: 1})}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Todas las ubicaciones</option>
            <option value="Polanco">Polanco</option>
            <option value="Satélite">Satélite</option>
          </select>
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