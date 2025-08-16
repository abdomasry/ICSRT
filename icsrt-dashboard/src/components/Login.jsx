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
      // Check for super admin hardcoded credentials
      if (credentials.username === 'superadmin' && credentials.password === 'superadmin') {
        const adminData = {
          username: 'superadmin',
          type: 'super_admin',
          name: 'Super Administrator'
        };
        localStorage.setItem('icsrt_admin', JSON.stringify(adminData));
        
        // Call onLogin and add a small delay to ensure state update
        onLogin(adminData);
        
        // Force redirect after login (backup method)
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        
        return;
      }

      // Check against database admins (only if server is running)
      try {
        const data = await api.get('/api/admins');
        const admins = Array.isArray(data) ? data : (data?.data || []);
          
          const admin = admins.find(a => {
            return (
              (a.email === credentials.username || 
               a.name === credentials.username ||
               a.username === credentials.username) && 
              a.password === credentials.password
            );
          });

          if (admin) {
            // Fetch role data if admin has a role_id
            let roleData = null;
            if (admin.role_id) {
              try {
                const roleResult = await api.get(`/api/roles/${admin.role_id}`);
                roleData = roleResult.data || roleResult;
              } catch (roleErr) {
                console.error('Error fetching role data:', roleErr);
              }
            } else if (admin.role) {
              // Handle old data structure where role was stored directly
              roleData = admin.role;
            }

            const adminData = {
              username: admin.email || admin.username,
              type: admin.type || 'admin',
              name: admin.name,
              id: admin._id,
              role_id: admin.role_id,
              role_data: roleData
            };
            
            localStorage.setItem('icsrt_admin', JSON.stringify(adminData));
            onLogin(adminData);
            
            // Force redirect after login (backup method)
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          } else {
            setError('Invalid username or password');
          }
      } catch (serverErr) {
        console.error('Server connection error:', serverErr);
        setError('Unable to connect to server. Please make sure the backend is running on port 3000.');
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
              Username/Email
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter your username or email"
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
