import { Request, Response } from 'express';
import { ClothingService } from '../services/clothing.service';
import asyncHandler from 'express-async-handler';

export class ClothingController {
  constructor(private clothingService: ClothingService) {}

  getClothingPrices = asyncHandler(async (req: Request, res: Response) => {
    const { categoryGroup } = req.query;
    
    const prices = await this.clothingService.getClothingPrices(
      categoryGroup as string | undefined
    );

    res.json({
      status: 'success',
      data: prices
    });
  });

  getGarmentTypes = asyncHandler(async (req: Request, res: Response) => {
    const { categoryGroup } = req.params;

    if (!categoryGroup) {
      res.status(400).json({
        status: 'error',
        message: 'Category group is required'
      });
      return;
    }

    const types = await this.clothingService.getGarmentTypes(categoryGroup);

    res.json({
      status: 'success',
      data: types
    });
  });

  getClothingSizes = asyncHandler(async (req: Request, res: Response) => {
    const { categoryGroup } = req.params;

    if (!categoryGroup) {
      res.status(400).json({
        status: 'error',
        message: 'Category group is required'
      });
      return;
    }

    const sizes = await this.clothingService.getClothingSizes(categoryGroup);

    res.json({
      status: 'success',
      data: sizes
    });
  });

  checkIfClothingCategory = asyncHandler(async (req: Request, res: Response) => {
    const { subcategoryId } = req.params;

    if (!subcategoryId) {
      res.status(400).json({
        status: 'error',
        message: 'Subcategory ID is required'
      });
      return;
    }

    const isClothing = await this.clothingService.isClothingCategory(
      parseInt(subcategoryId)
    );

    const categoryGroup = isClothing 
      ? await this.clothingService.getCategoryGroupBySubcategory(parseInt(subcategoryId))
      : null;

    res.json({
      status: 'success',
      data: {
        isClothing,
        categoryGroup
      }
    });
  });

  getSpecificPrice = asyncHandler(async (req: Request, res: Response) => {
    const { categoryGroup, garmentType, qualityLevel } = req.query;

    if (!categoryGroup || !garmentType || !qualityLevel) {
      res.status(400).json({
        status: 'error',
        message: 'categoryGroup, garmentType, and qualityLevel are required'
      });
      return;
    }

    const price = await this.clothingService.getClothingPriceByType(
      categoryGroup as string,
      garmentType as string,
      qualityLevel as string
    );

    if (!price) {
      res.status(404).json({
        status: 'error',
        message: 'Price not found for the specified combination'
      });
      return;
    }

    res.json({
      status: 'success',
      data: price
    });
  });

  calculateClothingValuation = asyncHandler(async (req: Request, res: Response) => {
    const {
      subcategoryId,
      garmentType,
      qualityLevel,
      status,
      conditionState,
      demand,
      cleanliness
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'subcategoryId',
      'garmentType',
      'qualityLevel',
      'status',
      'conditionState',
      'demand',
      'cleanliness'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({
        status: 'error',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    const result = await this.clothingService.calculateClothingValuation(
      parseInt(subcategoryId),
      garmentType,
      qualityLevel,
      status,
      conditionState,
      demand,
      cleanliness
    );

    res.json({
      status: 'success',
      data: result
    });
  });
}