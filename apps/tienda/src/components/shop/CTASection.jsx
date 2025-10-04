import React, { useState } from 'react';
import VideoModal from './VideoModal';

function CTASection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section id="tienes-articulos" className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-brand-rosa/10 to-brand-amarillo/10 dark:from-brand-rosa/5 dark:to-brand-amarillo/5 relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-40 h-40 bg-brand-rosa/10 dark:bg-brand-rosa/5 rounded-full blur-3xl transform -translate-x-20 -translate-y-20"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-brand-amarillo/10 dark:bg-brand-amarillo/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-brand-verde-lima/10 dark:bg-brand-verde-lima/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-azul/10 dark:bg-brand-azul/5 rounded-full blur-3xl transform translate-x-20 translate-y-20"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="font-display text-6xl md:text-7xl lg:text-8xl text-brand-rosa mb-8 tracking-tight animate-float">
          ¿Tienes artículos infantiles sin usar?
        </h2>
        <p className="font-body text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          Convierte esos productos que ya no necesitas en dinero o crédito para comprar lo que tu pequeño necesita ahora. 
          ¡Es fácil, rápido y ayudas a otras familias!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <a 
            href="https://citas.entrepeques.mx/" 
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-rosa hover:bg-brand-rosa-dark text-white font-heading font-semibold rounded-lg shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            <span className="mr-2">🚀</span>
            Quiero vender ahora
          </a>
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-brand-rosa text-brand-rosa hover:bg-brand-rosa hover:text-white font-heading font-semibold rounded-lg transition-all"
          >
            <span className="mr-2">📖</span>
            ¿Cómo funciona?
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-rosa/20 dark:bg-brand-rosa/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-brand-azul dark:text-brand-azul-light mb-2">1. Trae tus artículos</h3>
            <p className="text-gray-600 dark:text-gray-400">Visítanos con los productos que quieres vender o intercambiar en los días y horarios asignados.</p>
          </div>
          <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-amarillo/20 dark:bg-brand-amarillo/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-3xl">💎</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-brand-azul dark:text-brand-azul-light mb-2">2. Valuación justa</h3>
            <p className="text-gray-600 dark:text-gray-400">Nuestros expertos evalúan y te ofrecen precios justos</p>
          </div>
          <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-verde-lima/20 dark:bg-brand-verde-lima/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-brand-azul dark:text-brand-azul-light mb-2">3. Recibe tu pago</h3>
            <p className="text-gray-600 dark:text-gray-400">Efectivo al instante o crédito con 20% extra</p>
          </div>
        </div>
      </div>

      {/* Modal de Video */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId="tw2yvkna2ww"
        title="¿Cómo funciona Entrepeques?"
      />
    </section>
  );
}

export default CTASection;