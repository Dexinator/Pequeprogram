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
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-r from-brand-rosa/10 to-brand-amarillo/10 dark:from-brand-rosa/5 dark:to-brand-amarillo/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-azul-profundo dark:text-brand-azul-light mb-8 flex items-center justify-center">
            <span className="bg-brand-amarillo text-gray-900 rounded-full w-12 h-12 flex items-center justify-center mr-4 text-2xl">🌟</span>
            Lo que dicen nuestros clientes
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
            Miles de familias felices confían en Entrepeques
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border-l-4 border-brand-rosa"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-rosa/20 to-brand-amarillo/20 dark:from-brand-rosa/10 dark:to-brand-amarillo/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-brand-azul dark:text-brand-azul-light">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
          <div className="inline-flex flex-wrap items-center gap-8 bg-white dark:bg-gray-800 px-12 py-6 rounded-3xl shadow-xl">
            <div className="text-center">
              <p className="font-display text-4xl text-brand-verde-lima">2,500+</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Familias felices</p>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
            <div className="text-center">
              <p className="font-display text-4xl text-brand-rosa">15,000+</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Productos vendidos</p>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
            <div className="text-center">
              <p className="font-display text-4xl text-brand-amarillo-dark dark:text-brand-amarillo">4.9/5</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Calificación</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;