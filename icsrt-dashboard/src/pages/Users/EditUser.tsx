import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const EditUser = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    name: '',
    email: '',
    phone: '',
    institution: '',
    country: '',
    userType: '',
    bio: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = await api.get(`/api/users/${id}`);
      setForm({
        fullName: user.fullName || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        institution: user.institution || '',
        country: user.country || '',
        userType: user.userType || '',
        bio: user.bio || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        institution: form.institution,
        country: form.country,
        userType: form.userType,
        status: form.isActive ? 'active' : 'inactive'
      };
      const data = await api.put(`/api/users/${id}`, payload);
  toast.success('User updated successfully!');
      navigate('/users');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
  toast.error(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading user...</div>
      </div>
    );
  }

  if (error && !form.email) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/users')}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Edit User</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name (Alternative)
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Institution
            </label>
            <input
              type="text"
              name="institution"
              value={form.institution}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              User Type
            </label>
            <select
              name="userType"
              value={form.userType}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
                <option value="">Select User Type *</option>
                <option value="student_academic">Student / Academic</option>
                <option value="researcher_professional">Researcher / Professional</option>
            </select>
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              disabled={saving}
              className="mr-2"
            />
            <label className="text-gray-700 text-sm font-bold">
              Active User
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="User biography or additional information..."
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-400"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
