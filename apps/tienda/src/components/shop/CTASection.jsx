import React from 'react';

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-brand-rosa via-brand-rosa to-brand-amarillo relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full transform -translate-x-20 -translate-y-20"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full transform translate-x-20 translate-y-20"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
          ¿Tienes artículos infantiles sin usar?
        </h2>
        <p className="font-body text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
          Convierte esos productos que ya no necesitas en dinero o crédito para comprar lo que tu pequeño necesita ahora. 
          ¡Es fácil, rápido y ayudas a otras familias!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <a 
            href="/vender" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-rosa hover:bg-gray-100 font-heading font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            <span className="mr-2">🚀</span>
            Quiero vender ahora
          </a>
          <a 
            href="/como-funciona" 
            className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-rosa font-heading font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            <span className="mr-2">📖</span>
            ¿Cómo funciona?
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <span className="text-4xl mb-3 block">📸</span>
              <h3 className="font-heading text-xl font-bold mb-2">1. Trae tus artículos</h3>
              <p className="text-white/80">Visítanos con los productos que quieres vender</p>
            </div>
          </div>
          <div className="text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <span className="text-4xl mb-3 block">💎</span>
              <h3 className="font-heading text-xl font-bold mb-2">2. Valuación justa</h3>
              <p className="text-white/80">Nuestros expertos evalúan y te ofrecen el mejor precio</p>
            </div>
          </div>
          <div className="text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <span className="text-4xl mb-3 block">💰</span>
              <h3 className="font-heading text-xl font-bold mb-2">3. Recibe tu pago</h3>
              <p className="text-white/80">Efectivo al instante o crédito con 10% extra</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;