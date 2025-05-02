import React, { useState, useRef } from 'react';

export function ImageUploader({ id = "image-uploader", maxImages = 3, className = "" }) {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > maxImages) {
      alert(`Solo puede subir un máximo de ${maxImages} imágenes.`);
      return;
    }
    
    const newImages = files.map(file => {
      return {
        id: Date.now() + Math.random().toString(36).substring(2),
        file,
        url: URL.createObjectURL(file),
        name: file.name
      };
    });
    
    setImages([...images, ...newImages]);
    
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeImage = (id) => {
    const updatedImages = images.filter(image => image.id !== id);
    setImages(updatedImages);
  };
  
  return (
    <div className={`image-uploader ${className}`}>
      <div className="mb-3">
        <label className="block font-medium mb-1">
          Imágenes del producto ({images.length}/{maxImages})
        </label>
        
        <div className="flex flex-wrap gap-4">
          {/* Previsualizaciones de imágenes */}
          {images.map(image => (
            <div 
              key={image.id}
              className="relative w-24 h-24 border border-border rounded-md overflow-hidden group"
            >
              <img 
                src={image.url} 
                alt={image.name}
                className="w-full h-full object-cover"
              />
              
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute inset-0 bg-rosa/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          
          {/* Botón para añadir imagen */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-text-muted hover:bg-background-alt transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs mt-1">Añadir</span>
            </button>
          )}
        </div>
        
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple={true}
          onChange={handleFileChange}
        />
      </div>
      
      <p className="text-xs text-text-muted">
        Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen.
      </p>
    </div>
  );
} 