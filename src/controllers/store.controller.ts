import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StoreService } from '../services/store.service';
import { s3Service } from '../services/s3.service';

const storeService = new StoreService();

// @desc    Get products pending online store preparation
// @route   GET /api/store/products/pending
// @access  Private (admin, manager, sales)
export const getPendingProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const location = req.query.location as string;
  const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
  const subcategory_id = req.query.subcategory_id ? parseInt(req.query.subcategory_id as string) : undefined;

  const result = await storeService.getPendingProducts({
    page,
    limit,
    location,
    category_id,
    subcategory_id
  });

  res.json({
    products: result.products,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  });
});

// @desc    Get online store ready products
// @route   GET /api/store/products/ready
// @access  Public
export const getOnlineProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
  const subcategory_id = req.query.subcategory_id ? parseInt(req.query.subcategory_id as string) : undefined;

  // Nuevo: manejar múltiples IDs de subcategorías
  let subcategory_ids: number[] | undefined;
  if (req.query.subcats) {
    // Subcats puede venir como "1,2,3" o como array ["1", "2", "3"]
    const subcatsParam = req.query.subcats;
    if (typeof subcatsParam === 'string') {
      subcategory_ids = subcatsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    } else if (Array.isArray(subcatsParam)) {
      subcategory_ids = subcatsParam.map(id => parseInt(id as string)).filter(id => !isNaN(id));
    }
  } else if (req.query.subcategory_ids) {
    // También aceptar subcategory_ids como parámetro
    const subcategoryIdsParam = req.query.subcategory_ids;
    if (typeof subcategoryIdsParam === 'string') {
      subcategory_ids = subcategoryIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    } else if (Array.isArray(subcategoryIdsParam)) {
      subcategory_ids = subcategoryIdsParam.map(id => parseInt(id as string)).filter(id => !isNaN(id));
    }
  }

  const min_price = req.query.min_price ? parseFloat(req.query.min_price as string) : undefined;
  const max_price = req.query.max_price ? parseFloat(req.query.max_price as string) : undefined;
  const search = req.query.search as string;
  const condition_state = req.query.condition_state as string;
  const status = req.query.status as string;
  const location = req.query.location as string;
  const brand_id = req.query.brand_id ? parseInt(req.query.brand_id as string) : undefined;
  const sort = req.query.sort as string;

  // Extraer filtros de features dinámicas (feature_*)
  const features: Record<string, any> = {};
  Object.keys(req.query).forEach(key => {
    if (key.startsWith('feature_')) {
      const featureName = key.replace('feature_', '');
      features[featureName] = req.query[key];
    }
  });

  const result = await storeService.getOnlineProducts({
    page,
    limit,
    category_id,
    subcategory_id,
    subcategory_ids, // Nuevo parámetro
    min_price,
    max_price,
    search,
    condition_state,
    status,
    location,
    brand_id,
    sort,
    features: Object.keys(features).length > 0 ? features : undefined
  });

  res.json({
    products: result.products,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  });
});

// @desc    Get public product detail by inventory ID
// @route   GET /api/store/products/:id
// @access  Public
export const getProductDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await storeService.getOnlineProductDetail(id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  res.json({
    success: true,
    data: product
  });
});

// @desc    Get related products for a product
// @route   GET /api/store/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // This is inventory_id (e.g., "CARP001")
  const limit = parseInt(req.query.limit as string) || 8;

  const products = await storeService.getRelatedProductsByInventoryId(id, limit);

  res.json({
    success: true,
    data: products
  });
});

// @desc    Get product details for preparation
// @route   GET /api/store/products/:id/prepare
// @access  Private (admin, manager, sales)
export const getProductForPreparation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await storeService.getProductForPreparation(id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  res.json({
    success: true,
    data: product
  });
});

// @desc    Update product for online store
// @route   PUT /api/store/products/:id/prepare
// @access  Private (admin, manager, sales)
export const prepareProductForStore = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  
  if (!userId) {
    res.status(401);
    throw new Error('Usuario no autenticado');
  }

  const {
    weight_grams,
    images,
    online_price,
    online_featured
  } = req.body;

  // Validations
  if (!weight_grams || weight_grams <= 0) {
    res.status(400);
    throw new Error('El peso debe ser mayor a 0 gramos');
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    res.status(400);
    throw new Error('Debe incluir al menos una imagen');
  }

  if (!online_price || online_price <= 0) {
    res.status(400);
    throw new Error('El precio debe ser mayor a 0');
  }

  const result = await storeService.prepareProductForStore(id, userId, {
    weight_grams,
    images,
    online_price,
    online_featured
  });

  res.json({
    success: true,
    data: result,
    message: 'Producto preparado para la tienda en línea'
  });
});

// @desc    Get featured products
// @route   GET /api/store/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 8;
  
  const products = await storeService.getFeaturedProducts(limit);
  
  res.json({
    success: true,
    data: products
  });
});

