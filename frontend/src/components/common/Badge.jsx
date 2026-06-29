import React from 'react';

const Badge = ({ children, type = 'default', className = '', style, ...rest }) => {
  const getVariantClass = () => {
    switch (type.toLowerCase()) {
      case 'veg':
      case 'available':
      case 'completed':
        return 'badge-veg';
      case 'non-veg':
      case 'closed':
      case 'cancelled':
      case 'sold out':
        return 'badge-nonveg';
      case 'jain':
      case 'vegan':
        return 'badge-veg';
      default:
        return 'badge-default';
    }
  };

  return (
    <span className={`badge ${getVariantClass()} ${className}`.trim()} style={style} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
