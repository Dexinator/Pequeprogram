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
      description: 'Cada producto pasa por un riguroso proceso de selección y limpieza antes de llegar a ti.',
      color: 'rosa'
    },
    {
      icon: '🚚',
      title: 'Envío Seguro',
      description: 'Entrega a domicilio con embalaje especial para que tus productos lleguen en perfecto estado.',
      color: 'amarillo'
    },
    {
      icon: '🤝',
      title: 'Comunidad Solidaria',
      description: 'Forma parte de una red de familias que apoyan el consumo inteligente y sostenible.',
      color: 'verde-lima'
    },
    {
      icon: '💳',
      title: 'Pagos Flexibles',
      description: 'Acepta efectivo, tarjeta y crédito en tienda. Compra ahora y paga como prefieras.',
      color: 'azul'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-brand-verde-lima/10 via-transparent to-brand-azul/10 dark:from-brand-verde-lima/5 dark:via-transparent dark:to-brand-azul/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-verde-lima dark:text-brand-verde-lima mb-4">
            ¿Por qué elegir Entrepeques?
          </h2>
          <p className="font-body text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-5xl mx-auto">
            Somos más que una tienda, somos una comunidad comprometida con las familias y el planeta
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all"
            >
              <div className={`w-20 h-20 mb-6 bg-brand-${benefit.color}/20 rounded-2xl flex items-center justify-center`}>
                <span className="text-4xl">{benefit.icon}</span>
              </div>
              <h3 className={`font-heading text-2xl font-bold text-brand-${benefit.color} mb-4`}>
                {benefit.title}
              </h3>
              <p className="font-body text-gray-600 dark:text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;