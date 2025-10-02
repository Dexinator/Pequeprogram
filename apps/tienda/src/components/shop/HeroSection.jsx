import React from 'react';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-azul/10 to-brand-verde-lima/10 dark:from-brand-azul/5 dark:to-brand-verde-lima/5 py-16 md:py-20 lg:py-24">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-rosa/10 dark:bg-brand-rosa/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-azul/10 dark:bg-brand-azul/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-brand-rosa mb-8 tracking-tight animate-float">
              Entrepeques
            </h1>
            <p className="font-heading text-2xl md:text-3xl font-bold text-brand-azul dark:text-brand-azul-light mb-4">
              Reutiliza, Recupera y Ahorra
            </p>
            <p className="font-body text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl">
Dale una segunda vida a lo que usaron poco los peques, ahorra y súmate a la conservación del medio ambiente. Compra en línea y también compra, vende e intercambia en nuestra sucursal CDMX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/productos" className="inline-flex items-center justify-center px-8 py-4 bg-brand-azul hover:bg-brand-azul-profundo text-white font-heading font-semibold rounded-lg shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                <span className="mr-2">🛍️</span>
                Ver productos
              </a>
              <a href="#tienes-articulos" className="inline-flex items-center justify-center px-8 py-4 bg-brand-verde-lima hover:bg-brand-verde-oscuro text-white font-heading font-semibold rounded-lg shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                <span className="mr-2">💰</span>
                Quiero vender
              </a>
            </div>
            
            {/* Value props */}
            <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
              <a href="#renta" className="px-4 py-2 bg-brand-amarillo text-gray-900 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all cursor-pointer">♻️ Renta</a>
              <a href="#mesa-regalos" className="px-4 py-2 bg-brand-amarillo text-gray-900 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all cursor-pointer">💸 Mesa de regalos</a>
              <a href="#tienda" className="px-4 py-2 bg-brand-amarillo text-gray-900 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all cursor-pointer">✅ Tienda (Ven y conócenos)</a>
            </div>
          </div>
          
          <div className="hidden md:block relative">
            <div className="relative">
              {/* Placeholder for image - will be replaced with actual image */}
              <div className="bg-gradient-to-br from-brand-rosa/20 to-brand-amarillo/20 dark:from-brand-rosa/10 dark:to-brand-amarillo/10 rounded-3xl p-12 text-center">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform rotate-3 hover:rotate-0 transition-all">
                    <span className="text-6xl">👶</span>
                    <p className="mt-2 font-heading text-brand-azul font-semibold">Productos para bebé</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform -rotate-3 hover:rotate-0 transition-all">
                    <span className="text-6xl">🧸</span>
                    <p className="mt-2 font-heading text-brand-rosa font-semibold">Juguetes educativos</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transform rotate-2 hover:rotate-0 transition-all">
                    <span className="text-6xl">👕</span>
                    <p className="mt-2 font-heading text-brand-verde-lima font-semibold">Ropa de calidad</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-8 -right-8 bg-brand-amarillo text-gray-900 p-4 rounded-2xl shadow-xl animate-float">
              <span className="text-3xl">🌟</span>
            </div>
            <div className="absolute -bottom-8 -left-8 bg-brand-rosa text-white p-4 rounded-2xl shadow-xl animate-float" style={{animationDelay: '1s'}}>
              <span className="text-3xl">💚</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;