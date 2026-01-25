import React from 'react';
import { t } from '../../i18n';

/**
 * Reusable button component with consistent styling
 * Supports internationalization and multiple variants
 * Follows Hobby Loop design guidelines with neon/cyber gradients
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
  
  // Base classes with proper touch targets for mobile
  const baseClasses = 'font-bold py-3 px-6 rounded-xl uppercase tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant classes matching design guidelines
  const variantClasses = {
    // Primary: Neon/Cyber gradient (Purple to Blue)
    primary: 'text-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 shadow-lg hover:shadow-purple-500/50',
    
    // Secondary: Subtle dark background
    secondary: 'text-white bg-gray-800 hover:bg-gray-700 border border-gray-700',
    
    // Outline: Transparent with gradient border on hover
    outline: 'text-main-text bg-transparent border-2 border-purple-500/30 hover:border-transparent hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500',
    
    // Success: Green for positive actions
    success: 'text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/50',
    
    // Danger: Red for destructive actions
    danger: 'text-white bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/50',
    
    // Ghost: Minimal styling
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800/50',
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