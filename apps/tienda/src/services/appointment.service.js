// Appointment service for Tienda app
import { fetchApi } from './api';

export const appointmentService = {
  // Get subcategories with purchasing status for booking
  async getSubcategories() {
    const response = await fetchApi('/appointments/subcategories');
    return response.data || [];
  },

  // Get available time slots for a date (format: YYYY-MM-DD)
  async getSlots(date) {
    const response = await fetchApi(`/appointments/slots/${date}`);
    return response.data || [];
  },

  // Get dates with available slots
  async getAvailableDates(weeksAhead = 12) {
    const response = await fetchApi(`/appointments/available-dates?weeks_ahead=${weeksAhead}`);
    return response.data || [];
  },

  // Search clients by phone (returns minimal data: id and name)
  async searchClients(phone) {
    if (!phone || phone.length < 3) return [];
    const response = await fetchApi(`/appointments/clients/search?phone=${encodeURIComponent(phone)}`);
    return response.data || [];
  },

  // Create appointment
  async createAppointment(data) {
    const payload = {
      client_id: data.clientType === 'existing' ? data.clientId : null,
      client_name: data.clientType === 'new' ? data.clientName : undefined,
      client_phone: data.clientType === 'new' ? data.clientPhone : undefined,
      client_email: data.clientType === 'new' ? data.clientEmail : undefined,
      appointment_date: data.selectedDate,
      start_time: data.selectedTime,
      items: data.items.map(item => ({
        subcategory_id: item.subcategory.id,
        quantity: item.quantity,
        is_excellent_quality: item.isExcellent
      }))
    };

    return fetchApi('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // ========== ADMIN ENDPOINTS ==========

  // Get appointments with filters (requires auth)
  async getAppointmentsAdmin(params = {}) {
    const token = localStorage.getItem('entrepeques_auth_token');
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/appointments/admin${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get appointment stats (requires auth)
  async getAppointmentStats() {
    const token = localStorage.getItem('entrepeques_auth_token');
    return fetchApi('/appointments/admin/stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get appointment details (requires auth)
  async getAppointmentDetail(id) {
    const token = localStorage.getItem('entrepeques_auth_token');
    return fetchApi(`/appointments/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Cancel appointment (requires auth)
  async cancelAppointment(id, reason) {
    const token = localStorage.getItem('entrepeques_auth_token');
    return fetchApi(`/appointments/admin/${id}/cancel`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
  },

  // Update appointment status (requires auth)
  async updateAppointmentStatus(id, status, notes) {
    const token = localStorage.getItem('entrepeques_auth_token');
    return fetchApi(`/appointments/admin/${id}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status, notes })
    });
  },

  // Get subcategories for admin (requires auth)
  async getSubcategoriesAdmin() {
    const token = localStorage.getItem('entrepeques_auth_token');
    return fetchApi('/appointments/admin/subcategories', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Toggle subcategory purchasing status (requires auth)
  async toggleSubcategoryPurchasing(id) {
    const token = localStorage.getItem('entrepeques_auth_token');
    return fetchApi(`/appointments/admin/subcategories/${id}/toggle`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get admin note (public)
  async getAdminNote() {
    const response = await fetchApi('/appointments/admin-note');
    return response.data?.note || '';
  },

  // Update admin note (requires auth)
  async updateAdminNote(note) {
    const token = localStorage.getItem('entrepeques_auth_token');
    return fetchApi('/appointments/admin/note', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ note })
    });
  }
};
