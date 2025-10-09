import React from 'react';

const LogoReact = ({ className = "h-20 md:h-24 w-auto group-hover:scale-105 transition-transform duration-300" }) => {
  return (
    <img 
      src="/logo-entrepeques-final.svg"
      alt="Entrepeques"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
};

export default LogoReact;