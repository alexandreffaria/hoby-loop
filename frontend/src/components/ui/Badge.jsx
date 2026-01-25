import React from 'react';

/**
 * Reusable badge component for status indicators
 * Pill-shaped with color-coded variants matching design guidelines
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon = null,
  className = ''
}) {
  // Base classes for pill shape
  const baseClasses = 'inline-flex items-center gap-2 rounded-full font-bold uppercase tracking-wide border transition-all';
  
  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm'
  };
  
  // Color variants matching design guidelines
  const variantClasses = {
    // Status colors
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    preparing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    
    // Semantic colors
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    
    // Default
    default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    
    // Gradient variant
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
  };
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </span>
  );
}
