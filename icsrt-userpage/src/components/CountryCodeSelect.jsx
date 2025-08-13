import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { countryCodes } from '../utils/countryData';

const CountryCodeSelect = ({ 
  value, 
  onChange, 
  name = 'countryCode', 
  id = 'countryCode',
  className = '',
  required = false,
  disabled = false 
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';


  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const defaultClasses = `
    form-select w-full px-3 py-2 text-base border border-gray-300 rounded-md 
    bg-white dark:bg-gray-700 dark:border-gray-600 
    text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800
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
        {isRTL ? 'اختر كود الدولة' : 'Select Country Code'}
      </option>
      {countryCodes.map((country) => (
        <option key={`${country.code}-${country.name}`} value={country.code}>
          {isRTL 
            ? `${country.nameAr} +${country.code}` 
            : `${country.name} +${country.code}`
          }
        </option>
      ))}
    </select>
  );
};

export default CountryCodeSelect;
