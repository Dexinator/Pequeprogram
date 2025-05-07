import { Request, Response } from 'express';
import { pool } from '../db';

export class BrandController {
  /**
   * Obtener todas las marcas
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT * FROM brands
          WHERE is_active = true
          ORDER BY name
        `);
        
        res.status(200).json({
          success: true,
          data: result.rows
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener marcas'
      });
    }
  }

  /**
   * Obtener marcas por subcategoría
   */
  getBySubcategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const subcategoryId = req.query.subcategory_id;
      
      console.log('Solicitud de marcas para subcategoría:', subcategoryId);
      
      if (!subcategoryId) {
        // Si no se proporciona subcategory_id, devolver todas las marcas
        const client = await pool.connect();
        try {
          const result = await client.query(`
            SELECT * FROM brands
            WHERE is_active = true
            ORDER BY name
          `);
          
          console.log(`Devolviendo todas las marcas: ${result.rows.length} encontradas`);
          
          res.status(200).json({
            success: true,
            data: result.rows
          });
        } finally {
          client.release();
        }
        return;
      }
      
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT * FROM brands
          WHERE subcategory_id = $1 AND is_active = true
          ORDER BY name
        `, [subcategoryId]);
        
        console.log(`Marcas encontradas para subcategoría ${subcategoryId}: ${result.rows.length}`);
        
        res.status(200).json({
          success: true,
          data: result.rows
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al obtener marcas por subcategoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener marcas por subcategoría'
      });
    }
  }
}

// Exportar una instancia singleton del controlador
export const brandController = new BrandController(); 