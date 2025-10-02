import React from 'react';

const RentalSection = () => {
  const benefits = [
    {
      icon: '📅',
      title: "Renta por días",
      description: "Desde 1 día hasta 45 días"
    },
    {
      icon: '💰',
      title: "Ahorra dinero",
      description: "No compres lo que solo usarás temporalmente"
    },
    {
      icon: '✅',
      title: "Productos de calidad",
      description: "Todos nuestros artículos están sanitizados y revisados para asegurar su correcto funcionamiento"
    },
    {
      icon: '✈️',
      title: "Ideal para viajeros",
      description: "Familias que están de visita o que desean probar antes de comprar"
    }
  ];

  const popularItems = [
    "Carriolas",
    "Autoasientos",
    "algún otro artíuclo"
  ];

  return (
    <section id="renta" className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-brand-rosa/10 to-brand-azul/10 dark:from-brand-rosa/5 dark:to-brand-azul/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-azul dark:text-brand-azul-light mb-8 flex items-center justify-center">
            <span className="bg-brand-rosa text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 text-2xl">📅</span>
            ¡También Rentamos!
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
            ¿Necesitas algo por unos días? Renta cualquier artículo de nuestra tienda. 
            Ideal para familias que están de visita o para probar antes de comprar.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 bg-brand-azul/20 dark:bg-brand-azul/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{benefit.icon}</span>
                </div>
                <h3 className="font-heading text-lg font-bold text-brand-azul dark:text-brand-azul-light mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Items */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-heading text-2xl font-bold text-brand-verde-lima mb-4">
                Artículos más rentados
              </h3>
              <p className="font-body text-gray-600 dark:text-gray-400 mb-6">
                Estos son algunos de los productos que más rentan nuestros clientes, 
                especialmente familias que vienen de visita por unos días.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {popularItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-brand-verde-lima mr-2 flex-shrink-0">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-brand-rosa/20 to-brand-azul/20 dark:from-brand-rosa/10 dark:to-brand-azul/10 rounded-2xl p-8 text-center">
              <div className="mb-4">
                <span className="text-5xl">🍼</span>
              </div>
              <h4 className="font-heading text-xl font-bold text-brand-azul dark:text-brand-azul-light mb-2">
                ¿Cómo funciona?
              </h4>
              <p className="font-body text-gray-700 dark:text-gray-300 mb-6">
                1. Elige el producto que necesitas<br/>
                2. Dinos por cuántos días lo requieres<br/>
                3. Recoge en tienda o solicita entrega<br/>
                4. ¡Disfruta sin complicaciones!
              </p>
              <button 
                className="bg-brand-rosa hover:bg-brand-rosa-dark text-white px-6 py-3 rounded-lg font-heading font-semibold shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all inline-flex items-center"
                onClick={() => window.location.href = '/contacto'}
              >
                Pregunta por disponibilidad
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="font-body text-gray-600 dark:text-gray-400 mb-4">
            Tenemos cientos de artículos disponibles para renta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+526641234567" 
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-brand-rosa text-brand-rosa hover:bg-brand-rosa hover:text-white rounded-lg font-heading font-semibold transition-all"
            >
              <span className="mr-2">📞</span>
              Llámanos
            </a>
            <a 
              href="https://wa.me/525523632389?text=Hola,%20me%20interesa%20rentar%20un%20artículo" 
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-verde-lima hover:bg-brand-verde-oscuro text-white rounded-lg font-heading font-semibold shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              <span className="mr-2">💬</span>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentalSection;