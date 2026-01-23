import React, { useState, useEffect } from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointment.service';
import OptionalAuthGuard from '../auth/OptionalAuthGuard';
import { EMPLOYEE_ROLES } from '../../config/routes.config';

// Componente interno con el contenido
const AppointmentAdminContent = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: ''
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // El OptionalAuthGuard ya verificó la autenticación antes de renderizar este componente
  useEffect(() => {
    loadData();
    loadAdminNote();
  }, [activeTab]);

  const loadAdminNote = async () => {
    try {
      const note = await appointmentService.getAdminNote();
      setAdminNote(note);
      setNoteText(note);
    } catch (err) {
      console.error('Error loading admin note:', err);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await appointmentService.updateAdminNote(noteText);
      setAdminNote(noteText);
      setEditingNote(false);
    } catch (err) {
      alert('Error al guardar la nota');
    } finally {
      setSavingNote(false);
    }
  };

  const handleCancelNoteEdit = () => {
    setNoteText(adminNote);
    setEditingNote(false);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'appointments') {
        const [appointmentsRes, statsRes] = await Promise.all([
          appointmentService.getAppointmentsAdmin(filters),
          appointmentService.getAppointmentStats()
        ]);
        setAppointments(appointmentsRes.data || []);
        setStats(statsRes.data);
      } else {
        const subcatsRes = await appointmentService.getSubcategoriesAdmin();
        setSubcategories(subcatsRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadData();
  };

  const handleToggleSubcategory = async (id) => {
    try {
      await appointmentService.toggleSubcategoryPurchasing(id);
      loadData();
    } catch (err) {
      alert('Error al actualizar subcategoria');
    }
  };

  const handleCancelAppointment = async (id) => {
    const reason = prompt('Motivo de la cancelacion:');
    if (!reason) return;

    try {
      await appointmentService.cancelAppointment(id, reason);
      loadData();
    } catch (err) {
      alert('Error al cancelar cita');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentService.updateAppointmentStatus(id, status);
      loadData();
      setShowDetailModal(false);
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const viewAppointmentDetail = async (id) => {
    try {
      const response = await appointmentService.getAppointmentDetail(id);
      setSelectedAppointment(response.data);
      setShowDetailModal(true);
    } catch (err) {
      alert('Error al cargar detalle');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      no_show: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    const labels = {
      scheduled: 'Programada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No asistio'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Group subcategories by category
  const groupedSubcategories = subcategories.reduce((acc, sub) => {
    const cat = sub.category_name;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sub);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Administrar Citas
      </h1>

      {/* Admin note section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Nota para clientes
          </h3>
          {!editingNote && (
            <button
              onClick={() => setEditingNote(true)}
              className="text-sm text-pink-500 hover:text-pink-600 font-medium"
            >
              Editar nota
            </button>
          )}
        </div>

        {editingNote ? (
          <div className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escribe una nota que aparecera en la pagina de citas para los clientes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelNoteEdit}
                disabled={savingNote}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              >
                {savingNote ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 dark:text-gray-300">
            {adminNote ? (
              <p className="whitespace-pre-wrap">{adminNote}</p>
            ) : (
              <p className="text-gray-400 italic">No hay nota configurada. Haz clic en "Editar nota" para agregar una.</p>
            )}
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Esta nota aparecera visible para todos los clientes en la pagina de agendar citas.
        </p>
      </div>

      {/* Stats cards */}
      {stats && activeTab === 'appointments' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-3xl font-bold text-blue-500">{stats.today}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hoy</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-3xl font-bold text-green-500">{stats.this_week}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Esta semana</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-3xl font-bold text-purple-500">{stats.scheduled}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Programadas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-3xl font-bold text-gray-500">{stats.completed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'appointments'
              ? 'border-b-2 border-pink-500 text-pink-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Citas Programadas
        </button>
        <button
          onClick={() => setActiveTab('subcategories')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'subcategories'
              ? 'border-b-2 border-pink-500 text-pink-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Subcategorias
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : activeTab === 'appointments' ? (
        /* Appointments list */
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  <option value="scheduled">Programada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="no_show">No asistio</option>
                </select>
              </div>
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Filtrar
              </button>
            </div>
          </div>

          {/* Appointments table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Hora
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Articulos
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No hay citas que mostrar
                      </td>
                    </tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {formatDate(apt.appointment_date)}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {formatTime(apt.start_time)}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {apt.client_name || `Cliente #${apt.client_id}`}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {apt.total_items} articulos
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(apt.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewAppointmentDetail(apt.id)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Ver
                            </button>
                            {apt.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Subcategories list */
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Habilita o deshabilita subcategorias para el sistema de citas.
            Las subcategorias deshabilitadas apareceran en gris para los clientes.
          </p>

          {Object.entries(groupedSubcategories).map(([category, subs]) => (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {subs.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center">
                      <span className={`text-gray-800 dark:text-gray-200 ${
                        !sub.purchasing_enabled ? 'opacity-50' : ''
                      }`}>
                        {sub.name}
                      </span>
                      {sub.is_clothing && (
                        <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                          Ropa
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleSubcategory(sub.id)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        sub.purchasing_enabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200'
                      }`}
                    >
                      {sub.purchasing_enabled ? 'Activo' : 'Deshabilitado'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Detalle de Cita
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {formatDate(selectedAppointment.appointment_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Hora</p>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {formatTime(selectedAppointment.start_time)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedAppointment.client_name}
                  </p>
                  {selectedAppointment.client_phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAppointment.client_phone}
                    </p>
                  )}
                  {selectedAppointment.client_email && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAppointment.client_email}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Articulos ({selectedAppointment.total_items})
                  </p>
                  <div className="space-y-2">
                    {selectedAppointment.items?.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {item.subcategory_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.category_name}
                          </p>
                        </div>
                        <span className="text-pink-500 font-medium">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                  {getStatusBadge(selectedAppointment.status)}
                </div>

                {selectedAppointment.status === 'scheduled' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Marcar Completada
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'no_show')}
                      className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      No Asistio
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente con guardia de autenticación
const AppointmentAdminWithAuth = () => {
  return (
    <OptionalAuthGuard requireAuth={true} allowedRoles={EMPLOYEE_ROLES}>
      <AppointmentAdminContent />
    </OptionalAuthGuard>
  );
};

// Componente principal que incluye el provider
const AppointmentAdmin = () => {
  return (
    <AuthProvider>
      <AppointmentAdminWithAuth />
    </AuthProvider>
  );
};

export default AppointmentAdmin;
