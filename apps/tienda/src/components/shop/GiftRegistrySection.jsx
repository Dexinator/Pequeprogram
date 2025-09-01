import React from 'react';

const GiftRegistrySection = () => {
  const features = [
    {
      icon: '📝',
      title: "Lista Personalizada",
      description: "Crea tu lista con exactamente lo que necesitas para tu bebé"
    },
    {
      icon: '🎁',
      title: "Regalos Útiles",
      description: "Tus invitados sabrán qué regalarte y evitarán duplicados"
    },
    {
      icon: '💳',
      title: "Compra Fácil",
      description: "Los invitados pueden comprar en línea o en tienda"
    },
    {
      icon: '🚚',
      title: "Entrega Flexible",
      description: "Recoge todo después del evento o recibe en tu domicilio"
    }
  ];

  const occasions = [
    "Baby Shower",
    "Bautizo",
    "Primer Añito",
    "Cumpleaños",
    "Navidad",
    "Llegada del Bebé"
  ];

  const steps = [
    { number: "1", text: "Visítanos o contáctanos para crear tu mesa" },
    { number: "2", text: "Elige los artículos que te gustaría recibir" },
    { number: "3", text: "Comparte tu código con los invitados" },
    { number: "4", text: "¡Recibe exactamente lo que necesitas!" }
  ];

  return (
    <section id="mesa-regalos" className="py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-azul dark:text-brand-azul-light mb-8 flex items-center justify-center">
            <span className="bg-brand-azul text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 text-2xl">🎁</span>
            Mesa de Regalos
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
            ¿Tienes una celebración próxima? Crea tu mesa de regalos con nosotros y 
            recibe exactamente lo que tu bebé necesita. Tus invitados te lo agradecerán.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left Side - How it Works */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl">
            <h3 className="font-heading text-2xl font-bold text-brand-verde-lima mb-6">
              ¿Cómo funciona?
            </h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-rosa/20 dark:bg-brand-rosa/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-brand-rosa font-bold text-sm">{step.number}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">{step.text}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-brand-amarillo/10 dark:bg-brand-amarillo/5 rounded-lg border border-brand-amarillo/30">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">💡 Tip:</span> Puedes combinar artículos nuevos 
                y de segunda mano en tu mesa de regalos para maximizar tu presupuesto.
              </p>
            </div>
          </div>

          {/* Right Side - Perfect For */}
          <div className="bg-gradient-to-br from-brand-rosa/10 to-brand-azul/10 dark:from-brand-rosa/5 dark:to-brand-azul/5 rounded-3xl p-8">
            <h3 className="font-heading text-2xl font-bold text-brand-azul dark:text-brand-azul-light mb-6">
              Perfecto para:
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {occasions.map((occasion, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 flex items-center shadow-md">
                  <span className="text-xl mr-2">🎉</span>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">{occasion}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="font-heading font-bold text-brand-verde-lima mb-3">Ventajas especiales:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-brand-verde-lima mr-2">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sin costo de registro</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-verde-lima mr-2">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Descuentos especiales para el festejado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-verde-lima mr-2">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Opción de cambios después del evento</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-verde-lima mr-2">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Lista disponible en línea y en tienda</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h4 className="font-heading font-bold text-brand-azul dark:text-brand-azul-light mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-rosa to-brand-azul rounded-3xl p-8 text-center text-white shadow-xl">
          <h3 className="font-display text-3xl mb-4">
            ¡Crea tu mesa de regalos hoy!
          </h3>
          <p className="font-body text-lg mb-6 max-w-4xl mx-auto">
            Agenda una cita con nosotros para crear tu lista personalizada. 
            También puedes visitarnos en tienda para ver todos los productos disponibles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/contacto'}
              className="bg-white text-brand-rosa px-8 py-3 rounded-lg font-heading font-semibold hover:bg-gray-100 shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all inline-flex items-center justify-center"
            >
              Agenda tu cita
              <span className="ml-2">→</span>
            </button>
            <a 
              href="https://wa.me/526641234567?text=Hola,%20me%20interesa%20crear%20una%20mesa%20de%20regalos" 
              className="bg-brand-verde-lima hover:bg-brand-verde-oscuro text-white px-8 py-3 rounded-lg font-heading font-semibold shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all inline-flex items-center justify-center"
            >
              <span className="mr-2">💬</span>
              Pregunta por WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Servicio disponible en tienda física y próximamente en línea
          </p>
        </div>
      </div>
    </section>
  );
};

export default GiftRegistrySection;