import React from 'react';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-azul/10 via-brand-verde-lima/5 to-brand-rosa/10 dark:from-brand-azul/5 dark:via-brand-verde-lima/3 dark:to-brand-rosa/5 py-16 lg:py-20">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-rosa/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-azul/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-brand-rosa mb-6 animate-float">
              Entrepeques
            </h1>
            <p className="font-heading text-2xl md:text-3xl text-brand-azul dark:text-brand-azul-light mb-4">
              Todo para tus pequeños, al mejor precio
            </p>
            <p className="font-body text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Encuentra artículos de segunda mano en excelente estado. 
              Ropa, juguetes, cunas, carriolas y mucho más. ¡Dale una segunda vida a productos de calidad!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/productos" className="inline-flex items-center justify-center px-8 py-4 bg-brand-azul hover:bg-brand-azul-profundo text-white font-heading font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                <span className="mr-2">🛍️</span>
                Ver productos
              </a>
              <a href="/vender" className="inline-flex items-center justify-center px-8 py-4 bg-brand-verde-lima hover:bg-brand-verde-oscuro text-white font-heading font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                <span className="mr-2">💰</span>
                Quiero vender
              </a>
            </div>
            
            {/* Value props */}
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <span className="text-xl">♻️</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Ecológico</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <span className="text-xl">💸</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Ahorra hasta 70%</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <span className="text-xl">✅</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Calidad verificada</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block relative">
            <div className="relative">
              {/* Placeholder for image - will be replaced with actual image */}
              <div className="bg-gradient-to-br from-brand-rosa/20 to-brand-amarillo/20 rounded-3xl p-12 text-center">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                    <span className="text-6xl">👶</span>
                    <p className="mt-2 font-heading text-brand-azul font-semibold">Productos para bebé</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                    <span className="text-6xl">🧸</span>
                    <p className="mt-2 font-heading text-brand-rosa font-semibold">Juguetes educativos</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transform rotate-2 hover:rotate-0 transition-transform">
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