// @desc    Get statistics for online store preparation
// @route   GET /api/store/stats
// @access  Private (admin, manager)
export const getStoreStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await storeService.getStoreStats();

  res.json(stats);
});

// @desc    Get available product statuses
// @route   GET /api/store/available-statuses
// @access  Public
export const getAvailableStatuses = asyncHandler(async (req: Request, res: Response) => {
  const statuses = await storeService.getAvailableStatuses();

  res.json({
    success: true,
    data: statuses
  });
});

// @desc    Upload product images
// @route   POST /api/store/upload-images
// @access  Private (admin, manager, sales)
export const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    res.status(400);
    throw new Error('No se recibieron archivos');
  }

  const inventoryId = req.body.inventoryId;
  if (!inventoryId) {
    res.status(400);
    throw new Error('Se requiere el ID del inventario');
  }

  try {
    // Subir todas las imágenes en paralelo
    const uploadPromises = req.files.map((file: Express.Multer.File) =>
      s3Service.uploadProductImage(file, inventoryId)
    );

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      success: true,
      images: uploadResults.map(result => ({
        url: result.url,
        thumbnailUrl: result.thumbnailUrl
      })),
      message: `${uploadResults.length} imagen(es) subida(s) exitosamente`
    });
  } catch (error: any) {
    res.status(500);
    throw new Error(`Error al subir imágenes: ${error.message}`);
  }
});

// @desc    Update published product
// @route   PUT /api/store/products/:id/update
// @access  Private (admin, superadmin only)
export const updatePublishedProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401);
    throw new Error('Usuario no autenticado');
  }

  const {
    weight_grams,
    images,
    online_price,
    online_featured
  } = req.body;

  // Validations
  if (!weight_grams || weight_grams <= 0) {
    res.status(400);
    throw new Error('El peso debe ser mayor a 0 gramos');
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    res.status(400);
    throw new Error('Debe incluir al menos una imagen');
  }

  if (!online_price || online_price <= 0) {
    res.status(400);
    throw new Error('El precio debe ser mayor a 0');
  }

  const result = await storeService.updatePublishedProduct(id, userId, {
    weight_grams,
    images,
    online_price,
    online_featured
  });

  res.json({
    success: true,
    data: result,
    message: 'Producto actualizado exitosamente'
  });
});

// @desc    Unpublish product from online store
// @route   PUT /api/store/products/:id/unpublish
// @access  Private (admin, superadmin only)
export const unpublishProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { reason } = req.body;

  if (!userId) {
    res.status(401);
    throw new Error('Usuario no autenticado');
  }

  if (!reason || reason.trim().length === 0) {
    res.status(400);
    throw new Error('Debe proporcionar una razón para despublicar el producto');
  }

  const result = await storeService.unpublishProduct(id, userId, reason);

  res.json({
    success: true,
    data: result,
    message: 'Producto despublicado exitosamente'
  });
});

// @desc    Bulk update products
// @route   PUT /api/store/products/bulk-update
// @access  Private (admin, superadmin only)
export const bulkUpdateProducts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { product_ids, action, data } = req.body;

  if (!userId) {
    res.status(401);
    throw new Error('Usuario no autenticado');
  }

  if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
    res.status(400);
    throw new Error('Debe seleccionar al menos un producto');
  }

  if (!action) {
    res.status(400);
    throw new Error('Debe especificar una acción');
  }

  // Validate action
  const validActions = ['feature', 'unfeature', 'unpublish', 'update_price'];
  if (!validActions.includes(action)) {
    res.status(400);
    throw new Error('Acción no válida');
  }

  // Limit bulk operations to 50 products at once
  if (product_ids.length > 50) {
    res.status(400);
    throw new Error('No se pueden procesar más de 50 productos a la vez');
  }

  const result = await storeService.bulkUpdateProducts(product_ids, action, userId, data);

  res.json({
    success: true,
    data: result,
    message: `${result.affectedCount} producto(s) actualizados exitosamente`
  });
});

// @desc    Get published products for management
// @route   GET /api/store/products/management
// @access  Private (admin, superadmin only)
export const getPublishedProductsForManagement = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category_id = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;
  const subcategory_id = req.query.subcategory_id ? parseInt(req.query.subcategory_id as string) : undefined;
  const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
  const min_price = req.query.min_price ? parseFloat(req.query.min_price as string) : undefined;
  const max_price = req.query.max_price ? parseFloat(req.query.max_price as string) : undefined;
  const location = req.query.location as string;
  const search = req.query.search as string;
  const date_from = req.query.date_from as string;
  const date_to = req.query.date_to as string;
  const sort = req.query.sort as string;

  const result = await storeService.getPublishedProductsForManagement({
    page,
    limit,
    category_id,
    subcategory_id,
    featured,
    min_price,
    max_price,
    location,
    search,
    date_from,
    date_to,
    sort
  });

  res.json({
    products: result.products,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  });
});