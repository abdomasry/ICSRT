'use client';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaDownload, FaPhone, FaEnvelope, FaUser, FaCalendar, FaBook, FaGraduationCap, FaFileAlt, FaClock } from 'react-icons/fa';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const ViewServiceOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const confirm = useConfirm();

  useEffect(() => {
    fetchServiceOrder();
  }, [id]);

  const fetchServiceOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.get(`/api/service-orders/${id}`);
      console.log('Service Order details:', data);
      
      // Handle single order response
      setOrder(data);
    } catch (err) {
      console.error('Error fetching service order:', err);
      setError(err.message || 'Failed to fetch service order');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Delete service order?', message: 'This action cannot be undone.', confirmText: 'Delete' });
    if (!ok) return;

    try {
      await api.del(`/api/service-orders/${id}`);
      toast.success('Service order deleted successfully');
      navigate('/service-orders');
    } catch (err) {
      console.error('Error deleting service order:', err);
      toast.error('Failed to delete service order');
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await api.put(`/api/service-orders/${id}`, { status: newStatus });

      // Update local state
      setOrder(prev => ({ ...prev, status: newStatus }));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceTypeColor = (serviceType) => {
    switch (serviceType) {
      case 'research': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'translation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'editing': return 'bg-green-100 text-green-800 border-green-200';
      case 'consultation': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading service order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Service Order</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-3">
              <button 
                onClick={fetchServiceOrder}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <Link 
                to="/service-orders"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors inline-block"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">📄</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Service Order Not Found</h2>
            <p className="text-gray-600 mb-4">The requested service order could not be found.</p>
            <Link 
              to="/service-orders"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/service-orders"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Service Orders
              </Link>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/service-orders/edit/${order._id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaEdit />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Service Order Details</h1>
                <p className="text-blue-100 mt-1">Order ID: {order._id}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status || 'pending'}
                </div>
                <div className="text-blue-100 text-sm mt-2">
                  Submitted: {formatDate(order.submittedAt || order.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-6 space-y-8">
            {/* Customer Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaUser className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Full Name</span>
                  </div>
                  <p className="text-lg text-gray-800">{order.fullName || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaEnvelope className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Email</span>
                  </div>
                  <p className="text-lg text-gray-800">{order.email || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaPhone className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Phone</span>
                  </div>
                  <p className="text-lg text-gray-800">{order.phone || 'Not provided'}</p>
                </div>
              </div>
            </section>

            {/* Service Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaBook className="mr-2 text-blue-600" />
                Service Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Service Type</span>
                  </div>
                  <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getServiceTypeColor(order.serviceType)}`}>
                    {order.serviceType || 'Not specified'}
                  </div>
                </div>
              </div>
            </section>

            {/* Project Details */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaFileAlt className="mr-2 text-blue-600" />
                Project Details
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {order.projectDetails || 'No project details provided'}</p>
              </div>
            </section>

            {/* Uploaded Files / Attachments */}
            {order.attachments && order.attachments.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaDownload className="mr-2 text-blue-600" />
                  Uploaded Files ({order.attachments.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.attachments.map((file, index) => {
                    // Extract filename from URL or use stored filename
                    const filename = file.filename || file.url?.split('/').pop() || file.originalName;
                    const downloadUrl = `/api/download/${filename}`;
                    
                    return (
                      <a
                        key={index}
                        href={downloadUrl}
                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                      >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center text-2xl">
                        {file.mimetype?.startsWith('image/') ? '🖼️' : 
                         file.mimetype?.includes('pdf') ? '📄' :
                         file.mimetype?.includes('word') || file.mimetype?.includes('document') ? '📝' :
                         file.mimetype?.includes('sheet') || file.mimetype?.includes('excel') ? '📊' :
                         file.mimetype?.includes('presentation') || file.mimetype?.includes('powerpoint') ? '📽️' :
                         '📎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate group-hover:text-blue-600">
                          {file.originalName || file.filename}
                        </div>
                        <div className="text-sm text-gray-500">
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          {file.uploadedAt && (
                            <> • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <FaDownload className="text-gray-400 group-hover:text-blue-600 text-lg" />
                      </div>
                    </a>
                  );})}
                </div>
              </section>
            )}

            {/* Timeline Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-2 text-blue-600" />
                Timeline Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaClock className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Submitted At</span>
                  </div>
                  <p className="text-lg text-gray-800">{formatDate(order.submittedAt || order.createdAt)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaClock className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  </div>
                  <p className="text-lg text-gray-800">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </section>

            {/* Status Management */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Status Management</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Status</p>
                    <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Update Status</p>
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Information */}
            {(order.userId || order.userEmail) && (
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {order.userId && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">User ID</span>
                      </div>
                      <p className="text-lg text-gray-800 font-mono">{order.userId}</p>
                    </div>
                  )}
                  {order.userEmail && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">User Email</span>
                      </div>
                      <p className="text-lg text-gray-800">{order.userEmail}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewServiceOrder;
