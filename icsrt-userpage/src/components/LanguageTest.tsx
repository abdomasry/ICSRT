import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageTest = () => {
  const { language, t, isRTL, changeLanguage } = useLanguage();

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">{t('common.test')}</h2>
      <p className="mb-4">
        {t('common.current.language')}: <strong>{language === 'ar' ? 'العربية' : 'English'}</strong>
      </p>
      <p className="mb-4">
        {t('common.direction')}: <strong>{isRTL ? 'RTL' : 'LTR'}</strong>
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => changeLanguage('en')}
          className={`px-4 py-2 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('ar')}
          className={`px-4 py-2 rounded ${language === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          العربية
        </button>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-bold">{t('nav.home')}</h3>
        <p>{t('hero.description')}</p>
      </div>
    </div>
  );
};

export default LanguageTest;
