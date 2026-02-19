import { pool } from '../db';
import { PoolClient } from 'pg';

// Interfaces
export interface AppointmentItem {
  subcategory_id: number;
  quantity: number;
  is_excellent_quality: boolean;
}

export interface CreateAppointmentData {
  client_id?: number;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  appointment_date: string;
  start_time: string;
  items: AppointmentItem[];
}

export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  status?: string;
}

export interface Appointment {
  id: number;
  client_id: number | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  cancelled_by: number | null;
  cancelled_at: Date | null;
  cancellation_reason: string | null;
  created_at: Date;
  updated_at: Date;
  items?: AppointmentItemDetail[];
  total_items?: number;
}

export interface AppointmentItemDetail {
  id: number;
  subcategory_id: number;
  subcategory_name: string;
  category_name: string;
  is_clothing: boolean;
  quantity: number;
  is_excellent_quality: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  is_available: boolean;
}

export interface SubcategoryForBooking {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  is_clothing: boolean;
  purchasing_enabled: boolean;
}

// Time slot configuration
const TIME_SLOTS = [
  { start: '11:00', end: '11:45' },
  { start: '11:45', end: '12:30' },
  { start: '12:30', end: '13:15' },
  { start: '13:15', end: '14:00' },
  { start: '16:00', end: '16:45' },
  { start: '16:45', end: '17:30' },
  { start: '17:30', end: '18:15' }
];

// Valid days: Tuesday (2) and Thursday (4)
const VALID_DAYS = [2, 4];

export class AppointmentService {

