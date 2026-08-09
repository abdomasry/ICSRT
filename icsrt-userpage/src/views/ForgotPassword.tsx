'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

const ForgotPassword = () => {
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setMessage(t('forgot.sent'));
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md mx-auto p-6">
        <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2 text-center">{t('forgot.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">{t('forgot.subtitle')}</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('form.email')}
              required
              className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-lg font-semibold shadow transition disabled:opacity-50"
            >
              {loading ? t('forgot.sending') : t('forgot.submit')}
            </button>
          </form>
          {message && (
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-xl text-center">
              <div className="text-green-800 dark:text-green-300 font-semibold">{message}</div>
            </div>
          )}
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl text-center">
              <div className="text-red-800 dark:text-red-300 font-semibold">{error}</div>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
              {t('forgot.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
