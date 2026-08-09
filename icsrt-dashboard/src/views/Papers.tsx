'use client';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import RefreshButton from '../components/RefreshButton';
import Pagination from '../components/Pagination';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const Papers = () => {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const toast = useToast();
  const confirm = useConfirm();

  // Check if user has permission to view this section
  if (!hasPermission('papers', 'view')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You don't have permission to view articles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      // Fetch from news/articles collection
      const responseData = await api.get('/api/news');
      // Handle the response structure properly
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else if (responseData && Array.isArray(responseData.data)) {
        setData(responseData.data);
      } else {
        console.warn('Articles API returned unexpected format:', responseData);
        setData([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete article?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;

    try {
      const res = await api.del(`/api/news/${id}`);
      if (res && (res.ok || res.success !== false)) {
        setData(data.filter(item => item._id !== id));
        toast.success('Article deleted.');
      } else {
        const errorMsg = res?.error || 'Failed to delete article.';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred while deleting.');
    }
  };

  if (loading) return <div className="text-center py-8">Loading articles...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  // Client-side pagination
  const total = Array.isArray(data) ? data.length : 0;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedData = (Array.isArray(data) ? data : []).slice(startIndex, endIndex);

  return (
    <div className="pt-16 min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Modern Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
            <span className="text-white text-2xl">📰</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Research Articles
            </h1>
            <p className="text-gray-600 mt-1">Manage and publish academic research articles</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Articles: <span className="font-semibold text-blue-600">{total}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <RefreshButton onRefresh={fetchPapers} loading={loading} />
            {hasPermission('papers', 'create') && (
              <Link
                to="/papers/add"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add Article</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pagedData.map((item, i) => (
          <div
            key={item._id || i}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
            onClick={() => setSelectedItem(item)}
          >
            {/* Article Image */}
            {item.image && (
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                    (e.target as any).nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden h-48 bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
                  <span className="text-4xl text-white">📰</span>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📄</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-5">
              <h3 className="text-lg font-bold mb-3 text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                {item.excerpt || item.abstract}
              </p>
              
              {/* Article Details */}
              <div className="flex flex-wrap gap-2 mb-4">
                {item.author && (
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    👤 {item.author}
                  </span>
                )}
                {item.category && (
                  <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    📂 {item.category}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex space-x-3">
                  {hasPermission('papers', 'edit') && (
                    <Link 
                      to={`/papers/edit/${item._id}`} 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✏️ Edit
                    </Link>
                  )}
                  {hasPermission('papers', 'delete') && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} 
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  📰 Article
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-all duration-200 z-10"
            >
              ✕
            </button>
            
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Article Image and Details */}
                <div className="space-y-6">
                  {selectedItem.image && (
                    <div className="h-80 overflow-hidden rounded-xl shadow-lg">
                      <img 
                        src={selectedItem.image} 
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Article Details */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">📋</span>
                      </span>
                      Article Details
                    </h3>
                    <div className="space-y-3">
                      {selectedItem.author && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Author:</span>
                          <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                            👤 {selectedItem.author}
                          </span>
                        </div>
                      )}
                      {selectedItem.category && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Category:</span>
                          <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm">
                            📂 {selectedItem.category}
                          </span>
                        </div>
                      )}
                      {selectedItem.publishDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Published:</span>
                          <span className="font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-sm">
                            📅 {new Date(selectedItem.publishDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Article Content */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      {selectedItem.title}
                    </h2>
                    {selectedItem.excerpt && (
                      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                        {selectedItem.excerpt}
                      </p>
                    )}
                  </div>
                  
                  {/* Abstract */}
                  {selectedItem.abstract && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">📄</span>
                        </span>
                        Abstract
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{selectedItem.abstract}</p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-6">
                    {hasPermission('papers', 'edit') && (
                      <Link
                        to={`/papers/edit/${selectedItem._id}`}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>✏️</span>
                        <span>Edit Article</span>
                      </Link>
                    )}
                    {hasPermission('papers', 'delete') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(selectedItem._id);
                          setSelectedItem(null);
                        }}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>🗑️</span>
                        <span>Delete Article</span>
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

export default Papers;
