import React from 'react';
import { t } from '../../i18n';

/**
 * Reusable input component with consistent styling
 * Supports internationalization
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
  required = false
}) {
  // Translate label and placeholder if i18n keys are provided
  const translatedLabel = labelI18nKey ? t(labelI18nKey) : label;
  const translatedPlaceholder = placeholderI18nKey ? t(placeholderI18nKey) : placeholder;
  return (
    <div className={className}>
      {(label || translatedLabel) && (
        <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase mb-2">
          {translatedLabel}
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
        className="w-full bg-gray-900 p-3 rounded-xl text-sm outline-none border-2 border-gray-800 focus:border-transparent focus:bg-gradient-to-r focus:from-secondary focus:to-tertiary transition-all duration-300"
      />
    </div>
  );
}