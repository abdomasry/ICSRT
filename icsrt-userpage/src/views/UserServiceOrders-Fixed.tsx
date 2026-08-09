'use client';
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { api } from "../lib/api";

const UserServiceOrders = () => {
  const { user } = useUser();
  
  const [serviceOrders, setServiceOrders] = useState([
    {
      _id: 'demo-order-1',
      orderNumber: 'ORD-2024-001',
      serviceName: 'Conference Registration',
      serviceType: 'conference',
      status: 'completed',
      totalAmount: 350,
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-15T09:00:00Z',
      details: {
        conferenceId: 'ICSRT-2024',
        conferenceName: 'International Conference on Software Research and Technology',
        participantType: 'Regular',
        accommodations: 'Hotel Room (2 nights)',
        dietaryRestrictions: 'Vegetarian'
      }
    },
    {
      _id: 'demo-order-2',
      orderNumber: 'ORD-2024-002',
      serviceName: 'Paper Review Service',
      serviceType: 'review',
      status: 'in-progress',
      totalAmount: 250,
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-10T14:30:00Z',
      details: {
        paperTitle: 'Advanced Machine Learning Techniques in Modern Software Development',
        reviewType: 'Comprehensive Review',
        deadline: '2024-08-01',
        specialRequirements: 'Focus on practical applications'
      }
    },
    {
      _id: 'demo-order-3',
      orderNumber: 'ORD-2024-003',
      serviceName: 'Journal Publication Service',
      serviceType: 'publication',
      status: 'pending',
      totalAmount: 480,
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-05T11:15:00Z',
      details: {
        journalName: 'ICSRT Journal of Software Engineering',
        articleTitle: 'Innovative Approaches to Distributed Systems Architecture',
        authorCount: 3,
        pageCount: 12,
        submissionType: 'Research Article'
      }
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchServiceOrders = async () => {
      setLoading(true);
      
      const userEmail = user?.email || 'demo@icsrt.com';
      console.log('ServiceOrders: Fetching orders for user:', userEmail);

      try {
        const orders = await api.get(`/api/user/service-orders?userEmail=${encodeURIComponent(userEmail)}`);
        if (Array.isArray(orders) && orders.length > 0) {
          setServiceOrders(orders);
          console.log('ServiceOrders: Real data loaded:', orders.length);
        } else {
          console.log('ServiceOrders: Using demo data - no real orders found');
        }
      } catch (error) {
        console.log('ServiceOrders: Fetch failed, using demo data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceOrders();
  }, [user?.email]);

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    switch (statusLower) {
      case 'pending':
      case 'submitted':
      case 'new':
        return '⏳';
      case 'in-progress':
      case 'processing':
      case 'active':
        return '🔄';
      case 'completed':
      case 'finished':
      case 'done':
        return '✅';
      case 'cancelled':
      case 'rejected':
      case 'declined':
        return '❌';
      case 'on-hold':
      case 'paused':
        return '⏸️';
      case 'review':
      case 'reviewing':
        return '👀';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    switch (statusLower) {
      case 'completed':
      case 'finished':
      case 'done':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'in-progress':
      case 'processing':
      case 'active':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'pending':
      case 'submitted':
      case 'new':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'cancelled':
      case 'rejected':
      case 'declined':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'on-hold':
      case 'paused':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      case 'review':
      case 'reviewing':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  const filteredOrders = serviceOrders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

  const getServiceIcon = (serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'conference':
        return '🎓';
      case 'review':
        return '📝';
      case 'publication':
        return '📰';
      case 'consultation':
        return '💬';
      default:
        return '⚙️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Orders</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Track and manage your service orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === status
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} 
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {status === 'all' ? serviceOrders.length : serviceOrders.filter(o => o.status.toLowerCase() === status).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Service Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                onClick={() => openOrderDetails(order)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getServiceIcon(order.serviceType)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {order.serviceName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.orderNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{getStatusIcon(order.status)}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Submitted:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(order.submittedAt)}</span>
                    </div>
                    {order.totalAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ${order.totalAmount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Details Preview */}
                  {order.details && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="space-y-1">
                        {Object.entries(order.details).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}:
                            </span>
                            <span className="text-gray-900 dark:text-white line-clamp-1 max-w-32">
                              {value}
                            </span>
                          </div>
                        ))}
                        {Object.keys(order.details).length > 2 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2">
                            +{Object.keys(order.details).length - 2} more details
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">⚙️</span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No service orders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't placed any service orders yet." 
                : `No ${filter.replace('-', ' ')} orders found.`}
            </p>
            <button
              onClick={() => setFilter('all')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {filter !== 'all' ? 'View all orders' : 'Browse services'}
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getServiceIcon(selectedOrder.serviceType)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedOrder.serviceName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Order #{selectedOrder.orderNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Info */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Order Information
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg">{getStatusIcon(selectedOrder.status)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {formatDate(selectedOrder.submittedAt)}
                        </p>
                      </div>
                      {selectedOrder.totalAmount && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                            ${selectedOrder.totalAmount}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {selectedOrder.userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  {selectedOrder.details && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Service Details
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="space-y-3">
                          {Object.entries(selectedOrder.details).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize font-medium">
                                {key.replace(/([A-Z])/g, ' $1')}:
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white sm:text-right">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Sidebar */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Download Invoice
                    </button>
                    <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                      Contact Support
                    </button>
                    {selectedOrder.status.toLowerCase() === 'pending' && (
                      <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        Cancel Order
                      </button>
                    )}
                  </div>
                  
                  {/* Order Timeline */}
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Order Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Order Submitted</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(selectedOrder.submittedAt)}
                          </p>
                        </div>
                      </div>
                      
                      {selectedOrder.status.toLowerCase() !== 'pending' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Processing Started</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(selectedOrder.submittedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.status.toLowerCase() === 'completed' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Order Completed</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(selectedOrder.submittedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
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

export default UserServiceOrders;
