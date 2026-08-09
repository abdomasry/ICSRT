import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage, isRTL } = useLanguage();

  return (
    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
          language === 'en'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
          language === 'ar'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        عربي
      </button>
    </div>
  );
};

export default LanguageSwitcher;
