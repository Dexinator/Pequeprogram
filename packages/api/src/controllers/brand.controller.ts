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

  /**
   * Crear una nueva marca
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, subcategory_id, renown } = req.body;
      
      console.log('Solicitud para crear nueva marca:', { name, subcategory_id, renown });
      
      // Validar los datos requeridos
      if (!name || !subcategory_id || !renown) {
        res.status(400).json({
          success: false,
          message: 'Nombre, subcategoría y renombre son obligatorios'
        });
        return;
      }
      
      // Validar que el renombre sea válido
      const validRenown = ['Sencilla', 'Normal', 'Alta', 'Premium'];
      if (!validRenown.includes(renown)) {
        res.status(400).json({
          success: false,
          message: 'Renombre no válido. Debe ser Sencilla, Normal, Alta o Premium'
        });
        return;
      }
      
      const client = await pool.connect();
      try {
        // Insertar la nueva marca
        const result = await client.query(`
          INSERT INTO brands (name, subcategory_id, renown, is_active)
          VALUES ($1, $2, $3, true)
          RETURNING *
        `, [name, subcategory_id, renown]);
        
        const newBrand = result.rows[0];
        console.log('Nueva marca creada:', newBrand);
        
        res.status(201).json({
          success: true,
          message: 'Marca creada exitosamente',
          data: newBrand
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al crear marca:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la marca'
      });
    }
  }
}

// Exportar una instancia singleton del controlador
export const brandController = new BrandController(); 