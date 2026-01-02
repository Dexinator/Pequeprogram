import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointment.service';

const DateTimeSelectionStep = ({ wizardData, onChange, onNext, onBack }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailableDates();
  }, []);

  useEffect(() => {
    if (wizardData.selectedDate) {
      loadSlots(wizardData.selectedDate);
    }
  }, [wizardData.selectedDate]);

  const loadAvailableDates = async () => {
    try {
      const dates = await appointmentService.getAvailableDates();
      setAvailableDates(dates);
    } catch (err) {
      setError('Error al cargar fechas disponibles');
    } finally {
      setLoadingDates(false);
    }
  };

  const loadSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const slotsData = await appointmentService.getSlots(date);
      setSlots(slotsData);
    } catch (err) {
      setError('Error al cargar horarios');
    } finally {
      setLoadingSlots(false);
    }
  };

  const searchClients = async (phone) => {
    if (phone.length < 3) {
      setClientResults([]);
      return;
    }
    setSearchingClients(true);
    try {
      const results = await appointmentService.searchClients(phone);
      setClientResults(results);
    } catch (err) {
      console.error('Error searching clients:', err);
    } finally {
      setSearchingClients(false);
    }
  };

  const handlePhoneSearch = (e) => {
    const phone = e.target.value;
    setSearchPhone(phone);
    searchClients(phone);
  };

  const selectClient = (client) => {
    onChange({
      clientId: client.id,
      clientName: client.name
    });
    setClientResults([]);
    setSearchPhone('');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-MX', options);
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isFormValid = () => {
    if (!wizardData.selectedDate || !wizardData.selectedTime) return false;
    if (wizardData.clientType === 'new') {
      return wizardData.clientName && wizardData.clientPhone;
    }
    return wizardData.clientId;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Date selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Selecciona una fecha
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Las citas estan disponibles los martes y jueves
        </p>

        {loadingDates ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableDates.slice(0, 12).map(date => (
              <button
                key={date}
                onClick={() => onChange({ selectedDate: date, selectedTime: null })}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  wizardData.selectedDate === date
                    ? 'bg-pink-500 border-pink-500 text-white'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-pink-400 text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="text-sm font-medium capitalize">
                  {formatDate(date).split(',')[0]}
                </div>
                <div className="text-xs opacity-80">
                  {formatDate(date).split(',')[1]}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time slot selection */}
      {wizardData.selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Selecciona un horario
          </h3>

          {loadingSlots ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Morning slots */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Manana
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {slots
                    .filter(s => parseInt(s.start.split(':')[0]) < 14)
                    .map(slot => (
                      <button
                        key={slot.start}
                        onClick={() =>
                          slot.is_available &&
                          onChange({ selectedTime: slot.start })
                        }
                        disabled={!slot.is_available}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          wizardData.selectedTime === slot.start
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : slot.is_available
                            ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-pink-400 text-gray-800 dark:text-gray-200'
                            : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {formatTime(slot.start)}
                        </div>
                        <div className="text-xs opacity-70">
                          {slot.is_available ? 'Disponible' : 'Ocupado'}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Afternoon slots */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Tarde
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {slots
                    .filter(s => parseInt(s.start.split(':')[0]) >= 14)
                    .map(slot => (
                      <button
                        key={slot.start}
                        onClick={() =>
                          slot.is_available &&
                          onChange({ selectedTime: slot.start })
                        }
                        disabled={!slot.is_available}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          wizardData.selectedTime === slot.start
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : slot.is_available
                            ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-pink-400 text-gray-800 dark:text-gray-200'
                            : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {formatTime(slot.start)}
                        </div>
                        <div className="text-xs opacity-70">
                          {slot.is_available ? 'Disponible' : 'Ocupado'}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Client information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Tus datos
        </h3>

        {/* Client type toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => onChange({ clientType: 'new', clientId: null })}
            className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
              wizardData.clientType === 'new'
                ? 'bg-pink-500 border-pink-500 text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-pink-400'
            }`}
          >
            Soy nuevo
          </button>
          <button
            onClick={() => onChange({ clientType: 'existing' })}
            className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
              wizardData.clientType === 'existing'
                ? 'bg-pink-500 border-pink-500 text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-pink-400'
            }`}
          >
            Ya soy cliente
          </button>
        </div>

        {wizardData.clientType === 'new' ? (
          /* New client form */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                value={wizardData.clientName}
                onChange={e => onChange({ clientName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Telefono *
              </label>
              <input
                type="tel"
                value={wizardData.clientPhone}
                onChange={e => onChange({ clientPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="55 1234 5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Correo electronico (opcional)
              </label>
              <input
                type="email"
                value={wizardData.clientEmail}
                onChange={e => onChange({ clientEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
          </div>
        ) : (
          /* Existing client search */
          <div className="space-y-4">
            {wizardData.clientId ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Cliente seleccionado
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    {wizardData.clientName}
                  </p>
                </div>
                <button
                  onClick={() => onChange({ clientId: null, clientName: '' })}
                  className="text-green-600 hover:text-green-800 dark:hover:text-green-200"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Busca por tu numero de telefono
                </label>
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={handlePhoneSearch}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Ingresa tu telefono"
                />
                {searchingClients && (
                  <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                )}
                {clientResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    {clientResults.map(client => (
                      <button
                        key={client.id}
                        onClick={() => selectClient(client)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 border-gray-200 dark:border-gray-600"
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {client.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchPhone.length >= 3 && clientResults.length === 0 && !searchingClients && (
                  <p className="text-sm text-gray-500 mt-2">
                    No encontramos tu telefono. Selecciona "Soy nuevo" para registrarte.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Atras
        </button>
        <button
          onClick={onNext}
          disabled={!isFormValid()}
          className="flex-1 py-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelectionStep;
