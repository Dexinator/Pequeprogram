import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { pool } from '../db';
import { Category } from '../models';

export class CategoryController {
  /**
   * Obtener todas las categorías
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await categoryService.findAll();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías'
      });
    }
  }

  /**
   * Obtener una categoría por ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }
      
      const category = await categoryService.findById(categoryId);
      
      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la categoría'
      });
    }
  }

  /**
   * Crear una nueva categoría
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la categoría es obligatorio'
        });
        return;
      }
      
      const newCategory = await categoryService.create({
        name,
        description,
        is_active: true
      });
      
      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: newCategory
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la categoría'
      });
    }
  }

  /**
   * Actualizar una categoría existente
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description, is_active } = req.body;
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }
      
      // Verificar si la categoría existe
      const existingCategory = await categoryService.findById(categoryId);
      
      if (!existingCategory) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }
      
      // Actualizar categoría
      const updatedCategory = await categoryService.update(categoryId, {
        name,
        description,
        is_active
      });
      
      res.status(200).json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la categoría'
      });
    }
  }

  /**
   * Eliminar una categoría (soft delete)
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }
      
      // Verificar si la categoría existe
      const existingCategory = await categoryService.findById(categoryId);
      
      if (!existingCategory) {
        res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
        return;
      }
      
      // Eliminar categoría (soft delete)
      const deleted = await categoryService.delete(categoryId);
      
      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Categoría eliminada exitosamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar la categoría'
        });
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la categoría'
      });
    }
  }

  // Obtener subcategorías por categoría
  getSubcategoriesByCategory = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT * FROM subcategories
          WHERE category_id = $1 AND is_active = true
          ORDER BY name
        `, [categoryId]);

        res.status(200).json({
          success: true,
          data: result.rows
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error al obtener subcategorías:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al procesar la solicitud'
      });
    }
  }

  // Obtener todas las subcategorías
  getAllSubcategories = async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT s.*, c.name as category_name
          FROM subcategories s
          JOIN categories c ON s.category_id = c.id
          WHERE s.is_active = true
          ORDER BY c.name, s.name
        `);

        res.status(200).json({
          success: true,
          data: result.rows
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error al obtener subcategorías:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al procesar la solicitud'
      });
    }
  }

  // Obtener definiciones de características por subcategoría
  getFeatureDefinitionsBySubcategory = async (req: Request, res: Response) => {
    try {
      const { subcategoryId } = req.params;
      const client = await pool.connect();
      
      try {
        // Verificar que la subcategoría existe
        const subcategoryCheck = await client.query(
          'SELECT id FROM subcategories WHERE id = $1',
          [subcategoryId]
        );
        
        if (subcategoryCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Subcategoría no encontrada'
          });
        }
        
        // Obtener las definiciones de características
        const result = await client.query(`
          SELECT * FROM feature_definitions
          WHERE subcategory_id = $1
          ORDER BY order_index
        `, [subcategoryId]);
        
        // Procesar las opciones de selección (convertir de JSONB a array)
        const features = result.rows.map(feature => {
          if (feature.type === 'seleccion' && feature.options) {
            return {
              ...feature,
              options: Array.isArray(feature.options) ? feature.options : Object.values(feature.options)
            };
          }
          return feature;
        });
        
        res.status(200).json({
          success: true,
          data: features
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error al obtener definiciones de características:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener definiciones de características'
      });
    }
  }

  // Obtener definiciones de características marcadas para ofertas por subcategoría
  getOfferFeatureDefinitionsBySubcategory = async (req: Request, res: Response) => {
    try {
      const { subcategoryId } = req.params;
      const client = await pool.connect();

      try {
        // Verificar que la subcategoría existe
        const subcategoryCheck = await client.query(
          'SELECT id FROM subcategories WHERE id = $1',
          [subcategoryId]
        );

        if (subcategoryCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Subcategoría no encontrada'
          });
        }

        // Obtener solo las definiciones de características marcadas para ofertas
        const result = await client.query(`
          SELECT * FROM feature_definitions
          WHERE subcategory_id = $1 AND offer_print = TRUE
          ORDER BY order_index
        `, [subcategoryId]);

        // Procesar las opciones de selección (convertir de JSONB a array)
        const features = result.rows.map(feature => {
          if (feature.type === 'seleccion' && feature.options) {
            return {
              ...feature,
              options: Array.isArray(feature.options) ? feature.options : Object.values(feature.options)
            };
          }
          return feature;
        });

        res.status(200).json({
          success: true,
          data: features
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error al obtener definiciones de características para oferta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener definiciones de características para oferta'
      });
    }
  }

  /**
   * Obtener categorías con conteo de productos disponibles en tienda en línea
   */
  getCategoriesWithProductCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT
            c.id,
            c.name,
            c.description,
            COUNT(DISTINCT inv.id) as product_count
          FROM categories c
          LEFT JOIN valuation_items vi ON c.id = vi.category_id AND vi.online_store_ready = true
          LEFT JOIN inventario inv ON vi.id = inv.valuation_item_id AND inv.quantity > 0
          WHERE c.is_active = true
          GROUP BY c.id, c.name, c.description
          ORDER BY c.name
        `);

        res.status(200).json({
          success: true,
          data: result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            product_count: parseInt(row.product_count) || 0
          }))
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error al obtener categorías con conteo de productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías con conteo de productos'
      });
    }
  }
}

// Exportar una instancia singleton del controlador
export const categoryController = new CategoryController(); 