import React, { useState, useEffect } from 'react';
import { storeService } from '../../services/api';

const ThankYouStep = ({ appointment }) => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestedProducts();
  }, []);

  const loadSuggestedProducts = async () => {
    try {
      const response = await storeService.getProducts({ limit: 4 });
      setSuggestedProducts(response.data || []);
    } catch (err) {
      console.error('Error loading suggested products:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Success message */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 animate-bounce">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          ¡Cita confirmada!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Te esperamos en Entrepeques
        </p>
      </div>

      {/* Appointment details card */}
      {appointment && (
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-pink-100 text-sm">Tu cita</p>
              <p className="text-2xl font-bold capitalize">
                {formatDate(appointment.appointment_date)}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-xl font-bold">
                {formatTime(appointment.start_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center text-pink-100">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Entrepeques - Polanco</span>
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">
          Proximos pasos
        </h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
              1
            </div>
            <div className="ml-4">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Prepara tus articulos
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Asegurate de que esten limpios y en buen estado
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
              2
            </div>
            <div className="ml-4">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Llega a tiempo
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Tu cita tiene una duracion de 45 minutos
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
              3
            </div>
            <div className="ml-4">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Recibe tu valuacion
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Haremos una oferta por los articulos que seleccionemos.
              </p>
              <div className="mt-2 text-sm text-blue-600 dark:text-blue-300">
                <p className="font-medium mb-1">Nuestras formas de pago son:</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Efectivo</li>
                  <li>Un 20% extra al efectivo en credito para comprar en la tienda</li>
                  <li>Consignacion (se paga al venderse)</li>
                </ol>
                <p className="mt-1 text-xs opacity-80">
                  Se elige segun las necesidades del cliente y de la tienda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested products */}
      {suggestedProducts.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Mientras tanto, mira lo que tenemos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedProducts.map(product => (
              <a
                key={product.id}
                href={`/producto/${product.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.subcategory_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {product.subcategory_name}
                  </p>
                  <p className="text-pink-500 font-bold">
                    {formatPrice(product.online_price || product.final_sale_price)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Back to home button */}
      <div className="text-center">
        <a
          href="/"
          className="inline-block px-8 py-4 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default ThankYouStep;
