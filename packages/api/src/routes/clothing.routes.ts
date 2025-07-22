import express from 'express';
import { ClothingController } from '../controllers/clothing.controller';
import { ClothingService } from '../services/clothing.service';
import { protect } from '../utils/auth.middleware';

const router = express.Router();
const clothingService = new ClothingService();
const clothingController = new ClothingController(clothingService);

// All clothing routes require authentication
router.use(protect);

// Get all clothing prices (optional filter by category group)
router.get('/prices', clothingController.getClothingPrices);

// Get specific price for a combination
router.get('/price', clothingController.getSpecificPrice);

// Get garment types for a specific category group
router.get('/garment-types/:categoryGroup', clothingController.getGarmentTypes);

// Get clothing sizes for a specific category group
router.get('/sizes/:categoryGroup', clothingController.getClothingSizes);

// Check if a subcategory is for clothing
router.get('/check-category/:subcategoryId', clothingController.checkIfClothingCategory);

// Calculate clothing valuation
router.post('/calculate', clothingController.calculateClothingValuation);

export default router;