import React from 'react';

/**
 * Reusable button component with consistent styling
 */
export default function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  disabled = false
}) {
  const baseClasses = 'font-bold py-3 rounded-xl uppercase tracking-wide transition-transform active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-black',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}