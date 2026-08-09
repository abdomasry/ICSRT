'use client';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import FloatingContactButton from "../components/FloatingContactButton";
import { api } from "../lib/api";

const Contact = () => {
  const { isLoggedIn, user } = useUser();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in, if not redirect to login with return URL
    if (!isLoggedIn) {
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isLoggedIn, user, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number formatting
    if (name === 'phone') {
      // Remove all non-numeric characters except + and -
      let cleanPhone = value.replace(/[^+\d\-\s]/g, '');
      
      // If it starts with numbers and no +, add + prefix
      if (cleanPhone && !cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.post('/api/contact-requests', {
        ...formData,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      if (result && (result.success !== false)) {
        setSubmitted(true);
        setFormData({
          name: user?.name || user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        setError(result?.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending contact form:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if user is not logged in (will redirect)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}

      {/* Main Content */}
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="mb-8 p-6 rounded-lg border bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold">{t('contact.success.title')}</h3>
                  <p className="mt-1">{t('contact.success.message')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 rounded-lg border bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t('form.name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                      placeholder={t('contact.form.namePlaceholder')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t('form.email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                      placeholder={t('contact.form.emailPlaceholder')}
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Phone Number *
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                      (Auto-filled from your profile)
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                    placeholder="e.g., +201234567890"
                  />
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    Include country code (e.g., +20 for Egypt, +1 for US)
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('contact.form.category')} *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                  >
                    <option value="general">{t('contact.category.general')}</option>
                    <option value="services">{t('contact.category.services')}</option>
                    <option value="technical">{t('contact.category.technical')}</option>
                    <option value="billing">{t('contact.category.billing')}</option>
                    <option value="partnership">{t('contact.category.partnership')}</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('contact.form.subject')} *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-300"
                    placeholder={t('contact.form.subjectPlaceholder')}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t('contact.form.message')} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-vertical transition-colors duration-300"
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      loading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    {loading ? t('contact.form.sending') : t('contact.form.send')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-white dark:bg-gray-800">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {t('contact.info.email.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contact.info.email.value')}
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white dark:bg-gray-800">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {t('contact.info.phone.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contact.info.phone.value')}
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-white dark:bg-gray-800">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                {t('contact.info.response.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contact.info.response.value')}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
};

export default Contact;
