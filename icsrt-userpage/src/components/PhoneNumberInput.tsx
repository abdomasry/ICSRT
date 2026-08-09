import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import CountryCodeSelect from './CountryCodeSelect';

export interface PhoneNumberInputProps {
  value?: { code?: string; number?: string; full?: string };
  onChange?: (val: any) => void;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: any;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ 
  value = { code: '', number: '' },
  onChange,
  name = 'phone',
  id = 'phone',
  className = '',
  required = false,
  disabled = false,
  placeholder,
  error
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const handleCodeChange = (code) => {
    if (onChange) {
      onChange({
        code: code,
        number: value.number || '',
        full: code ? `+${code}${value.number || ''}` : value.number || ''
      });
    }
  };

  const handleNumberChange = (e) => {
    const number = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    if (onChange) {
      onChange({
        code: value.code || '',
        number: number,
        full: value.code ? `+${value.code}${number}` : number
      });
    }
  };

  const numberInputClasses = `
    flex-1 px-3 py-2 text-base border border-gray-300 rounded-md
    bg-white dark:bg-gray-700 dark:border-gray-600 
    text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800
    ${isRTL ? 'text-right rounded-r-md rounded-l-none border-l-0' : 'text-left rounded-l-md rounded-r-none border-r-0'}
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
  `.replace(/\s+/g, ' ').trim();

  const selectClasses = `
    ${isRTL ? 'rounded-l-md rounded-r-none border-r-0' : 'rounded-r-md rounded-l-none border-l-0'}
    ${error ? 'border-red-500' : ''}
  `;

  return (
    <div className={`space-y-1 ${className}`}>
      <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={isRTL ? 'flex-1' : 'w-48'}>
          <CountryCodeSelect
            value={value.code}
            onChange={handleCodeChange}
            name={`${name}_code`}
            id={`${id}_code`}
            className={selectClasses}
            required={required}
            disabled={disabled}
          />
        </div>
        <div className={isRTL ? 'w-48' : 'flex-1'}>
          <input
            type="tel"
            id={`${id}_number`}
            name={`${name}_number`}
            value={value.number || ''}
            onChange={handleNumberChange}
            className={numberInputClasses}
            placeholder={placeholder || (isRTL ? 'رقم الهاتف' : 'Phone Number')}
            required={required}
            disabled={disabled}
            dir={isRTL ? 'rtl' : 'ltr'}
            maxLength={15}
          />
        </div>
      </div>
      
      {/* Display full phone number */}
      {(value.code || value.number) && (
        <div className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? 'الرقم الكامل:' : 'Full Number:'} 
          <span className="font-mono font-medium ml-1">
            {value.code ? `+${value.code}` : ''}{value.number || ''}
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className={`text-sm text-red-600 dark:text-red-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;
