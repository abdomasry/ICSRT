'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call server-side admin login endpoint (handles hashed passwords)
      try {
        const resp = await api.post('/api/auth/admin-login', { email: credentials.username.trim(), password: credentials.password });
        const admin = resp?.user;

        if (resp?.success && resp?.token && admin && ['admin', 'super_admin'].includes(admin.role)) {
          const adminData = {
            username: admin.email || admin.username,
            type: admin.role,
            name: admin.name,
            id: admin._id || admin.id,
            role_id: admin.role_id,
            role_data: admin.role_data || admin.role
          };

          localStorage.setItem('icsrt_admin', JSON.stringify(adminData));
          if (resp.token) localStorage.setItem('adminToken', resp.token);
          onLogin(adminData);

          // Force redirect after login (backup method)
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        } else {
          setError('The server did not return a valid administrator session.');
        }
      } catch (serverErr) {
        console.error('Server connection error:', serverErr);
        setError('Login failed. Check your administrator email and password. If the problem continues, contact support.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ICSRT Dashboard</h1>
          <p className="text-gray-600">Admin Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter your administrator email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
