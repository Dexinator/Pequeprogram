import { Request, Response } from 'express';
import { productService } from '../services/product.service';

export class ProductController {
  /**
   * Obtener todos los productos
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await productService.findAll();
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos'
      });
    }
  }

  /**
   * Obtener un producto por ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        });
        return;
      }
      
      const product = await productService.findById(productId);
      
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el producto'
      });
    }
  }

  /**
   * Crear un nuevo producto
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        category_id, 
        name, 
        description, 
        brand, 
        model, 
        age_group 
      } = req.body;
      
      // Validar campos requeridos
      if (!name || !category_id) {
        res.status(400).json({
          success: false,
          message: 'El nombre y la categoría son obligatorios'
        });
        return;
      }
      
      const newProduct = await productService.create({
        category_id,
        name,
        description,
        brand,
        model,
        age_group,
        is_active: true
      });
      
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: newProduct
      });
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el producto'
      });
    }
  }

  /**
   * Actualizar un producto existente
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      const { 
        category_id, 
        name, 
        description, 
        brand, 
        model, 
        age_group,
        is_active 
      } = req.body;
      
      if (isNaN(productId)) {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        });
        return;
      }
      
      // Verificar si el producto existe
      const existingProduct = await productService.findById(productId);
      
      if (!existingProduct) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
        return;
      }
      
      // Actualizar producto
      const updatedProduct = await productService.update(productId, {
        category_id,
        name,
        description,
        brand,
        model,
        age_group,
        is_active
      });
      
      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el producto'
      });
    }
  }

  /**
   * Eliminar un producto (soft delete)
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        res.status(400).json({
          success: false,
          message: 'ID de producto inválido'
        });
        return;
      }
      
      // Verificar si el producto existe
      const existingProduct = await productService.findById(productId);
      
      if (!existingProduct) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
        return;
      }
      
      // Eliminar producto (soft delete)
      const deleted = await productService.delete(productId);
      
      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Producto eliminado exitosamente'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar el producto'
        });
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el producto'
      });
    }
  }

  /**
   * Obtener productos por categoría
   */
  getByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          message: 'ID de categoría inválido'
        });
        return;
      }
      
      // Suponemos que tenemos un método en el servicio para buscar por categoría
      const products = await productService.findByCategory(categoryId);
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos por categoría'
      });
    }
  }
}

// Exportar una instancia singleton del controlador
export const productController = new ProductController(); 