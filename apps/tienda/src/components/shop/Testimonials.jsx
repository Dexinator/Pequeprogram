import React from 'react';

function Testimonials() {
  const testimonials = [
    {
      name: 'María González',
      role: 'Mamá de 2 niños',
      content: 'Encontré una carriola Chicco en perfecto estado a menos de la mitad del precio. ¡Estoy encantada con la calidad y el servicio!',
      rating: 5,
      avatar: '👩'
    },
    {
      name: 'Carlos Ramírez',
      role: 'Papá primerizo',
      content: 'Vendí toda la ropa que ya no le quedaba a mi bebé y con el crédito compré artículos para su nueva etapa. Excelente sistema.',
      rating: 5,
      avatar: '👨'
    },
    {
      name: 'Ana Martínez',
      role: 'Mamá de 3 niños',
      content: 'La mejor opción para familias numerosas. Productos de marca a precios accesibles y siempre en excelente estado.',
      rating: 5,
      avatar: '👩‍🦱'
    },
    {
      name: 'Roberto López',
      role: 'Abuelo feliz',
      content: 'Compré juguetes educativos para mis nietos. Me encanta que sean productos reutilizados, enseñamos valores desde pequeños.',
      rating: 5,
      avatar: '👴'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-azul dark:text-brand-azul-light mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="font-body text-lg text-gray-600 dark:text-gray-400">
            Miles de familias felices confían en Entrepeques
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-brand-rosa/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-gray-900 dark:text-gray-100">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-brand-amarillo text-lg">⭐</span>
                ))}
              </div>
              
              <p className="font-body text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-6 bg-brand-verde-lima/10 dark:bg-brand-verde-lima/5 px-8 py-4 rounded-full">
            <div className="text-center">
              <p className="font-display text-3xl text-brand-verde-lima">2,500+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Familias felices</p>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <p className="font-display text-3xl text-brand-verde-lima">15,000+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Productos vendidos</p>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <p className="font-display text-3xl text-brand-verde-lima">4.9/5</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Calificación</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;