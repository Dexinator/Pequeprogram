import React from 'react';

const ConfirmationStep = ({ wizardData, onConfirm, onBack, submitting }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-MX', options);
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const totalItems = wizardData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Confirmation header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-pink-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Confirma tu cita
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Revisa los detalles antes de confirmar
        </p>
      </div>

      {/* Appointment details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Date and time */}
        <div className="p-6 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Fecha de tu cita</p>
              <p className="text-xl font-bold capitalize">
                {formatDate(wizardData.selectedDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Horario</p>
              <p className="text-xl font-bold">
                {formatTime(wizardData.selectedTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Client info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
            Datos del cliente
          </h3>
          <div className="space-y-2">
            <p className="text-gray-800 dark:text-gray-200">
              <span className="font-medium">Nombre:</span> {wizardData.clientName}
            </p>
            {wizardData.clientType === 'new' && (
              <>
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="font-medium">Telefono:</span> {wizardData.clientPhone}
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="font-medium">Email:</span> {wizardData.clientEmail}
                </p>
              </>
            )}
            {wizardData.clientType === 'existing' && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Cliente registrado
              </p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">
            Articulos a valuar ({totalItems} en total)
          </h3>
          <div className="space-y-3">
            {wizardData.items.map((item, index) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {item.subcategory?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.subcategory?.category_name}
                    {item.subcategory?.is_clothing && ' (Ropa)'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                    {item.quantity} {item.quantity === 1 ? 'articulo' : 'articulos'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important notes */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Importante
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Por favor llega puntual a tu cita</li>
          <li>• Trae todos los articulos que indicaste</li>
          <li>• Asegurate de que esten limpios y en buen estado</li>
          <li>• La valuacion tomara aproximadamente 45 minutos</li>
        </ul>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          Atras
        </button>
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="flex-1 py-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Confirmando...
            </>
          ) : (
            'Confirmar Cita'
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
