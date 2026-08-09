import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RefreshButton from '../components/RefreshButton';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Services = () => {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  const parseFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features.map(String).filter(Boolean);
    if (typeof features === 'string') {
      const text = features.replace(/\r\n/g, '\n');
      return text.split(/[\n,•,]+/).map(s => s.trim()).filter(Boolean);
    }
    return [String(features)];
  };

  // Function to fetch services data
  const fetchServices = async () => {
    setLoading(true);
    try {
      const responseData = await api.get('/api/services');
      
      // Handle the response structure properly
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else if (responseData && Array.isArray(responseData.data)) {
        setData(responseData.data);
      } else {
        console.warn('Services API returned unexpected format:', responseData);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission to view this section
  if (!hasPermission('services', 'view')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You don't have permission to view services.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete service?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await api.del(`/api/services/${id}`);
      setData(data.filter(item => item._id !== id));
      toast.success('Service deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Error occurred while deleting.');
    }
  };

  return (
    <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Services Management
            </h1>
            <p className="text-gray-600 mt-2">Manage your service offerings and configurations</p>
          </div>
          <div className="flex gap-3">
            {/* Refresh Button */}
            <RefreshButton onRefresh={fetchServices} loading={loading} />
            
            {hasPermission('services', 'create') && (
              <Link
                to="/services/add"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add Service
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <div
            key={i}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200"
            onClick={() => setSelected(item)}
          >
            {/* Service Image */}
    {(item.image || item.imageUrl) && (
              <div className="h-48 overflow-hidden relative">
                <img 
      src={item.image || item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                    (e.target as any).nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden h-48 bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
                  <span className="text-4xl text-white">🔧</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                {item.description}
              </p>
              
              {/* Service Details */}
              <div className="flex justify-between items-center text-sm mb-4">
                {item.price && (
                  <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full font-semibold">
                    {item.price}
                  </span>
                )}
                {item.duration && (
                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full">
                    {item.duration}
                  </span>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                {hasPermission('services', 'edit') && (
                  <Link 
                    to={`/services/edit/${item._id}`} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                )}
                {hasPermission('services', 'delete') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} 
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto relative border border-gray-200">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-red-500 text-2xl z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
            >
              ✕
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Service Image & Details */}
              <div className="space-y-6">
        {(selected.image || selected.imageUrl) && (
                  <div className="h-72 overflow-hidden rounded-xl shadow-lg">
                    <img 
          src={selected.image || selected.imageUrl} 
                      alt={selected.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Service Details Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">Service Details</h3>
                  <div className="space-y-3">
                    {selected.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Price:</span>
                        <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          {selected.price}
                        </span>
                      </div>
                    )}
                    {selected.duration && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Duration:</span>
                        <span className="font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          {selected.duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Service Content */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {selected.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{selected.description}</p>
                </div>
                
                {/* Features */}
        {selected.features && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-gray-800 mb-4 text-lg">Key Features</h3>
                    <div className="space-y-3">
            {parseFeatures(selected.features).map((feature, i) => (
                        <div key={i} className="flex items-center">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4 flex-shrink-0"></div>
              <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  {hasPermission('services', 'edit') && (
                    <Link
                      to={`/services/edit/${selected._id}`}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Edit Service
                    </Link>
                  )}
                  {hasPermission('services', 'delete') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(selected._id);
                        setSelected(null);
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Delete Service
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;