import { Request, Response } from 'express';
import { ValuationService } from '../services/valuation.service';
import { pool } from '../db';
import {
  AddValuationItemDto,
  CalculateValuationDto,
  CreateValuationDto,
  FinalizeValuationDto,
  ValuationQueryParams
} from '../models/valuation.model';

// Instanciar el servicio de valuación
const valuationService = new ValuationService();

export const valuationController = {
  /**
   * Crear un nuevo cliente o retornar uno existente por teléfono
   */
  createClient: async (req: Request, res: Response) => {
    try {
      const clientData = req.body;
      
      if (!clientData.name || !clientData.phone) {
        return res.status(400).json({ 
          error: 'El nombre y teléfono del cliente son obligatorios' 
        });
      }
      
      const client = await valuationService.createClient(clientData);
      res.status(201).json(client);
    } catch (error: any) {
      console.error('Error al crear/buscar cliente:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Buscar clientes por nombre o teléfono
   */
  searchClients: async (req: Request, res: Response) => {
    try {
      const { term } = req.query;
      
      if (!term || typeof term !== 'string') {
        return res.status(400).json({ 
          error: 'Se requiere un término de búsqueda (term)' 
        });
      }
      
      const clients = await valuationService.searchClients(term);
      res.json(clients);
    } catch (error: any) {
      console.error('Error al buscar clientes:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Obtener un cliente por ID
   */
  getClient: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await valuationService.getClient(parseInt(id));
      
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      
      res.json(client);
    } catch (error: any) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Crear una nueva valuación
   */
  createValuation: async (req: Request, res: Response) => {
    try {
      // @ts-expect-error La propiedad user se agrega en el middleware de autenticación
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      const valuationData: CreateValuationDto = req.body;
      
      if (!valuationData.client_id) {
        return res.status(400).json({ error: 'El ID del cliente es obligatorio' });
      }
      
      const valuation = await valuationService.createValuation(userId, valuationData);
      res.status(201).json(valuation);
    } catch (error: any) {
      console.error('Error al crear valuación:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Obtener una valuación por ID
   */
  getValuation: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const valuation = await valuationService.getValuation(parseInt(id));
      
      if (!valuation) {
        return res.status(404).json({ error: 'Valuación no encontrada' });
      }
      
      res.json(valuation);
    } catch (error: any) {
      console.error('Error al obtener valuación:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Calcular el precio de compra y venta para un producto
   */
  calculateValuation: async (req: Request, res: Response) => {
    try {
      const calculationData: CalculateValuationDto = req.body;
      console.log('calculationData', calculationData);
      // Validar datos requeridos
      const requiredFields = ['subcategory_id', 'status', 'condition_state', 'demand', 'cleanliness', 'new_price'];
      for (const field of requiredFields) {
        if (!(field in calculationData)) {
          return res.status(400).json({ error: `El campo '${field}' es obligatorio` });
        }
      }
      
      const result = await valuationService.calculateValuation(calculationData);
      res.json(result);
    } catch (error: any) {
      console.error('Error al calcular valuación:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Agregar un item a una valuación existente
   */
  addValuationItem: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const itemData: AddValuationItemDto = req.body;
      
      // Validar datos requeridos
      const requiredFields = [
        'category_id', 'subcategory_id', 'status', 'brand_renown', 
        'modality', 'condition_state', 'demand', 'cleanliness', 'new_price'
      ];
      
      for (const field of requiredFields) {
        if (!(field in itemData)) {
          return res.status(400).json({ error: `El campo '${field}' es obligatorio` });
        }
      }
      
      const item = await valuationService.addValuationItem(parseInt(id), itemData);
      res.status(201).json(item);
    } catch (error: any) {
      console.error('Error al agregar item a valuación:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Finalizar una valuación (completada o cancelada)
   */
  finalizeValuation: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const finalizationData: FinalizeValuationDto = req.body;
      
      if (!finalizationData.status || !['completed', 'cancelled'].includes(finalizationData.status)) {
        return res.status(400).json({ 
          error: "El estado debe ser 'completed' o 'cancelled'" 
        });
      }
      
      const valuation = await valuationService.finalizeValuation(parseInt(id), finalizationData);
      res.json(valuation);
    } catch (error: any) {
      console.error('Error al finalizar valuación:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  },
  
  /**
   * Listar valuaciones con filtros y paginación
   */
  getValuations: async (req: Request, res: Response) => {
    try {
      const params: ValuationQueryParams = {
        client_id: req.query.client_id ? parseInt(req.query.client_id as string) : undefined,
        user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
        status: req.query.status as string | undefined,
        start_date: req.query.start_date as string | undefined,
        end_date: req.query.end_date as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };
      
      const result = await valuationService.getValuations(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error al listar valuaciones:', error);
      res.status(500).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  }
}; 