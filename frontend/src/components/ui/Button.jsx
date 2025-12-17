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
    primary: 'bg-gradient-secondary-tertiary text-white hover:bg-gradient-tertiary-forth',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
    outline: 'bg-transparent text-main-text border border-gray-700 hover:bg-gray-800',
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