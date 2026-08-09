'use client';
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import FloatingContactButton from "../components/FloatingContactButton";
import { api } from "../lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useUser();
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const resp = await api.postSafe('/api/auth/login', form);
      const data = resp.data;
      if (resp.ok && data && data.token) {
        // Store user data using context
        login(data.user, data.token);
        
        setMessage("Login successful! Redirecting...");
        
        // Get return URL from search params or default to dashboard
        const returnUrl = searchParams?.get('returnUrl');
        const redirectPath = returnUrl ? decodeURIComponent(returnUrl) : '/dashboard';
        
        // Redirect to return URL or dashboard
        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);
      } else {
        const serverMsg = data?.error || data?.message;
        if (data?.needsVerification) {
          setError(serverMsg || (isRTL ? 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول' : 'Please verify your email before logging in'));
        } else if (resp.status === 401) {
          setError(serverMsg || (isRTL ? 'بيانات تسجيل الدخول غير صحيحة' : 'Invalid email or password'));
        } else if (resp.status === 403) {
          setError(serverMsg || (isRTL ? 'الدخول مرفوض' : 'Access denied'));
        } else {
          setError(serverMsg || (isRTL ? 'فشل تسجيل الدخول' : 'Login failed'));
        }
      }
    } catch (err) {
      setError(isRTL ? 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}

      <div className="max-w-md mx-auto p-6">
        <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 ${isRTL ? 'text-right' : ''}`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-blue-800 dark:text-blue-400 mb-4">{t('login.welcome')}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder={t('form.email')}
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
            />
            
            <input
              type="password"
              name="password"
              placeholder={t('form.password')}
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
            />
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-8 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 ${
                loading 
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white hover:shadow-2xl transform hover:-translate-y-1'
              }`}
            >
              {loading ? t('login.signing') : t('form.login')}
            </button>
          </form>

          {message && (
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-xl">
              <div className="text-green-800 dark:text-green-300 font-semibold text-center">{message}</div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl">
              <div className="text-red-800 dark:text-red-300 font-semibold text-center">{error}</div>
            </div>
          )}

          <div className="mt-6 text-center space-y-4">
            <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
              {t('login.forgot')}
            </Link>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <p className="text-gray-600 dark:text-gray-300">
                {t('login.no.account')}{" "}
                <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">
                  {t('login.signup.link')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Contact Button */}
      <FloatingContactButton />
    </div>
  );
};

export default Login;
