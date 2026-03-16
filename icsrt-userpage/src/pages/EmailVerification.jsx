import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import DarkModeToggle from "../components/DarkModeToggle";
import { api } from "../lib/api";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: "",
    verificationCode: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);

  // Auto-populate email from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setForm(prev => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  // Check for token in URL (for email link verification)
  useEffect(() => {
  const verifyWithToken = async (token) => {
      setAutoVerifying(true);
      try {
    const data = await api.get(`/api/auth/verify-email/${token}`);
    if (data && (data.success !== false)) {
          setMessage(t('verification.success') || 'Email verified successfully! You can now log in.');
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(data.error || 'Invalid or expired verification link.');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setError('Network error. Please try again.');
      } finally {
        setAutoVerifying(false);
      }
    };

    const token = searchParams.get('token');
    if (token) {
      verifyWithToken(token);
    }
  }, [searchParams, t, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!form.email || !form.verificationCode) {
      setError(t('verification.error.required') || 'Email and verification code are required.');
      setLoading(false);
      return;
    }

    try {
      const data = await api.post('/api/auth/verify-email', {
        email: form.email,
        verificationCode: form.verificationCode.toUpperCase()
      });

      if (data && (data.success !== false)) {
        setMessage(t('verification.success') || 'Email verified successfully! You can now log in.');
        setForm({ email: "", verificationCode: "" });
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.error || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(t('verification.error.network') || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/api/auth/resend-verification', { email: form.email });
      if (data && (data.success !== false)) {
        setMessage('Verification email sent successfully! Please check your inbox.');
        setError("");
      } else {
        setError(data.error || 'Failed to resend verification email.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (autoVerifying) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Verifying Email...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ICSRT
            </Link>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-md mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {t('verification.title') || 'Verify Your Email'}
            </h2>
            <p className="text-gray-600 mt-2">
              {t('verification.subtitle') || 'Enter the verification code sent to your email address.'}
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('verification.email') || 'Email Address'}
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('verification.emailPlaceholder') || 'Enter your email address'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('verification.code') || 'Verification Code'}
              </label>
              <input
                type="text"
                name="verificationCode"
                value={form.verificationCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-widest"
                placeholder="ABC123"
                maxLength="6"
                style={{ textTransform: 'uppercase' }}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('verification.codeHelp') || 'Enter the 6-character code from your email'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (t('verification.verifying') || 'Verifying...') : (t('verification.verify') || 'Verify Email')}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('verification.didntReceive') || "Didn't receive the code?"}
            </p>
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {t('verification.resend') || 'Resend verification email'}
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              {t('verification.backToLogin') || 'Back to Login'}
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            {t('verification.instructions.title') || 'Verification Instructions'}
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>{t('verification.instructions.step1') || 'Check your email inbox for a verification message from ICSRT'}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>{t('verification.instructions.step2') || 'Copy the 6-character verification code from the email'}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>{t('verification.instructions.step3') || 'Paste the code in the form above or click the verification link in the email'}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>{t('verification.instructions.step4') || 'Check your spam folder if you don\'t see the email within a few minutes'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
