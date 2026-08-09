'use client';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Testimonials = () => {
  const [data, setData] = useState<any[]>([]);
  const toast = useToast();
  const confirm = useConfirm();
  const { hasPermission } = useAuth();

  // Check if user has view permission for testimonials
  if (!hasPermission('testimonials', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view testimonials.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    api
      .get('/api/testimonials')
      .then((responseData) => {
        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (responseData && Array.isArray(responseData.data)) {
          setData(responseData.data);
        } else {
          console.warn('Testimonials API returned unexpected format:', responseData);
          setData([]);
        }
      })
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete testimonial?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;
    try {
  await api.del(`/api/testimonials/${id}`);
      setData(data.filter(item => item._id !== id));
  toast.success('Testimonial deleted.');
    } catch (err) {
      console.error(err);
  toast.error('Error occurred while deleting.');
    }
  };

  return (
    <div className='pt-16 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Testimonials Management
            </h1>
            <p className="text-gray-600 mt-2">Manage customer reviews and testimonials</p>
          </div>
          {hasPermission('testimonials', 'create') && (
            <Link 
              to="/testimonials/add" 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Testimonial
            </Link>
          )}
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                💬
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {item.role}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 italic">
                "{item.message}"
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              {hasPermission('testimonials', 'edit') && (
                <Link 
                  to={`/testimonials/edit/${item._id}`} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Edit
                </Link>
              )}
              {hasPermission('testimonials', 'delete') && (
                <button 
                  onClick={() => handleDelete(item._id)} 
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;