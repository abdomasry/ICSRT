import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const AddRole = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  // Available sections and their permissions
  const availableSections = {
    'dashboard': { label: 'Dashboard', permissions: ['view'] },
    'users': { label: 'User Management', permissions: ['view', 'create', 'edit', 'delete'] },
    'papers': { label: 'Articles (Papers)', permissions: ['view', 'create', 'edit', 'delete'] },
    'services': { label: 'Services', permissions: ['view', 'create', 'edit', 'delete'] },
    'events': { label: 'Events', permissions: ['view', 'create', 'edit', 'delete'] },
    'testimonials': { label: 'Testimonials', permissions: ['view', 'create', 'edit', 'delete'] },
    'faq': { label: 'FAQ', permissions: ['view', 'create', 'edit', 'delete'] },
    'contacts': { label: 'Contact Information', permissions: ['view', 'create', 'edit', 'delete'] },
    'registrations': { label: 'Registrations', permissions: ['view', 'create', 'edit', 'delete'] },
    'service-orders': { label: 'Service Orders', permissions: ['view', 'create', 'edit', 'delete'] },
    'newsletter-subscribers': { label: 'Newsletter', permissions: ['view', 'create', 'edit', 'delete'] },
    'about': { label: 'About', permissions: ['view', 'create', 'edit', 'delete'] },
    'mission': { label: 'Mission', permissions: ['view', 'create', 'edit', 'delete'] },
  'vision': { label: 'Vision', permissions: ['view', 'create', 'edit', 'delete'] },
  'coupons': { label: 'Coupons', permissions: ['view', 'create', 'edit', 'delete'] }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePermissionChange = (section, permission) => {
    const updatedPermissions = { ...form.permissions };
    
    if (!updatedPermissions[section]) {
      updatedPermissions[section] = [];
    }

    if (updatedPermissions[section].includes(permission)) {
      updatedPermissions[section] = updatedPermissions[section].filter(p => p !== permission);
      if (updatedPermissions[section].length === 0) {
        delete updatedPermissions[section];
      }
    } else {
      updatedPermissions[section].push(permission);
    }

    setForm({ ...form, permissions: updatedPermissions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/api/roles', {
        ...form,
        createdAt: new Date().toISOString(),
        createdBy: 'super_admin'
      });
      if (res) {
        toast.success('Role created successfully!');
        navigate('/roles');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred while creating role.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPermissions = () => {
    return Object.values(form.permissions).reduce((total, perms) => total + perms.length, 0);
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Add New Role</h1>
          <p className="text-gray-600 mt-1">Create a custom role with specific permissions</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="e.g., Content Editor, Moderator"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Permissions: {getTotalPermissions()}
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                {getTotalPermissions()} permission(s) selected
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe what this role is for and its responsibilities..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Permissions Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Section Permissions *
            </label>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(availableSections).map(([sectionKey, section]) => (
                  <div key={sectionKey} className="bg-white rounded-lg border p-4">
                    <h4 className="font-medium text-gray-800 mb-3">{section.label}</h4>
                    <div className="space-y-2">
                      {section.permissions.map(permission => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(form.permissions[sectionKey] || []).includes(permission)}
                            onChange={() => handlePermissionChange(sectionKey, permission)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm capitalize text-gray-700">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              disabled={isLoading || !form.name || getTotalPermissions() === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRole;
