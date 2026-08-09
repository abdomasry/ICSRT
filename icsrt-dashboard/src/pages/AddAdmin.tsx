import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';

const AddAdmin = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    phone: '',
    type: 'admin',
    roleId: '',
    permissions: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await api.get('/api/roles');
      setRoles(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const adminData = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        type: form.type,
        role_id: form.roleId, // Store as role_id for lookup
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      };

  await api.post('/api/admins', adminData);
  toast.success('Admin added successfully!');
  navigate('/admins');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred while adding admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name *</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter admin's full name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              placeholder="admin@example.com" 
              value={form.email} 
              onChange={handleChange} 
              required 
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Password *</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
            <p className="text-sm text-gray-500 mt-1">Password will be stored as plain text (simple setup)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="+1234567890" 
              value={form.phone} 
              onChange={handleChange} 
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Admin Type *</label>
            <select 
              name="type" 
              value={form.type} 
              onChange={handleChange} 
              required 
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Super Admin can manage all sections including other admins. Regular Admin has limited access.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Role {form.type !== 'super_admin' ? '*' : '(Optional for Super Admin)'}
            </label>
            {loadingRoles ? (
              <div className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500">
                Loading roles...
              </div>
            ) : (
              <select 
                name="roleId" 
                value={form.roleId} 
                onChange={handleChange} 
                required={form.type !== 'super_admin'}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
              >
                <option value="">
                  {form.type === 'super_admin' ? 'No role required (Super Admin)' : 'Select a role...'}
                </option>
                {roles.filter(role => role.name !== 'super_admin').map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name} - {role.description || 'No description'}
                  </option>
                ))}
              </select>
            )}
            {form.type !== 'super_admin' && (
              <p className="text-sm text-gray-500 mt-1">
                Role defines which sections this admin can access. 
                <a href="/roles" target="_blank" className="text-blue-600 hover:text-blue-800 ml-1">
                  Manage Roles →
                </a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Permissions/Notes</label>
            <textarea 
              name="permissions" 
              placeholder="Enter specific permissions or notes about this admin's role" 
              value={form.permissions} 
              onChange={handleChange} 
              rows={3}
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" 
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Adding...' : 'Add Admin'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admins')}
              disabled={isLoading}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold transition-colors disabled:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
