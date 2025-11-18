import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import { uploadMultiple, handleMulterError } from '../utils/upload.middleware';
import {
  getPendingProducts,
  getOnlineProducts,
  getProductDetail,
  getRelatedProducts,
  getFeaturedProducts,
  getProductForPreparation,
  prepareProductForStore,
  getStoreStats,
  getAvailableStatuses,
  uploadProductImages,
  updatePublishedProduct,
  unpublishProduct,
  bulkUpdateProducts,
  getPublishedProductsForManagement
} from '../controllers/store.controller';

const router = express.Router();

// Public routes
router
  .route('/products/ready')
  .get(getOnlineProducts);

router
  .route('/products/featured')
  .get(getFeaturedProducts);

router
  .route('/available-statuses')
  .get(getAvailableStatuses);

// Public product detail routes
router
  .route('/products/:id/detail')
  .get(getProductDetail);

router
  .route('/products/:id/related')
  .get(getRelatedProducts);

// Protected routes
router.use(protect);

// Routes for admin, manager, and sales
router
  .route('/products/pending')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getPendingProducts);

router
  .route('/products/:id/prepare')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), getProductForPreparation)
  .put(authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']), prepareProductForStore);

router
  .route('/stats')
  .get(authorize(['superadmin', 'admin', 'manager', 'gerente']), getStoreStats);

// Image upload route
router
  .route('/upload-images')
  .post(
    authorize(['superadmin', 'admin', 'manager', 'gerente', 'sales', 'vendedor']),
    uploadMultiple,
    handleMulterError,
    uploadProductImages
  );

// Product management routes (admin/superadmin only)
router
  .route('/products/management')
  .get(authorize(['superadmin', 'admin']), getPublishedProductsForManagement);

router
  .route('/products/:id/update')
  .put(authorize(['superadmin', 'admin']), updatePublishedProduct);

router
  .route('/products/:id/unpublish')
  .put(authorize(['superadmin', 'admin']), unpublishProduct);

router
  .route('/products/bulk-update')
  .put(authorize(['superadmin', 'admin']), bulkUpdateProducts);

export default router;