import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, glass = false, style, ...rest }) => {
  const baseClass = 'card';
  const glassClass = glass ? 'glass' : '';
  // The hover effect is already on the .card class in CSS, but we can toggle it by wrapping or adding a specific class if needed.
  // We'll assume the base .card has the hover effect by default in index.css.
  // Actually, we can add a no-hover class if we don't want it, or just let it be. Let's make it standard.
  
  return (
    <div className={`${baseClass} ${glassClass} ${className}`.trim()} style={style} {...rest}>
      {children}
    </div>
  );
};

export default Card;
