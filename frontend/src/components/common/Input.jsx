import React from 'react';

const Input = ({ label, type = 'text', id, placeholder, value, onChange, required = false, className = '' }) => {
  return (
    <div className={`input-group ${className}`.trim()}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type={type}
        id={id}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default Input;
