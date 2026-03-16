import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RefreshButton from '../components/RefreshButton';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Events = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  // Function to fetch events data
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const responseData = await api.get('/api/events');
      // Handle the response structure properly
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else if (responseData && Array.isArray(responseData.data)) {
        setData(responseData.data);
      } else {
        console.warn('Events API returned unexpected format:', responseData);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has view permission for events
  if (!hasPermission('events', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view events.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete event?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;
    try {
      const res = await api.del(`/api/events/${id}`);
      if (res && (res.ok || res.success !== false)) {
        setData(data.filter(item => item._id !== id));
        toast.success('Event deleted.');
      } else {
        toast.error('Failed to delete.');
      }
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
              Events Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage upcoming events and activities</p>
          </div>
          <div className="flex gap-3">
            <RefreshButton onRefresh={fetchEvents} loading={loading} />
            {hasPermission('events', 'create') && (
              <Link 
                to="/events/add" 
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add Event
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <div 
            key={item._id} 
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                📅
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                  {item.title}
                </h2>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">📅</span>
                <span className="font-medium">Date:</span>
                <span>{item.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">📍</span>
                <span className="font-medium">Location:</span>
                <span>{item.location}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              {hasPermission('events', 'edit') && (
                <Link 
                  to={`/events/edit/${item._id}`} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Edit
                </Link>
              )}
              {hasPermission('events', 'delete') && (
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

export default Events;