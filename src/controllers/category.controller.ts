import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';

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
}

// Exportar una instancia singleton del controlador
export const categoryController = new CategoryController(); 