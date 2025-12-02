import React, { useState, useEffect } from 'react';
import { storeService } from '../services/store.service';

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
  const [unpublishReason, setUnpublishReason] = useState('');

  useEffect(() => {
    if (product) {
      // Convertir gramos a kilogramos para mostrar
      setWeight(product.weight_grams ? (product.weight_grams / 1000).toString() : '');
      setPrice(product.online_price ? product.online_price.toString() : '');
      setImages(product.images || []);
      setFeatured(product.online_featured || false);
    }
  }, [product]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setErrors({});

    try {
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} no es una imagen válida`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} excede el tamaño máximo de 5MB`);
        }
        return true;
      });

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
      newErrors.images = 'Debe incluir al menos una imagen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        weight_grams: Math.round(parseFloat(weight) * 1000),
        images: images,
        online_price: parseFloat(price),
        online_featured: featured
      };

      await storeService.updatePublishedProduct(product.inventory_id, data);
      onSave();
    } catch (error) {
      setErrors({ general: error.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!unpublishReason.trim()) {
      alert('Debes proporcionar una razón para despublicar');
      return;
    }

    setSaving(true);
    try {
      await storeService.unpublishProduct(product.inventory_id, unpublishReason);
      setShowUnpublishConfirm(false);
      onSave();
    } catch (error) {
      setErrors({ general: error.message || 'Error al despublicar' });
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-full sm:max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Editar producto publicado
            </h2>

            {/* Información del producto */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.inventory_id}</p>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {product.subcategory_name} - {product.brand_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Condición: {product.condition_state} | Stock: {product.quantity}
              </p>
            </div>

            {/* Información no editable */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4 mb-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
                ℹ️ Campos no editables (definidos en la valuación):
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-400">
                <p>• Categoría: {product.category_name}</p>
                <p>• Marca: {product.brand_name}</p>
                <p>• Estado: {product.condition_state}</p>
                <p>• Ubicación: {product.location}</p>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded mb-4">
                {errors.general}
              </div>
            )}

            {/* Campos editables */}
            <div className="space-y-4">
              {/* Peso */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Peso (kilogramos) *
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                    errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ej: 0.5"
                  step="0.01"
                  min="0.01"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Precio de venta online *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Imágenes del producto *
                </label>

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
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {images.length} imagen(es) seleccionada(s)
                  </span>
                </div>
                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                )}
              </div>

              {/* Producto destacado */}
              <div className="bg-brand-amarillo/10 p-4 rounded-lg border border-brand-amarillo/30">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="mt-1 h-5 w-5 text-brand-rosa focus:ring-brand-rosa border-gray-300 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ⭐ Marcar como producto destacado
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Los productos destacados aparecerán en la sección principal de la tienda online
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
              {/* Botón de despublicar */}
              <button
                onClick={() => setShowUnpublishConfirm(true)}
                disabled={saving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 font-medium"
              >
                🗑️ Despublicar producto
              </button>

              {/* Botones principales */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="px-4 py-2 bg-brand-rosa hover:bg-pink-700 text-white rounded transition-colors disabled:opacity-50 font-medium"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para despublicar */}
      {showUnpublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                ⚠️ Despublicar producto
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                El producto será removido de la tienda online. Esta acción se puede revertir volviendo a preparar el producto.
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Razón para despublicar *
                </label>
                <textarea
                  value={unpublishReason}
                  onChange={(e) => setUnpublishReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-rosa bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows="3"
                  placeholder="Ej: Fotos incorrectas, actualización de inventario, etc."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnpublishConfirm(false);
                    setUnpublishReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnpublish}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Despublicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductEditModal;
