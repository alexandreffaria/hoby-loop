import ptBR from './pt-BR';

// Default language is Brazilian Portuguese
const defaultLanguage = 'pt-BR';

// Available translations
const translations = {
  'pt-BR': ptBR
};

/**
 * Get nested property from object using dot notation
 * @param {Object} obj - The object to search in
 * @param {String} path - Path using dot notation (e.g. 'admin.title')
 * @param {*} defaultValue - Default value if path is not found
 * @returns {*} The value at the specified path or the default value
 */
const getNestedValue = (obj, path, defaultValue = undefined) => {
  if (!path) return obj;
  
  const properties = path.split('.');
  let value = obj;
  
  for (const property of properties) {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    value = value[property];
  }
  
  return value !== undefined ? value : defaultValue;
};

/**
 * Replace placeholders in a string with values
 * @param {String} str - The string with placeholders like {name}
 * @param {Object} params - The values to replace the placeholders with
 * @returns {String} String with replaced placeholders
 */
const replacePlaceholders = (str, params = {}) => {
  if (!str || typeof str !== 'string') return str;
  
  return str.replace(/{([^{}]*)}/g, (matched, key) => {
    const value = params[key];
    return value !== undefined ? value : matched;
  });
};

/**
 * Get a translation by key with optional parameters for placeholders
 * @param {String} key - The translation key in dot notation (e.g. 'admin.title')
 * @param {Object} params - Values for placeholders in the translation string
 * @returns {String} The translated string
 */
export const t = (key, params = {}) => {
  // Get current language translations
  const currentTranslations = translations[defaultLanguage];
  
  if (!currentTranslations) {
    console.warn(`Translation not found for language: ${defaultLanguage}`);
    return key;
  }
  
  // Get the translation from the nested structure
  const translation = getNestedValue(currentTranslations, key, key);
  
  // Replace any parameters in the translation string
  return replacePlaceholders(translation, params);
};

/**
 * i18n utility object
 */
const i18n = {
  t,
  language: defaultLanguage
};

export default i18n;