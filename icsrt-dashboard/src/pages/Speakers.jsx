import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Speakers = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { hasPermission } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  // Check if user has view permission for speakers
  if (!hasPermission('speakers', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view speakers.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    api
      .get('/api/speakers')
      .then((responseData) => {
        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (responseData && Array.isArray(responseData.data)) {
          setData(responseData.data);
        } else {
          console.warn('Speakers API returned unexpected format:', responseData);
          setData([]);
        }
      })
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete speaker?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await api.del(`/api/speakers/${id}`);
      setData(data.filter(item => item._id !== id));
      toast.success('Speaker deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Error occurred while deleting.');
    }
  };

  return (
    <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-slate-50 to-orange-50 relative">
      {/* Modern Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
            <span className="text-white text-2xl">🎤</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Expert Speakers
            </h1>
            <p className="text-gray-600 mt-1">Manage keynote speakers and academic experts</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Speakers: <span className="font-semibold text-orange-600">{data.length}</span>
            </div>
          </div>
          <div className="flex gap-3">
            {hasPermission('speakers', 'create') && (
              <Link
                to="/speakers/add"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add Speaker</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelectedItem(item)}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">👨‍🏫</span>
                </div>
                <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                  Speaker
                </div>
              </div>
              
              <h2 className="text-lg font-bold mb-3 text-gray-800 line-clamp-1 hover:text-orange-600 transition-colors">
                {item.name}
              </h2>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Title:</span> {item.title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">Country:</span> {item.country}
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex space-x-3">
                  {hasPermission('speakers', 'edit') && (
                    <Link 
                      to={`/speakers/edit/${item._id}`} 
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✏️ Edit
                    </Link>
                  )}
                  {hasPermission('speakers', 'delete') && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} 
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  🎤 Expert
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto relative">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-all duration-200 z-10"
            >
              ✕
            </button>
            
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-2xl">🎤</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {selectedItem.name}
                  </h2>
                  <p className="text-gray-600">Speaker Profile</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Speaker Image */}
                {selectedItem.image && (
                  <div className="h-80 overflow-hidden rounded-xl shadow-lg">
                    <img 
                      src={selectedItem.image} 
                      alt={selectedItem.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Speaker Details */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">👤</span>
                      </span>
                      Professional Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Title:</span>
                        <span className="font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-sm">
                          🎓 {selectedItem.title}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Country:</span>
                        <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
                          🌍 {selectedItem.country}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Biography */}
                  {selectedItem.bio && (
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">📄</span>
                        </span>
                        Biography
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                        {selectedItem.bio}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    {hasPermission('speakers', 'edit') && (
                      <Link
                        to={`/speakers/edit/${selectedItem._id}`}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>✏️</span>
                        <span>Edit Speaker</span>
                      </Link>
                    )}
                    {hasPermission('speakers', 'delete') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(selectedItem._id);
                          setSelectedItem(null);
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>🗑️</span>
                        <span>Delete Speaker</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Speakers;