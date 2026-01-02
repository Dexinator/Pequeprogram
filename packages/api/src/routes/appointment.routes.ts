import express from 'express';
import { protect, authorize } from '../utils/auth.middleware';
import {
  getBookingSubcategories,
  getAvailableSlots,
  getAvailableDates,
  searchClientsByPhone,
  createAppointment,
  getAppointmentsAdmin,
  getAppointmentStats,
  getAppointmentDetail,
  cancelAppointment,
  updateAppointmentStatus,
  toggleSubcategoryPurchasing,
  getSubcategoriesAdmin
} from '../controllers/appointment.controller';

const router = express.Router();

// ===== PUBLIC ROUTES =====
// Endpoints for the booking wizard

// Get subcategories for booking (with is_clothing and purchasing_enabled)
router.get('/subcategories', getBookingSubcategories);

// Get available time slots for a date
router.get('/slots/:date', getAvailableSlots);

// Get dates with available slots
router.get('/available-dates', getAvailableDates);

// Search clients by phone (returns only id and name)
router.get('/clients/search', searchClientsByPhone);

// Create new appointment
router.post('/', createAppointment);

// ===== ADMIN ROUTES =====
// All admin routes require authentication and any employee role

const employeeRoles = ['superadmin', 'admin', 'gerente', 'valuador', 'vendedor'];

// Get appointment statistics
router.get(
  '/admin/stats',
  protect,
  authorize(employeeRoles),
  getAppointmentStats
);

// Get all appointments with filters
router.get(
  '/admin',
  protect,
  authorize(employeeRoles),
  getAppointmentsAdmin
);

// Get subcategories with purchasing status
router.get(
  '/admin/subcategories',
  protect,
  authorize(employeeRoles),
  getSubcategoriesAdmin
);

// Toggle subcategory purchasing enabled
router.put(
  '/admin/subcategories/:id/toggle',
  protect,
  authorize(employeeRoles),
  toggleSubcategoryPurchasing
);

// Get single appointment details
router.get(
  '/admin/:id',
  protect,
  authorize(employeeRoles),
  getAppointmentDetail
);

// Cancel appointment
router.put(
  '/admin/:id/cancel',
  protect,
  authorize(employeeRoles),
  cancelAppointment
);

// Update appointment status
router.put(
  '/admin/:id/status',
  protect,
  authorize(employeeRoles),
  updateAppointmentStatus
);

export default router;
