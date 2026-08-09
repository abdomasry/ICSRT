'use client';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import PhoneInput from '../components/PhoneInput';

const PhoneInputDemo = () => {
  const { isRTL } = useLanguage();
  const [phone1, setPhone1] = useState('+20 ');
  const [phone2, setPhone2] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+966 '
  });

  const handlePhone1Change = (e) => {
    setPhone1(e.target.value);
  };

  const handlePhone2Change = (e) => {
    setPhone2(e.target.value);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-10 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {isRTL ? 'تجربة مكون رقم الهاتف' : 'Phone Input Component Demo'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {isRTL ? 'اختبر وظائف مكون رقم الهاتف مع أكواد الدول' : 'Test the phone input component with country codes'}
          </p>
        </div>

        <div className="space-y-8">
          {/* Demo 1: Basic Phone Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? 'مثال أساسي' : 'Basic Example'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <PhoneInput
                  value={phone1}
                  onChange={handlePhone1Change}
                  placeholder={isRTL ? 'ادخل رقم الهاتف' : 'Enter phone number'}
                  name="phone1"
                  id="phone1"
                />
              </div>
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <strong>{isRTL ? 'القيمة الحالية:' : 'Current Value:'}</strong> {phone1}
              </div>
            </div>
          </div>

          {/* Demo 2: Phone Input with Error */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? 'مع رسالة خطأ' : 'With Error Message'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <PhoneInput
                  value={phone2}
                  onChange={handlePhone2Change}
                  placeholder={isRTL ? 'ادخل رقم الهاتف' : 'Enter phone number'}
                  error={phone2 && phone2.length < 10 ? (isRTL ? 'رقم الهاتف قصير جداً' : 'Phone number too short') : ''}
                  name="phone2"
                  id="phone2"
                  required
                />
              </div>
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <strong>{isRTL ? 'القيمة الحالية:' : 'Current Value:'}</strong> {phone2 || (isRTL ? 'فارغ' : 'Empty')}
              </div>
            </div>
          </div>

          {/* Demo 3: Form Example */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? 'مثال في نموذج' : 'Form Example'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={isRTL ? 'ادخل الاسم' : 'Enter name'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={isRTL ? 'ادخل البريد الإلكتروني' : 'Enter email'}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <PhoneInput
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder={isRTL ? 'ادخل رقم الهاتف' : 'Enter phone number'}
                  name="phone"
                  id="form-phone"
                  required
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
              <h3 className="font-semibold mb-2">{isRTL ? 'بيانات النموذج:' : 'Form Data:'}</h3>
              <pre className="text-sm text-gray-600 dark:text-gray-300">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Demo 4: Enhanced Features List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? '🚀 المميزات المحسنة الجديدة' : '🚀 New Enhanced Features'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  {isRTL ? '⌨️ التحكم بلوحة المفاتيح' : '⌨️ Keyboard Controls'}
                </h3>
                <ul className={`space-y-2 text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded mr-2">↑↓</kbd>
                    <span>{isRTL ? 'التنقل في القائمة' : 'Navigate countries'}</span>
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded mr-2">Enter</kbd>
                    <span>{isRTL ? 'اختيار الدولة' : 'Select country'}</span>
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded mr-2">Esc</kbd>
                    <span>{isRTL ? 'إغلاق القائمة' : 'Close dropdown'}</span>
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded mr-2">Any Key</kbd>
                    <span>{isRTL ? 'بحث سريع' : 'Quick search'}</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                  {isRTL ? '🔍 البحث المحسن' : '🔍 Enhanced Search'}
                </h3>
                <ul className={`space-y-2 text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'بحث بالأسماء (English/العربية)' : 'Search by names (English/العربية)'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'بحث بكود الدولة (+20, +966)' : 'Search by country code (+20, +966)'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'إكمال تلقائي أثناء الكتابة' : 'Auto-complete while typing'}
                  </li>
                  <li className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-green-500 mr-2">✅</span>
                    {isRTL ? 'عداد النتائج المطابقة' : 'Matching results counter'}
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                {isRTL ? '💡 نصائح للاستخدام' : '💡 Usage Tips'}
              </h3>
              <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <p>{isRTL ? '• اكتب "eg" أو "مصر" للعثور على مصر سريعاً' : '• Type "eg" or "egypt" to quickly find Egypt'}</p>
                <p>{isRTL ? '• اكتب "966" للعثور على السعودية' : '• Type "966" to find Saudi Arabia'}</p>
                <p>{isRTL ? '• استخدم الأسهم للتنقل والضغط على Enter للاختيار' : '• Use arrows to navigate and Enter to select'}</p>
                <p>{isRTL ? '• اضغط Esc للخروج من القائمة' : '• Press Esc to close the dropdown'}</p>
              </div>
            </div>
          </div>

          {/* Demo 5: Live Search Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {isRTL ? '🧪 اختبر البحث المباشر' : '🧪 Live Search Test'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <strong>{isRTL ? 'جرب البحث بـ:' : 'Try searching with:'}</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• "egypt" or "مصر"</li>
                    <li>• "+20" or "20"</li>
                    <li>• "saudi" or "سعودية"</li>
                    <li>• "+966" or "966"</li>
                  </ul>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <strong>{isRTL ? 'تحكم بلوحة المفاتيح:' : 'Keyboard shortcuts:'}</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Arrow keys to navigate</li>
                    <li>• Enter to select</li>
                    <li>• Esc to close</li>
                    <li>• Any key to search</li>
                  </ul>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <strong>{isRTL ? 'ميزات إضافية:' : 'Extra features:'}</strong>
                  <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>• Auto-focus search</li>
                    <li>• Mouse hover highlight</li>
                    <li>• Selected state indicator</li>
                    <li>• Smooth scrolling</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? '🔥 اختبر البحث السريع هنا:' : '🔥 Test Quick Search Here:'}
                </label>
                <PhoneInput
                  value={phone2}
                  onChange={handlePhone2Change}
                  placeholder={isRTL ? 'اكتب أي شيء للبحث...' : 'Type anything to search...'}
                  name="test-search"
                  id="test-search"
                />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {isRTL ? 'انقر واكتب للبحث، أو استخدم الأسهم والأوامر' : 'Click and type to search, or use arrow keys and commands'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneInputDemo;
