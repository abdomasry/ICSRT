import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RefreshButton from '../components/RefreshButton';

const Admins = () => {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/admins');
      if (res.ok) {
        const responseData = await res.json();
        // Handle the response structure properly
        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (responseData && Array.isArray(responseData.data)) {
          setData(responseData.data);
        } else {
          console.warn('Admins API returned unexpected format:', responseData);
          setData([]);
        }
      } else {
        console.error('Failed to fetch admins');
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admins/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(data.filter(item => item._id !== id));
        setSelected(null);
        alert('Admin deleted.');
      } else {
        alert('Failed to delete admin.');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred while deleting.');
    }
  };

  const getAdminTypeColor = (type) => {
    return type === 'super_admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getAdminTypeLabel = (type) => {
    return type === 'super_admin' ? 'Super Admin' : 'Admin';
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen p-6 bg-gray-100">
        <div className="text-center py-8">Loading admins...</div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Management
            </h1>
            <p className="text-gray-600 mt-2">Manage administrative users and their permissions</p>
          </div>
          <div className="flex gap-3">
            <RefreshButton onRefresh={fetchAdmins} loading={loading} />
            <Link
              to="/admins/add"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <div
            key={i}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200"
            onClick={() => setSelected(item)}
          >            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  👤
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-md ${getAdminTypeColor(item.type)}`}>
                    {getAdminTypeLabel(item.type)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-600 text-sm">📧 {item.email}</p>
                {item.phone && (
                  <p className="text-gray-600 text-sm">📱 {item.phone}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 mt-4 text-sm">
                <Link 
                  to={`/admins/edit/${item._id}`} 
                  className="text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} 
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No admins found. Add the first admin to get started.
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] overflow-auto relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
            >
              ✕
            </button>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-blue-700 mb-3">{selected.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAdminTypeColor(selected.type)}`}>
                  {getAdminTypeLabel(selected.type)}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Admin Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{selected.email}</span>
                  </div>
                  {selected.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold">{selected.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin Type:</span>
                    <span className="font-semibold">{getAdminTypeLabel(selected.type)}</span>
                  </div>
                  {selected.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-semibold">{new Date(selected.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selected.permissions && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Permissions</h3>
                  <p className="text-gray-700">{selected.permissions}</p>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Link
                  to={`/admins/edit/${selected._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Admin
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(selected._id);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
