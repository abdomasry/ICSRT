'use client';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import CountryCodeSelect from '../components/CountryCodeSelect';
import PhoneNumberInput from '../components/PhoneNumberInput';

const CountryCodeDemo = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // State for different demos
  const [countryCode, setCountryCode] = useState('');
  const [phoneData, setPhoneData] = useState({ code: '', number: '', full: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: { code: '', number: '', full: '' }
  });
  const [errors, setErrors] = useState<any>({});

  const handlePhoneChange = (newPhoneData) => {
    setPhoneData(newPhoneData);
  };

  const handleFormPhoneChange = (newPhoneData) => {
    setFormData(prev => ({
      ...prev,
      phone: newPhoneData
    }));
    
    // Clear phone error if user starts typing
    if (errors.phone && newPhoneData.code && newPhoneData.number) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = isRTL ? 'الاسم مطلوب' : 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    }
    if (!formData.phone.code || !formData.phone.number) {
      newErrors.phone = isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert(isRTL 
        ? `تم الإرسال بنجاح!\nالاسم: ${formData.name}\nالبريد: ${formData.email}\nالهاتف: ${formData.phone.full}`
        : `Form submitted successfully!\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone.full}`
      );
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isRTL ? '🌍 اختيار كود الدولة للهاتف' : '🌍 Country Code Phone Selector'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {isRTL 
              ? 'مكونات متقدمة لاختيار كود الدولة ورقم الهاتف'
              : 'Advanced components for country code and phone number selection'
            }
          </p>
        </div>

        <div className="space-y-8">
          {/* Demo 1: Basic Country Code Select */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? '1️⃣ اختيار كود الدولة الأساسي' : '1️⃣ Basic Country Code Select'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'اختر كود الدولة:' : 'Select Country Code:'}
                </label>
                <div className="max-w-md">
                  <CountryCodeSelect
                    value={countryCode}
                    onChange={setCountryCode}
                    name="demo-country-code"
                    id="demo-country-code"
                  />
                </div>
                {countryCode && (
                  <div className={`mt-2 text-sm text-blue-600 dark:text-blue-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'كود الدولة المختار:' : 'Selected Country Code:'} 
                    <span className="font-mono font-bold ml-1">+{countryCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Demo 2: Complete Phone Number Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? '2️⃣ إدخال رقم الهاتف الكامل' : '2️⃣ Complete Phone Number Input'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'رقم الهاتف الكامل:' : 'Complete Phone Number:'}
                </label>
                <div className="max-w-lg">
                  <PhoneNumberInput
                    value={phoneData}
                    onChange={handlePhoneChange}
                    name="demo-phone"
                    id="demo-phone"
                    placeholder={isRTL ? 'ادخل رقم الهاتف' : 'Enter phone number'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Demo 3: Form Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? '3️⃣ تكامل مع النماذج' : '3️⃣ Form Integration'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الاسم *' : 'Name *'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.name && (
                  <div className={`text-sm text-red-600 dark:text-red-400 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'البريد الإلكتروني *' : 'Email *'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                    ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {errors.email && (
                  <div className={`text-sm text-red-600 dark:text-red-400 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'رقم الهاتف *' : 'Phone Number *'}
                </label>
                <PhoneNumberInput
                  value={formData.phone}
                  onChange={handleFormPhoneChange}
                  name="form-phone"
                  id="form-phone"
                  required={true}
                  error={errors.phone}
                  placeholder={isRTL ? 'ادخل رقم الهاتف' : 'Enter phone number'}
                />
              </div>

              <button
                type="submit"
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md 
                  transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isRTL ? 'font-arabic' : ''}`}
              >
                {isRTL ? 'إرسال النموذج' : 'Submit Form'}
              </button>
            </form>
          </div>

          {/* Demo 4: Features List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? '✨ المميزات' : '✨ Features'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  {isRTL ? '🌍 اختيار كود الدولة' : '🌍 Country Code Select'}
                </h3>
                <ul className={`space-y-2 text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? '190+ دولة مع أكواد الهاتف' : '190+ countries with phone codes'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'أسماء الدول بالعربية والإنجليزية' : 'Country names in Arabic and English'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'تصميم متجاوب ومتوافق مع الوضع الليلي' : 'Responsive design with dark mode'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'سهولة التكامل مع النماذج' : 'Easy form integration'}
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                  {isRTL ? '📱 إدخال رقم الهاتف' : '📱 Phone Number Input'}
                </h3>
                <ul className={`space-y-2 text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'فصل كود الدولة عن رقم الهاتف' : 'Separate country code and phone number'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'عرض الرقم الكامل تلقائياً' : 'Auto-display full phone number'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'التحقق من صحة الإدخال' : 'Input validation'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'رسائل خطأ مخصصة' : 'Custom error messages'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Demo 5: Usage Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? '💡 أمثلة الاستخدام' : '💡 Usage Examples'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {isRTL ? 'اختيار كود الدولة فقط:' : 'Country Code Select Only:'}
                  </h3>
                  <pre className={`text-xs text-gray-600 dark:text-gray-300 overflow-x-auto ${isRTL ? 'text-right' : ''}`}>
{`<CountryCodeSelect
  value={countryCode}
  onChange={setCountryCode}
  name="countryCode"
/>`}
                  </pre>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {isRTL ? 'رقم الهاتف الكامل:' : 'Complete Phone Input:'}
                  </h3>
                  <pre className={`text-xs text-gray-600 dark:text-gray-300 overflow-x-auto ${isRTL ? 'text-right' : ''}`}>
{`<PhoneNumberInput
  value={phoneData}
  onChange={setPhoneData}
  name="phone"
  required={true}
/>`}
                  </pre>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {isRTL ? '🎯 نصائح للاستخدام' : '🎯 Usage Tips'}
                </h3>
                <ul className={`text-sm text-blue-600 dark:text-blue-400 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <li>{isRTL ? '• كود الدولة والرقم منفصلان لسهولة التعامل' : '• Country code and number are separated for easy handling'}</li>
                  <li>{isRTL ? '• الرقم الكامل يظهر تلقائياً مع علامة +' : '• Full number is auto-displayed with + sign'}</li>
                  <li>{isRTL ? '• يمكن استخدامهما منفصلين أو معاً' : '• Can use components separately or together'}</li>
                  <li>{isRTL ? '• دعم كامل للغة العربية والإنجليزية' : '• Full Arabic and English language support'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryCodeDemo;
