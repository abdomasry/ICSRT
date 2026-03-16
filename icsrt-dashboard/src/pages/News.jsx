import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RefreshButton from '../components/RefreshButton';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const News = () => {
  const [data, setData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  // Function to fetch news data
  const fetchNews = async () => {
    setLoading(true);
    try {
      const responseData = await api.get('/api/news');
      
      // Handle the response structure properly
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else if (responseData && Array.isArray(responseData.data)) {
        setData(responseData.data);
      } else {
        console.warn('News API returned unexpected format:', responseData);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has view permission for news
  if (!hasPermission('news', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view news.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete news item?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;
    try {
      await api.del(`/api/news/${id}`);
      setData(data.filter(item => item._id !== id));
      toast.success('News deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Error occurred while deleting.');
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className='pt-16 min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              News Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage news articles and announcements</p>
          </div>
          <div className="flex gap-3">
            <RefreshButton onRefresh={fetchNews} loading={loading} />
            {hasPermission('news', 'create') && (
              <Link 
                to="/news/add" 
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                Add News
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <div
            key={i}
            onClick={() => toggleExpand(i)}
            className="bg-white border border-gray-200 rounded-xl shadow-lg cursor-pointer p-6 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          >
                        <h2 className="text-xl font-bold mb-3 text-gray-800 hover:text-blue-600 transition-colors">
              {item.title}
            </h2>
            <p className="text-sm text-gray-500 mb-3 font-medium">
              {new Date(item.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            {expandedIndex === i && (
              <div className="text-sm text-gray-700 mt-4 space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                  <p className="leading-relaxed">{item.summary}</p>
                </div>
                {item.content && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Full Content</h4>
                    <p className="leading-relaxed">{item.content}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(i);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                {expandedIndex === i ? 'Show Less' : 'Read More'}
              </button>
              
              <div className="flex space-x-3">
                {hasPermission('news', 'edit') && (
                  <Link 
                    to={`/news/edit/${item._id}`} 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                )}
                {hasPermission('news', 'delete') && (
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
    </div>
  );
};

export default News;
