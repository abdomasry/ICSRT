import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import PhoneInput from "../components/PhoneInput";
import { api } from "../lib/api";

const UserProfile = () => {
  const { user, updateUser, isLoggedIn } = useUser();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    bio: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Pre-populate form with user data
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        institution: user.institution || "",
        bio: user.bio || ""
      });
    }
  }, [user, isLoggedIn, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePwChange = (e) => {
    setPw({ ...pw, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    
    try {
      // Only send fields that backend allows and won't break identity
      const payload = {
        fullName: form.fullName,
        // Keep email consistent; if you want to change email, do it via a dedicated flow
        email: form.email?.toLowerCase(),
        phone: form.phone,
        institution: form.institution,
        bio: form.bio,
      };
  const res = await api.put(`/api/users/${user._id}`, payload);
      if (res && res.success !== false) {
        const updated = res.user || res.data || null;
        if (updated) {
          updateUser(updated);
        } else {
          // Fallback: re-fetch user from API
          try { await api.get(`/api/users/${user._id}`).then(updateUser); } catch {}
        }
        setMessage("Profile updated successfully!");
      } else {
        setError(res?.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div>Redirecting to login...</div>;
  }

  return (
  <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2 text-center">
            {t('profile.title')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
            {t('profile.info')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder={t('profile.placeholder.name')}
              value={form.fullName}
              onChange={handleChange}
              required
              className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <input
              type="email"
              name="email"
              placeholder={t('profile.email')}
              value={form.email}
              onChange={handleChange}
              required
              className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <PhoneInput
              value={form.phone}
              onChange={handleChange}
              placeholder={t('profile.placeholder.phone')}
              name="phone"
              id="phone"
            />
            <input
              type="text"
              name="institution"
              placeholder={t('profile.placeholder.institution')}
              value={form.institution}
              onChange={handleChange}
              className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <textarea
              name="bio"
              placeholder={t('profile.placeholder.bio')}
              value={form.bio}
              onChange={handleChange}
              rows="4"
              className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-3 rounded-lg font-semibold shadow transition disabled:opacity-50"
            >
              {loading ? t('profile.loading') : t('profile.save')}
            </button>
          </form>
          
          {message && (
            <div className="mt-6 text-green-600 dark:text-green-400 text-center font-semibold">
              {t('profile.success')}
            </div>
          )}
          {error && (
            <div className="mt-6 text-red-600 dark:text-red-400 text-center font-semibold">
              {t('profile.error')}
            </div>
          )}

          <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">{t('profile.changePassword.title') || 'Change Password'}</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPwMsg('');
                setPwErr('');
                if (!pw.currentPassword || !pw.newPassword) { setPwErr('Missing fields'); return; }
                if (pw.newPassword !== pw.confirmPassword) { setPwErr(t('signup.password.match')); return; }
                try {
                  const res = await api.post('/api/auth/change-password', {
                    email: form.email || user.email,
                    currentPassword: pw.currentPassword,
                    newPassword: pw.newPassword
                  });
                  if (res && res.success !== false) {
                    setPwMsg(t('profile.passwordChanged') || 'Password changed successfully');
                    setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  } else {
                    setPwErr(res?.error || (t('profile.passwordError') || 'Failed to change password'));
                  }
                } catch (e) {
                  setPwErr(t('profile.passwordError') || 'Failed to change password');
                }
              }}
              className="space-y-4"
            >
              <input
                type="password"
                name="currentPassword"
                placeholder={t('profile.currentPassword') || 'Current Password'}
                value={pw.currentPassword}
                onChange={handlePwChange}
                className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              />
              <input
                type="password"
                name="newPassword"
                placeholder={t('profile.newPassword') || 'New Password'}
                value={pw.newPassword}
                onChange={handlePwChange}
                className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder={t('profile.confirmPassword') || 'Confirm New Password'}
                value={pw.confirmPassword}
                onChange={handlePwChange}
                className={`w-full border border-blue-200 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 text-white py-3 rounded-lg font-semibold shadow transition"
              >
                {t('profile.changePassword') || 'Change Password'}
              </button>
            </form>
            {pwMsg && (
              <div className="mt-4 text-green-600 dark:text-green-400 text-center font-semibold">{pwMsg}</div>
            )}
            {pwErr && (
              <div className="mt-4 text-red-600 dark:text-red-400 text-center font-semibold">{pwErr}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
