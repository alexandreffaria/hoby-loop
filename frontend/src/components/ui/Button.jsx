import React from 'react';
import { t } from '../../i18n';

/**
 * Reusable button component with consistent styling
 * Supports internationalization
 */
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled = false,
  i18nKey = ''
}) {
  // If i18nKey is provided, use it to translate the button text
  const buttonText = i18nKey ? t(i18nKey) : children;
  const baseClasses = 'font-bold py-3 rounded-xl uppercase tracking-wide transition-all duration-300';
  
  const variantClasses = {
    primary: 'text-white bg-transparent border-2 border-transparent bg-clip-padding bg-gradient-to-r from-secondary to-tertiary hover:from-tertiary hover:to-forth',
    secondary: 'text-white bg-gray-800 hover:bg-gray-700',
    outline: 'text-main-text bg-transparent border-2 border-gray-800 hover:border-transparent hover:bg-gradient-to-r hover:from-secondary hover:to-tertiary',
    danger: 'text-white bg-red-600 hover:bg-red-700',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
    >
      {buttonText}
    </button>
  );
}