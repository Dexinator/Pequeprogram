import React from 'react';
import StoreImageSlider from './StoreImageSlider';

const VisitUsSection = ({ optimizedImages }) => {
  // Use optimized images if provided, otherwise use default placeholder
  const storeImages = optimizedImages || [
    { src: '/placeholder-product.svg', alt: "Interior de nuestra tienda" },
    { src: '/placeholder-product.svg', alt: "Área de productos" },
    { src: '/placeholder-product.svg', alt: "Sección infantil" },
    { src: '/placeholder-product.svg', alt: "Espacio familiar" }
  ];
  const schedule = [
    { day: "Lunes - Viernes", hours: "11:00 am - 7:30 pm" },
    { day: "Sábados", hours: "11:00 am - 6:30 pm" },
    { day: "Domingos", hours: "Cerrado" }
  ];

  const contactInfo = [
    { icon: "📍", label: "Dirección", value: "Av. Homero 1616, Polanco I Secc, Miguel Hidalgo, 11510 CDMX" },
    { icon: "📞", label: "Teléfono", value: "(55) 6588 3245", link: "tel:+525523632389" },
    { icon: "💬", label: "WhatsApp", value: "(55) 2363 2389", link: "https://wa.me/525523632389" }
  ];

  return (
    <section id="tienda" className="py-16 md:py-20 lg:py-24 bg-gradient-to-br from-brand-azul/10 to-brand-verde-lima/10 dark:from-brand-azul/5 dark:to-brand-verde-lima/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-azul dark:text-brand-azul-light mb-8 flex items-center justify-center">
            <span className="bg-brand-verde-lima text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 text-2xl">📍</span>
            Ven y Conócenos
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto">
            Visítanos en nuestra tienda en Polanco. Te esperamos con los mejores productos 
            y la mejor atención para ti y tu bebé.
          </p>
        </div>

        {/* Image Slider Section */}
        <div className="mb-12">
          <StoreImageSlider images={storeImages} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Map */}
          <div className="rounded-3xl overflow-hidden shadow-xl h-[450px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.566!2d-99.2028!3d19.4407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d2021a6b6b6b6b%3A0x1234567890abcdef!2sAv.%20Homero%201616%2C%20Polanco%2C%20Polanco%20I%20Secc%2C%20Miguel%20Hidalgo%2C%2011510%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses!2smx!4v1234567890123"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Entrepeques"
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Right Side - Info */}
          <div className="space-y-6">
            {/* Schedule Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-xl">
              <h3 className="font-heading text-xl font-bold text-brand-azul dark:text-brand-azul-light mb-4 flex items-center">
                <span className="text-2xl mr-2">🕐</span>
                Horarios de Atención
              </h3>
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-md">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.day}</span>
                    <span className={`${item.hours === 'Cerrado' ? 'text-brand-rosa' : 'text-brand-verde-lima'} font-bold`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl">
              <h3 className="font-heading text-xl font-bold text-brand-verde-lima mb-4">
                Información de Contacto
              </h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                      {item.link ? (
                        <a 
                          href={item.link}
                          className="text-gray-900 dark:text-gray-100 hover:text-brand-rosa dark:hover:text-brand-rosa transition-colors font-semibold"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.google.com/maps/dir//Av.+Homero+1616,+Polanco,+Polanco+I+Secc,+Miguel+Hidalgo,+11510+Ciudad+de+México,+CDMX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-brand-azul hover:bg-brand-azul-profundo text-white px-6 py-3 rounded-lg font-heading font-semibold shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all text-center inline-flex items-center justify-center"
              >
                <span className="mr-2">🗺️</span>
                Cómo Llegar
              </a>
              <a
                href="https://wa.me/525523632389?text=Hola,%20me%20gustaría%20visitar%20su%20tienda"
                className="flex-1 bg-brand-verde-lima hover:bg-brand-verde-oscuro text-white px-6 py-3 rounded-lg font-heading font-semibold shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all text-center inline-flex items-center justify-center"
              >
                <span className="mr-2">💬</span>
                Escríbenos
              </a>
            </div>

            {/* Additional Info */}
            <div className="bg-brand-amarillo/10 dark:bg-brand-amarillo/5 rounded-lg p-4 border border-brand-amarillo/30">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">💡 Tip:</span>Estacionamiento con parquímetro (Llámanos al llegar y te ayudamos)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitUsSection;