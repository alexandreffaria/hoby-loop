import React from 'react';

/**
 * Reusable input component with consistent styling
 */
export default function Input({ 
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder = '',
  className = '',
  required = false
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-gray-900 p-3 rounded-xl text-sm outline-none border border-gray-800 focus:border-secondary transition-colors"
      />
    </div>
  );
}