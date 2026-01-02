import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { appointmentService } from '../services/appointment.service';

// ========== PUBLIC ENDPOINTS ==========

// @desc    Get subcategories available for booking
// @route   GET /api/appointments/subcategories
// @access  Public
export const getBookingSubcategories = asyncHandler(async (req: Request, res: Response) => {
  const subcategories = await appointmentService.getBookingSubcategories();

  res.json({
    success: true,
    data: subcategories
  });
});

// @desc    Get available time slots for a specific date
// @route   GET /api/appointments/slots/:date
// @access  Public
export const getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.params;

  // Validate date format
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400);
    throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
  }

  const slots = await appointmentService.getAvailableSlots(date);

  res.json({
    success: true,
    data: slots
  });
});

// @desc    Get available dates for booking
// @route   GET /api/appointments/available-dates
// @access  Public
export const getAvailableDates = asyncHandler(async (req: Request, res: Response) => {
  const weeksAhead = parseInt(req.query.weeks_ahead as string) || 12;

  const dates = await appointmentService.getAvailableDates(weeksAhead);

  res.json({
    success: true,
    data: dates
  });
});

// @desc    Search registered clients by phone
// @route   GET /api/appointments/clients/search
// @access  Public
export const searchClientsByPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.query;

  if (!phone || typeof phone !== 'string' || phone.length < 3) {
    res.status(400);
    throw new Error('Se requieren al menos 3 dígitos del teléfono');
  }

  const clients = await appointmentService.searchClientsByPhone(phone);

  res.json({
    success: true,
    data: clients
  });
});

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const {
    client_id,
    client_name,
    client_phone,
    client_email,
    appointment_date,
    start_time,
    items
  } = req.body;

  // Basic validation
  if (!appointment_date) {
    res.status(400);
    throw new Error('Se requiere la fecha de la cita');
  }

  if (!start_time) {
    res.status(400);
    throw new Error('Se requiere la hora de la cita');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Se requiere al menos un producto');
  }

  // Either client_id OR client info must be provided
  if (!client_id && !client_name) {
    res.status(400);
    throw new Error('Se requiere seleccionar un cliente existente o proporcionar datos del nuevo cliente');
  }

  // If new client, phone is required
  if (!client_id && !client_phone) {
    res.status(400);
    throw new Error('Se requiere el teléfono del cliente');
  }

  try {
    const appointment = await appointmentService.createAppointment({
      client_id: client_id ? parseInt(client_id) : undefined,
      client_name,
      client_phone,
      client_email,
      appointment_date,
      start_time,
      items
    });

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: appointment
    });
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Error al crear la cita');
  }
});

// ========== ADMIN ENDPOINTS ==========

// @desc    Get all appointments with filters
// @route   GET /api/appointments/admin
// @access  Private (any employee role)
export const getAppointmentsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const filters = {
    date_from: req.query.date_from as string,
    date_to: req.query.date_to as string,
    status: req.query.status as string
  };

  const { appointments, total } = await appointmentService.getAppointmentsAdmin(offset, limit, filters);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get appointment stats
// @route   GET /api/appointments/admin/stats
// @access  Private (any employee role)
export const getAppointmentStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await appointmentService.getAppointmentStats();

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Get single appointment details
// @route   GET /api/appointments/admin/:id
// @access  Private (any employee role)
export const getAppointmentDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cita inválido');
  }

  const appointment = await appointmentService.getAppointmentById(id);

  if (!appointment) {
    res.status(404);
    throw new Error('Cita no encontrada');
  }

  res.json({
    success: true,
    data: appointment
  });
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/admin/:id/cancel
// @access  Private (any employee role)
export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { reason } = req.body;
  const userId = (req as any).user?.id;

  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cita inválido');
  }

  if (!reason) {
    res.status(400);
    throw new Error('Se requiere el motivo de la cancelación');
  }

  const appointment = await appointmentService.cancelAppointment(id, userId, reason);

  if (!appointment) {
    res.status(404);
    throw new Error('Cita no encontrada o ya fue cancelada');
  }

  res.json({
    success: true,
    message: 'Cita cancelada exitosamente',
    data: appointment
  });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/admin/:id/status
// @access  Private (any employee role)
export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status, notes } = req.body;

  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de cita inválido');
  }

  if (!status || !['completed', 'no_show'].includes(status)) {
    res.status(400);
    throw new Error('Estado inválido. Use "completed" o "no_show"');
  }

  const appointment = await appointmentService.updateAppointmentStatus(id, status, notes);

  if (!appointment) {
    res.status(404);
    throw new Error('Cita no encontrada o no está programada');
  }

  res.json({
    success: true,
    message: 'Estado de cita actualizado',
    data: appointment
  });
});

// @desc    Toggle subcategory purchasing enabled status
// @route   PUT /api/appointments/admin/subcategories/:id/toggle
// @access  Private (any employee role)
export const toggleSubcategoryPurchasing = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400);
    throw new Error('ID de subcategoría inválido');
  }

  const result = await appointmentService.toggleSubcategoryPurchasing(id);

  res.json({
    success: true,
    message: result.purchasing_enabled
      ? 'Subcategoría habilitada para compras'
      : 'Subcategoría deshabilitada para compras',
    data: result
  });
});

// @desc    Get subcategories with purchasing status for admin
// @route   GET /api/appointments/admin/subcategories
// @access  Private (any employee role)
export const getSubcategoriesAdmin = asyncHandler(async (req: Request, res: Response) => {
  const subcategories = await appointmentService.getSubcategoriesAdmin();

  res.json({
    success: true,
    data: subcategories
  });
});
