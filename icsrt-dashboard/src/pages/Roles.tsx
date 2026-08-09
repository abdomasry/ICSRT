import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/roles');
      setRoles(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id) => {
    const ok = await confirm({ title: 'Delete role?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await api.del(`/api/roles/${id}`);
      setRoles(roles.filter(role => role._id !== id));
      toast.success('Role deleted successfully!');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error deleting role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🛡️ Role Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage administrative roles and user permissions</p>
          </div>
          <Link
            to="/roles/add"
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Add New Role
          </Link>
        </div>
      </div>

      {roles.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-12 text-center">
          <div className="text-6xl mb-6">🛡️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Roles Found</h3>
          <p className="text-gray-600 mb-8 text-lg">Get started by creating your first administrative role</p>
          <Link
            to="/roles/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <span className="text-xl">➕</span>
            Create First Role
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role._id} className="group bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🛡️</span>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                        {role.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                      {role.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/roles/edit/${role._id}`}
                      className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-600"
                      title="Edit Role"
                    >
                      ✏️
                    </Link>
                    {role.name !== 'super_admin' && (
                      <button
                        onClick={() => deleteRole(role._id)}
                        className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600"
                        title="Delete Role"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50/80 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📝</span>
                      <p className="text-sm font-semibold text-gray-700">Description</p>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {role.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔒</span>
                      <span className="text-sm font-semibold text-gray-700">Permissions</span>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full text-sm font-semibold">
                      {role.permissions ? Object.keys(role.permissions).length : 0}
                    </span>
                  </div>

                  {role.createdAt && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                      <span className="text-sm">📅</span>
                      <span className="text-xs text-gray-500">
                        Created: {new Date(role.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Roles;
