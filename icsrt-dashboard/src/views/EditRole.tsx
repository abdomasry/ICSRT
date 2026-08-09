'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const EditRole = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchRole();
  }, [id]);

  const fetchRole = async () => {
    try {
      setIsLoadingData(true);
  const data = await api.get(`/api/roles/${id}`);
  if (data) {
        const role = data.data || data;
        
        let permissions = role.permissions || {};
        if (typeof permissions === 'string') {
          try {
            permissions = JSON.parse(permissions);
          } catch {
            permissions = {};
          }
        }

        setForm({
          name: role.name || '',
          description: role.description || '',
          permissions: permissions
        });
      } else {
        toast.error('Role not found');
        navigate('/roles');
      }
    } catch (error) {
      console.error('Error fetching role:', error);
      toast.error('Error loading role data');
      navigate('/roles');
    } finally {
      setIsLoadingData(false);
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
  const res = await api.put(`/api/roles/${id}`, {
        ...form,
        updatedAt: new Date().toISOString()
      });
  toast.success('Role updated successfully!');
      navigate('/roles');
    } catch (err) {
      console.error(err);
  toast.error(err.message || 'Error occurred while updating role.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <span>Loading role data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/roles')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Role</h1>
          <p className="text-gray-600 mt-1">Modify role permissions and details</p>
        </div>
      </div>

  <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={form.name === 'super_admin'}
              placeholder="e.g., Content Editor, Moderator"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            {form.name === 'super_admin' && (
              <p className="text-xs text-gray-500 mt-1">Super admin role name cannot be changed</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe what this role is for and its responsibilities..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Permissions
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="space-y-4">
                {['dashboard','users','papers','services','events','testimonials','faq','contacts','registrations','service-orders','newsletter-subscribers','about','mission','vision','coupons'].map(section => (
                  <div key={section} className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium capitalize">{section}</span>
                    <div className="flex gap-2 text-sm">
                      {['view','create','edit','delete'].map(perm => (
                        <label key={perm} className="inline-flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={(form.permissions[section] || []).includes(perm)}
                            onChange={() => {
                              const updated = { ...form.permissions };
                              const list = new Set(updated[section] || []);
                              if (list.has(perm)) list.delete(perm); else list.add(perm);
                              updated[section] = Array.from(list);
                              if (updated[section].length === 0) delete updated[section];
                              setForm(prev => ({ ...prev, permissions: updated }));
                            }}
                          />
                          <span className="capitalize">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total sections: {Object.keys(form.permissions).length}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !form.name}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRole;
