import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError('New password must be different from current password.');
      setIsLoading(false);
      return;
    }

    try {
      // Use centralized API helper and backend auth route that accepts email/current/new
      const result = await api.postJson('/api/auth/change-password', {
        email: user?.email,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (result?.success) {
        toast.success('Password changed successfully!');
        navigate('/dashboard');
      } else {
        setError(result?.error || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Require logged-in user context
  if (!user?.email) {
    return (
      <div className="pt-16 min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You must be logged in to change your password.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen p-6 bg-gray-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
            <p className="text-gray-600 mt-1">Update your account password</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaKey className="text-blue-600 text-xl" />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
