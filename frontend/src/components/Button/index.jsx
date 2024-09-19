import React from 'react';

const Button = ({ onClick, type = 'button', className, children }) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 text-black text-xs font-medium rounded ${className}`}
  >
    {children}
  </button>
);

export default Button;
