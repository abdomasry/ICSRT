'use client';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

const ResetPassword = () => {
  const { t, isRTL } = useLanguage();
  const [params] = useSearchParams();
  const token = params?.get('token') || '';
  const [valid, setValid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await api.get(`/api/auth/reset-password/${token}/validate`);
        if (mounted) setValid(!!res.valid);
      } catch (e) {
        if (mounted) setValid(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (token) check();
    else { setValid(false); setLoading(false); }
    return () => { mounted = false; };
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword.length < 6) return setError(t('reset.passwordTooShort') || 'Password too short');
    if (newPassword !== confirmPassword) return setError(t('signup.password.match'));
    try {
      setLoading(true);
      const res = await api.post('/api/auth/reset-password', { token, newPassword });
      if (res && res.success) {
        setMessage(t('reset.success'));
        setValid(false);
      } else {
        setError(res?.error || 'Failed to reset');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-md mx-auto p-6">
        <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2 text-center">{t('reset.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">{t('reset.subtitle')}</p>

          {loading && <div className="text-center text-gray-600 dark:text-gray-300">{t('common.loading')}</div>}
          {!loading && valid && (
            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('reset.password')}
                required
                className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('reset.confirm')}
                required
                className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-lg font-semibold shadow transition disabled:opacity-50"
              >
                {loading ? t('reset.saving') : t('reset.submit')}
              </button>
            </form>
          )}

          {!loading && valid === false && (
            <div className="text-center text-red-600 dark:text-red-400">{message || t('reset.invalid')}</div>
          )}

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
              {t('reset.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
