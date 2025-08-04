import React, { useState } from 'react';

const ImageGalleryRedesigned = ({ images = [], productName = '', hasDiscount = false, discountPercentage = 0 }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Si no hay imágenes, mostrar placeholder
  const displayImages = images.length > 0 ? images : ['/placeholder-product.png'];
  
  return (
    <div className="space-y-4">
      {/* Imagen principal con diseño Entrepeques */}
      <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl group">
        {/* Badge de descuento */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-brand-rosa text-white px-4 py-2 rounded-full font-heading font-bold shadow-lg animate-pulse">
              -{discountPercentage}%
            </div>
          </div>
        )}
        
        {/* Imagen principal */}
        <div 
          className="relative w-full h-full cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={displayImages[selectedImage]}
            alt={`${productName} - Vista ${selectedImage + 1}`}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              e.target.src = '/placeholder-product.png';
            }}
          />
          
          {/* Overlay con instrucciones */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-sm font-body flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                Click para ampliar
              </p>
            </div>
          </div>
        </div>
        
        {/* Navegación de flechas */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Imagen anterior"
            >
              <svg className="w-6 h-6 text-brand-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedImage((prev) => (prev + 1) % displayImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Siguiente imagen"
            >
              <svg className="w-6 h-6 text-brand-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {/* Miniaturas con estilo Entrepeques */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-azul scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all ${
                selectedImage === index
                  ? 'ring-4 ring-brand-azul shadow-lg scale-105'
                  : 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-brand-verde-lima'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.png';
                }}
              />
              {selectedImage === index && (
                <div className="absolute inset-0 bg-brand-azul/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Indicadores de imagen */}
      {displayImages.length > 1 && (
        <div className="flex justify-center gap-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`h-2 rounded-full transition-all ${
                selectedImage === index
                  ? 'w-8 bg-brand-azul'
                  : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-brand-verde-lima'
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Modal de zoom (opcional) */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={displayImages[selectedImage]}
            alt={`${productName} - Ampliada`}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryRedesigned;