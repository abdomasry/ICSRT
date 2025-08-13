import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FAQ = () => {
  const [data, setData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const { hasPermission } = useAuth();

  // Check if user has view permission for FAQ
  if (!hasPermission('faq', 'view')) {
    return (
      <div className='pt-16'>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p>You don't have permission to view FAQ.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Fetch FAQ data
    fetch('http://localhost:3000/api/faq')
      .then(res => res.json())
      .then(responseData => {
        // Handle the response structure properly
        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (responseData && Array.isArray(responseData.data)) {
          setData(responseData.data);
        } else {
          console.warn('FAQ API returned unexpected format:', responseData);
          setData([]);
        }
      })
      .catch(console.error);
  }, []);

    const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/faq/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setData(data.filter(item => item._id !== id));
        alert('Question deleted.');
      } else {
        alert('Failed to delete.');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Error deleting question.');
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
              FAQ Management
            </h1>
            <p className="text-gray-600 mt-2">Manage frequently asked questions and their answers</p>
          </div>
          {hasPermission('faq', 'create') && (
            <Link 
              to="/faq/add" 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Question
            </Link>
          )}
        </div>
      </div>

      {/* FAQ Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item, i) => (
          <div
            key={i}
            onClick={() => toggleExpand(i)}
            className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold mb-3 text-gray-800 hover:text-blue-600 transition-colors">
              {item.question}
            </h2>

            {expandedIndex === i && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Answer</h4>
                <div className="text-sm text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
                  {item.answer}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(i);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                {expandedIndex === i ? 'Show Less' : 'Read Answer'}
              </button>
              
              <div className="flex space-x-3">
                {hasPermission('faq', 'edit') && (
                  <Link
                    to={`/faq/edit/${item._id}`}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                )}
                {hasPermission('faq', 'delete') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
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
};export default FAQ;
