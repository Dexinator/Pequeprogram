import React, { useState, useEffect, useCallback } from 'react';

const StoreImageSlider = ({ images, className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [goToNext, isAutoPlaying]);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
    if (isRightSwipe) {
      goToPrevious();
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
        <div 
          className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[450px]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="min-w-full h-full relative">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            goToPrevious();
            setIsAutoPlaying(false);
            setTimeout(() => setIsAutoPlaying(true), 5000);
          }}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-brand-azul dark:text-brand-azul-light p-2 sm:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-azul"
          aria-label="Imagen anterior"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => {
            goToNext();
            setIsAutoPlaying(false);
            setTimeout(() => setIsAutoPlaying(true), 5000);
          }}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-brand-azul dark:text-brand-azul-light p-2 sm:p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-azul"
          aria-label="Siguiente imagen"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-full px-3 py-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none ${
                index === currentIndex 
                  ? 'bg-brand-verde-lima w-8 h-2 sm:w-10 sm:h-3' 
                  : 'bg-white/60 dark:bg-gray-600/60 w-2 h-2 sm:w-3 sm:h-3 hover:bg-white dark:hover:bg-gray-500'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 bg-gradient-to-r from-brand-rosa/10 via-brand-amarillo/10 to-brand-verde-lima/10 dark:from-brand-rosa/5 dark:via-brand-amarillo/5 dark:to-brand-verde-lima/5 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-brand-verde-lima/20 rounded-full">
              <span className="text-lg">🏪</span>
            </span>
            <div>
              <p className="font-heading text-sm font-bold text-brand-azul dark:text-brand-azul-light">
                Nuestra Tienda
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Un espacio pensado para ti y tu bebé
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreImageSlider;