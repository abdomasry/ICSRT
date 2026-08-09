'use client';
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getUniqueCountries } from '../utils/countryData';

const CountrySelect = ({ 
  value, 
  onChange, 
  name = 'country', 
  id = 'country',
  className = '',
  required = false,
  disabled = false 
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Countries list derived from shared dataset (unique names)
  const countries = React.useMemo(() => getUniqueCountries(), []);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const defaultClasses = `
    form-select w-full px-4 py-3 text-base border border-gray-300 rounded-xl 
    bg-white dark:bg-gray-700 dark:border-gray-600 
    text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800
    transition duration-200
    ${isRTL ? 'text-right' : 'text-left'}
  `.replace(/\s+/g, ' ').trim();

  return (
    <select
      id={id}
      name={name}
      value={value || ''}
      onChange={handleChange}
      className={`${defaultClasses} ${className}`}
      required={required}
      disabled={disabled}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <option value="" disabled>
        {isRTL ? 'اختر الدولة' : 'Select Country'}
      </option>
      {countries.map((country) => (
        <option key={country.name} value={country.name}>
          {isRTL ? country.nameAr : country.name}
        </option>
      ))}
    </select>
  );
};

export default CountrySelect;
