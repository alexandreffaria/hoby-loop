import React from 'react';
import { t } from '../../i18n';

/**
 * Reusable input component with consistent styling
 * Supports internationalization, error states, and accessibility
 * Follows Hobby Loop design guidelines with dark theme
 */
export default function Input({
  type = 'text',
  label,
  labelI18nKey = '',
  name,
  value,
  onChange,
  placeholder = '',
  placeholderI18nKey = '',
  className = '',
  required = false,
  error = '',
  disabled = false
}) {
  // Translate label and placeholder if i18n keys are provided
  const translatedLabel = labelI18nKey ? t(labelI18nKey) : label;
  const translatedPlaceholder = placeholderI18nKey ? t(placeholderI18nKey) : placeholder;
  
  // Dynamic classes based on state
  const inputClasses = `
    w-full bg-gray-900 p-3 rounded-xl text-sm outline-none
    border-2 transition-all duration-300
    ${error
      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/50'
      : 'border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    placeholder:text-gray-600
    text-white
  `.trim();
  
  return (
    <div className={className}>
      {(label || translatedLabel) && (
        <label
          htmlFor={name}
          className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wide"
        >
          {translatedLabel}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={translatedPlaceholder}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClasses}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-xs text-red-400 flex items-center gap-1"
        >
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}