import React from 'react';

function WhyChooseUs() {
  const benefits = [
    {
      icon: '🌱',
      title: 'Consumo Responsable',
      description: 'Contribuye al cuidado del planeta dando una segunda vida a productos infantiles de calidad.',
      color: 'verde-lima'
    },
    {
      icon: '💸',
      title: 'Precios Increíbles',
      description: 'Ahorra hasta un 70% en productos de marca en excelente estado. Tu bolsillo te lo agradecerá.',
      color: 'azul'
    },
    {
      icon: '✨',
      title: 'Calidad Garantizada',
      description: 'Cada producto pasa por un riguroso proceso de selección y limpieza antes de llegar a ti. Garantía por 7 días, aplicamos cambios de mercancía y tallas.',
      color: 'rosa'
    },
    {
      icon: '🚚',
      title: 'Envío Seguro',
      description: 'Entrega a domicilio gratis en compras mayores a $895 en CDMX. Envíos a toda la república.',
      color: 'amarillo'
    },
    {
      icon: '🤝',
      title: 'Comunidad Solidaria',
      description: 'Comprometidos con el ahorro y el consumo sostenible y solidarios con la comunidad. Realizamos donaciones a asociaciones de beneficencia y personas vulnerables.',
      color: 'verde-lima'
    },
    {
      icon: '💳',
      title: 'Pagos Flexibles',
      description: 'Aceptamos efectivo, transferencias, tarjetas bancarias y productos a cambio (previa selección). También comprar a plazos, compra ahora y paga después.',
      color: 'azul'
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-azul dark:text-brand-azul-light mb-8 flex items-center justify-center">
            <span className="bg-brand-verde-lima text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 text-2xl">💚</span>
            ¿Por qué elegir Entrepeques?
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
            Somos más que una tienda, somos una comunidad que apoya el consumo inteligente y sostenible. Cumplimos 11 años siendo líderes en ofrecer productos muy bien cuidados a bajo precio.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const bgColorClass = {
              'verde-lima': 'bg-brand-verde-lima',
              'azul': 'bg-brand-azul', 
              'rosa': 'bg-brand-rosa',
              'amarillo': 'bg-brand-amarillo'
            }[benefit.color] || 'bg-brand-azul';
            
            const textColorClass = {
              'verde-lima': 'text-brand-verde-lima',
              'azul': 'text-brand-azul dark:text-brand-azul-light',
              'rosa': 'text-brand-rosa',
              'amarillo': 'text-brand-amarillo-dark dark:text-brand-amarillo'
            }[benefit.color] || 'text-brand-azul';
            
            return (
              <div 
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-l-4 border-transparent hover:border-brand-azul"
              >
                <div className={`w-16 h-16 mb-4 ${bgColorClass} bg-opacity-20 dark:bg-opacity-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{benefit.icon}</span>
                </div>
                <h3 className={`font-heading text-xl font-bold ${textColorClass} mb-3`}>
                  {benefit.title}
                </h3>
                <p className="font-body text-gray-600 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;