  // Get all subcategories with purchasing status for booking
  async getBookingSubcategories(): Promise<SubcategoryForBooking[]> {
    const query = `
      SELECT
        s.id,
        s.name,
        s.category_id,
        c.name as category_name,
        s.is_clothing,
        s.purchasing_enabled
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      WHERE s.is_active = TRUE
      ORDER BY c.name, s.name
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        category_id: row.category_id,
        category_name: row.category_name,
        is_clothing: row.is_clothing || false,
        purchasing_enabled: row.purchasing_enabled !== false // Default to true
      }));
    } catch (error) {
      console.error('Error fetching subcategories for booking:', error);
      throw new Error('Error al obtener subcategorías');
    }
  }

  // Get available time slots for a specific date
  async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    // Check if date is a valid day (Tuesday or Thursday)
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    if (!VALID_DAYS.includes(dayOfWeek)) {
      return TIME_SLOTS.map(slot => ({
        ...slot,
        is_available: false
      }));
    }

    // Get booked slots for this date
    const query = `
      SELECT start_time::text as start_time
      FROM appointments
      WHERE appointment_date = $1 AND status = 'scheduled'
    `;

    try {
      const result = await pool.query(query, [date]);
      const bookedTimes = result.rows.map(row => row.start_time.substring(0, 5));

      return TIME_SLOTS.map(slot => ({
        ...slot,
        is_available: !bookedTimes.includes(slot.start)
      }));
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw new Error('Error al obtener horarios disponibles');
    }
  }

  // Get dates with available slots for the next N weeks
  async getAvailableDates(weeksAhead: number = 12): Promise<string[]> {
    const availableDates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (weeksAhead * 7));

    // Get all booked slots in the date range
    const query = `
      SELECT appointment_date, COUNT(*) as booked_count
      FROM appointments
      WHERE appointment_date >= $1 AND appointment_date <= $2 AND status = 'scheduled'
      GROUP BY appointment_date
    `;

    try {
      const result = await pool.query(query, [
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ]);

      const bookedByDate: { [key: string]: number } = {};
      result.rows.forEach(row => {
        const dateStr = row.appointment_date.toISOString().split('T')[0];
        bookedByDate[dateStr] = parseInt(row.booked_count);
      });

      // Iterate through dates
      const currentDate = new Date(today);
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        if (VALID_DAYS.includes(dayOfWeek)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const bookedCount = bookedByDate[dateStr] || 0;

          // If not all slots are booked, the date is available
          if (bookedCount < TIME_SLOTS.length) {
            availableDates.push(dateStr);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return availableDates;
    } catch (error) {
      console.error('Error fetching available dates:', error);
      throw new Error('Error al obtener fechas disponibles');
    }
  }

  // Search clients by phone (returns minimal data for privacy)
  async searchClientsByPhone(phone: string): Promise<{ id: number; name: string }[]> {
    const query = `
      SELECT id, name
      FROM clients
      WHERE phone LIKE $1 AND is_active = TRUE
      ORDER BY name
      LIMIT 10
    `;

    try {
      const result = await pool.query(query, [`%${phone}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw new Error('Error al buscar clientes');
    }
  }

  // Validate booking requirements
  private validateBookingRequirements(items: AppointmentItem[], subcategories: SubcategoryForBooking[]): { valid: boolean; message?: string } {
    // Check if all items are excellent quality
    const hasNonExcellent = items.some(item => !item.is_excellent_quality);
    if (hasNonExcellent) {
      return {
        valid: false,
        message: 'Solo compramos artículos en excelente estado'
      };
    }

    // Create a map of subcategory info
    const subcatMap = new Map(subcategories.map(s => [s.id, s]));

    // Calculate totals
    let clothingItems = 0;
    let nonClothingItems = 0;

    for (const item of items) {
      const subcat = subcatMap.get(item.subcategory_id);
      if (!subcat) {
        return {
          valid: false,
          message: `Subcategoría no válida: ${item.subcategory_id}`
        };
      }
      if (!subcat.purchasing_enabled) {
        return {
          valid: false,
          message: `No estamos comprando ${subcat.name} por el momento`
        };
      }

      if (subcat.is_clothing) {
        clothingItems += item.quantity;
      } else {
        nonClothingItems += item.quantity;
      }
    }

    // Check minimum requirements
    if (clothingItems > 0 && clothingItems < 20 && nonClothingItems === 0) {
      return {
        valid: false,
        message: 'Para ropa necesitas al menos 20 prendas para agendar cita'
      };
    }

    if (nonClothingItems > 0 && nonClothingItems < 5 && clothingItems === 0) {
      return {
        valid: false,
        message: 'Necesitas al menos 5 artículos para agendar cita'
      };
    }

    if (clothingItems > 0 && nonClothingItems > 0) {
      if (clothingItems < 20 && nonClothingItems < 5) {
        return {
          valid: false,
          message: 'Necesitas al menos 5 artículos (no ropa) o 20 prendas de ropa'
        };
      }
    }

    if (items.length === 0) {
      return {
        valid: false,
        message: 'Debes agregar al menos un producto'
      };
    }

    return { valid: true };
  }

  // Check if time slot is valid
  private isValidTimeSlot(time: string): boolean {
    return TIME_SLOTS.some(slot => slot.start === time);
  }

  // Check if date is a valid day (Tuesday or Thursday)
  private isValidDay(date: string): boolean {
    const dateObj = new Date(date + 'T12:00:00');
    return VALID_DAYS.includes(dateObj.getDay());
  }

  // Get end time for a start time
  private getEndTime(startTime: string): string {
    const slot = TIME_SLOTS.find(s => s.start === startTime);
    return slot ? slot.end : '';
  }

  // Create appointment
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validate date
      if (!this.isValidDay(data.appointment_date)) {
        throw new Error('Solo agendamos citas los martes y jueves');
      }

      // Validate time slot
      if (!this.isValidTimeSlot(data.start_time)) {
        throw new Error('Horario no válido');
      }

      // Check if slot is available
      const slotCheck = await client.query(
        `SELECT id FROM appointments
         WHERE appointment_date = $1 AND start_time = $2 AND status = 'scheduled'`,
        [data.appointment_date, data.start_time]
      );

      if (slotCheck.rows.length > 0) {
        throw new Error('Este horario ya está reservado');
      }

      // Get subcategories for validation
      const subcategories = await this.getBookingSubcategories();

      // Validate items
      const validation = this.validateBookingRequirements(data.items, subcategories);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Get end time
      const endTime = this.getEndTime(data.start_time);

      // Insert appointment
      const insertAppointment = `
        INSERT INTO appointments (
          client_id, client_name, client_phone, client_email,
          appointment_date, start_time, end_time, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled')
        RETURNING *
      `;

      const appointmentResult = await client.query(insertAppointment, [
        data.client_id || null,
        data.client_name || null,
        data.client_phone || null,
        data.client_email || null,
        data.appointment_date,
        data.start_time,
        endTime
      ]);

      const appointment = appointmentResult.rows[0];

      // Insert appointment items
      for (const item of data.items) {
        await client.query(
          `INSERT INTO appointment_items (appointment_id, subcategory_id, quantity, is_excellent_quality)
           VALUES ($1, $2, $3, $4)`,
          [appointment.id, item.subcategory_id, item.quantity, item.is_excellent_quality]
        );
      }

      await client.query('COMMIT');

      // Return the complete appointment
      return await this.getAppointmentById(appointment.id) as Appointment;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating appointment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get appointment by ID
  async getAppointmentById(id: number): Promise<Appointment | null> {
    const appointmentQuery = `
      SELECT
        a.*,
        c.name as registered_client_name,
        c.phone as registered_client_phone,
        c.email as registered_client_email
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.id = $1
    `;

    const itemsQuery = `
      SELECT
        ai.id,
        ai.subcategory_id,
        s.name as subcategory_name,
        cat.name as category_name,
        s.is_clothing,
        ai.quantity,
        ai.is_excellent_quality
      FROM appointment_items ai
      JOIN subcategories s ON ai.subcategory_id = s.id
      JOIN categories cat ON s.category_id = cat.id
      WHERE ai.appointment_id = $1
    `;

    try {
      const [appointmentResult, itemsResult] = await Promise.all([
        pool.query(appointmentQuery, [id]),
        pool.query(itemsQuery, [id])
      ]);

      if (appointmentResult.rows.length === 0) {
        return null;
      }

      const row = appointmentResult.rows[0];

      return {
        id: row.id,
        client_id: row.client_id,
        client_name: row.client_name || row.registered_client_name,
        client_phone: row.client_phone || row.registered_client_phone,
        client_email: row.client_email || row.registered_client_email,
        appointment_date: row.appointment_date.toISOString().split('T')[0],
        start_time: row.start_time.substring(0, 5),
        end_time: row.end_time.substring(0, 5),
        status: row.status,
        notes: row.notes,
        cancelled_by: row.cancelled_by,
        cancelled_at: row.cancelled_at,
        cancellation_reason: row.cancellation_reason,
        created_at: row.created_at,
        updated_at: row.updated_at,
        items: itemsResult.rows.map(item => ({
          id: item.id,
          subcategory_id: item.subcategory_id,
          subcategory_name: item.subcategory_name,
          category_name: item.category_name,
          is_clothing: item.is_clothing || false,
          quantity: item.quantity,
          is_excellent_quality: item.is_excellent_quality
        })),
        total_items: itemsResult.rows.reduce((sum, item) => sum + item.quantity, 0)
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw new Error('Error al obtener cita');
    }
  }

  // Get appointments for admin with filters and pagination
  async getAppointmentsAdmin(offset: number, limit: number, filters: AppointmentFilters) {
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (filters.date_from) {
      whereConditions.push(`a.appointment_date >= $${paramIndex}`);
      queryParams.push(filters.date_from);
      paramIndex++;
    }

    if (filters.date_to) {
      whereConditions.push(`a.appointment_date <= $${paramIndex}`);
      queryParams.push(filters.date_to);
      paramIndex++;
    }

    if (filters.status && filters.status !== 'all') {
      whereConditions.push(`a.status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM appointments a
      ${whereClause}
    `;

    const dataQuery = `
      SELECT
        a.*,
        c.name as registered_client_name,
        c.phone as registered_client_phone,
        c.email as registered_client_email,
        (SELECT SUM(quantity) FROM appointment_items WHERE appointment_id = a.id) as total_items
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    try {
      const [countResult, dataResult] = await Promise.all([
        pool.query(countQuery, queryParams.slice(0, -2)),
        pool.query(dataQuery, queryParams)
      ]);

      const total = parseInt(countResult.rows[0].total);

      const appointments: Appointment[] = dataResult.rows.map(row => ({
        id: row.id,
        client_id: row.client_id,
        client_name: row.client_name || row.registered_client_name,
        client_phone: row.client_phone || row.registered_client_phone,
        client_email: row.client_email || row.registered_client_email,
        appointment_date: row.appointment_date.toISOString().split('T')[0],
        start_time: row.start_time.substring(0, 5),
        end_time: row.end_time.substring(0, 5),
        status: row.status,
        notes: row.notes,
        cancelled_by: row.cancelled_by,
        cancelled_at: row.cancelled_at,
        cancellation_reason: row.cancellation_reason,
        created_at: row.created_at,
        updated_at: row.updated_at,
        total_items: parseInt(row.total_items || 0)
      }));

      return { appointments, total };
    } catch (error) {
      console.error('Error fetching appointments for admin:', error);
      throw new Error('Error al obtener citas');
    }
  }

  // Cancel appointment
  async cancelAppointment(id: number, userId: number, reason: string): Promise<Appointment | null> {
    const query = `
      UPDATE appointments
      SET
        status = 'cancelled',
        cancelled_by = $2,
        cancelled_at = NOW(),
        cancellation_reason = $3,
        updated_at = NOW()
      WHERE id = $1 AND status = 'scheduled'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id, userId, reason]);

      if (result.rows.length === 0) {
        return null;
      }

      return await this.getAppointmentById(id);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error('Error al cancelar cita');
    }
  }

  // Update appointment status
  async updateAppointmentStatus(id: number, status: string, notes?: string): Promise<Appointment | null> {
    if (!['completed', 'no_show'].includes(status)) {
      throw new Error('Estado no válido');
    }

    const query = `
      UPDATE appointments
      SET
        status = $2,
        notes = COALESCE($3, notes),
        updated_at = NOW()
      WHERE id = $1 AND status = 'scheduled'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id, status, notes]);

      if (result.rows.length === 0) {
        return null;
      }

      return await this.getAppointmentById(id);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw new Error('Error al actualizar estado de cita');
    }
  }

  // Toggle subcategory purchasing status
  async toggleSubcategoryPurchasing(subcategoryId: number): Promise<{ id: number; purchasing_enabled: boolean }> {
    const query = `
      UPDATE subcategories
      SET
        purchasing_enabled = NOT COALESCE(purchasing_enabled, TRUE),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, purchasing_enabled
    `;

    try {
      const result = await pool.query(query, [subcategoryId]);

      if (result.rows.length === 0) {
        throw new Error('Subcategoría no encontrada');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error toggling subcategory purchasing:', error);
      throw error;
    }
  }

  // Get subcategories with purchasing status for admin
  async getSubcategoriesAdmin(): Promise<SubcategoryForBooking[]> {
    return this.getBookingSubcategories();
  }

  // Get appointment stats
  async getAppointmentStats() {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show,
        COUNT(CASE WHEN status = 'scheduled' AND appointment_date = CURRENT_DATE THEN 1 END) as today,
        COUNT(CASE WHEN status = 'scheduled' AND appointment_date > CURRENT_DATE AND appointment_date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as this_week
      FROM appointments
    `;

    try {
      const result = await pool.query(query);
      const row = result.rows[0];

      return {
        total: parseInt(row.total || 0),
        scheduled: parseInt(row.scheduled || 0),
        completed: parseInt(row.completed || 0),
        cancelled: parseInt(row.cancelled || 0),
        no_show: parseInt(row.no_show || 0),
        today: parseInt(row.today || 0),
        this_week: parseInt(row.this_week || 0)
      };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  // Get admin note for public display
  async getAdminNote(): Promise<string> {
    const query = `
      SELECT setting_value
      FROM appointment_settings
      WHERE setting_key = 'admin_note'
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0]?.setting_value || '';
    } catch (error) {
      console.error('Error fetching admin note:', error);
      return '';
    }
  }

  // Update admin note (admin only)
  async updateAdminNote(note: string, userId: number): Promise<{ success: boolean; note: string }> {
    const query = `
      INSERT INTO appointment_settings (setting_key, setting_value, updated_by, updated_at)
      VALUES ('admin_note', $1, $2, NOW())
      ON CONFLICT (setting_key) DO UPDATE
      SET setting_value = $1, updated_by = $2, updated_at = NOW()
      RETURNING setting_value
    `;

    try {
      const result = await pool.query(query, [note, userId]);
      return {
        success: true,
        note: result.rows[0].setting_value
      };
    } catch (error) {
      console.error('Error updating admin note:', error);
      throw new Error('Error al actualizar la nota');
    }
  }
}

export const appointmentService = new AppointmentService();
