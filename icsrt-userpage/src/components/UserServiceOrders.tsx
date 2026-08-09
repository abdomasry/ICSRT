import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaComments, FaPaperPlane, FaEye, FaClock, FaDollarSign,
  FaCheckCircle, FaExclamationTriangle, FaSpinner,
  FaTag
} from 'react-icons/fa';
import { api } from '../lib/api';

const UserServiceOrders = () => {
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, conversation
  
  // Messaging state
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // User info (this should come from your auth context)
  const [userInfo] = useState({
    email: 'user@example.com', // Replace with actual user email from auth
    name: 'John Doe' // Replace with actual user name from auth
  });

  const fetchServiceOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get(`/api/user/service-orders?userEmail=${encodeURIComponent(userInfo.email)}`);
      if (Array.isArray(data)) {
        setServiceOrders(data || []);
      } else if (data && data.success && Array.isArray(data.orders)) {
        setServiceOrders(data.orders || []);
      } else if (data && Array.isArray(data.data)) {
        setServiceOrders(data.data || []);
      } else if (data && data.success === false) {
        setError(data.error || 'Failed to fetch service orders');
        setServiceOrders([]);
      } else {
        setServiceOrders(Array.isArray(data?.orders) ? data.orders : []);
      }
    } catch (error) {
      console.error('Error fetching service orders:', error);
      setError('Failed to connect to server. Please ensure the server is running.');
      setServiceOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userInfo.email]);

  useEffect(() => {
    fetchServiceOrders();
  }, [fetchServiceOrders]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    
    try {
      setSendingMessage(true);
      
      const res = await api.post(`/api/user/service-orders/${selectedOrder._id}/messages`, {
        message: newMessage,
        userEmail: userInfo.email,
        userName: userInfo.name,
      });
      if (!res || res.success === false) {
        alert('Failed to send message' + (res?.error ? `: ${res.error}` : ''));
      } else {
        setNewMessage('');
        // Refresh the order data to show the new message
        await fetchServiceOrders();
        // Update the selected order
        const updatedOrder = serviceOrders.find(o => o._id === selectedOrder._id);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setActiveTab('details');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setNewMessage('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'on-hold': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="inline" />;
      case 'in-progress': return <FaSpinner className="inline animate-spin" />;
      case 'completed': return <FaCheckCircle className="inline" />;
      case 'cancelled': return <FaExclamationTriangle className="inline" />;
      case 'on-hold': return <FaExclamationTriangle className="inline" />;
      default: return <FaClock className="inline" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-2 text-lg">Loading your service orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold">My Service Orders</h1>
          <p className="text-blue-100">Track your orders and communicate with our team</p>
        </div>

        <div className="p-6">
          {serviceOrders.length === 0 ? (
            <div className="text-center py-8">
              <FaTag className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No service orders found</p>
              <p className="text-gray-500">Your service orders will appear here once you place them.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {serviceOrders.map((order) => (
                <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {order.serviceName || 'Service Order'}
                      </h3>
                      <p className="text-gray-600">Order #{order.orderNumber || order._id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        <FaDollarSign className="inline" />{order.totalAmount || 0}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <FaClock className="inline mr-1" />
                        Submitted: {formatDateTime(order.submittedAt)}
                      </p>
                      {order.lastMessageAt && (
                        <p className="text-sm text-gray-600">
                          <FaComments className="inline mr-1" />
                          Last message: {formatDateTime(order.lastMessageAt)}
                        </p>
                      )}
                    </div>
                    <div>
                      {order.messageStats && (
                        <p className="text-sm text-gray-600">
                          <FaComments className="inline mr-1" />
                          Messages: {order.messageStats.total} 
                          {order.messageStats.unread > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {order.messageStats.unread} unread
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {order.description && (
                    <p className="text-gray-700 mb-4 line-clamp-2">{order.description}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {order.messageStats && order.messageStats.unread > 0 && (
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          New messages from admin
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openOrderModal(order)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FaEye /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedOrder.serviceName}</h2>
                  <p className="text-blue-100">Order #{selectedOrder.orderNumber || selectedOrder._id}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaTag className="inline mr-2" /> Order Details
              </button>
              <button
                onClick={() => setActiveTab('conversation')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'conversation'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaComments className="inline mr-2" /> 
                Conversation 
                {selectedOrder.messageStats && selectedOrder.messageStats.unread > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {selectedOrder.messageStats.unread}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                      <div className="space-y-2">
                        <p><strong>Service:</strong> {selectedOrder.serviceName}</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                          </span>
                        </p>
                        <p><strong>Amount:</strong> <span className="text-green-600 font-semibold">${selectedOrder.totalAmount || 0}</span></p>
                        <p><strong>Submitted:</strong> {formatDateTime(selectedOrder.submittedAt)}</p>
                        {selectedOrder.priceUpdatedAt && (
                          <p><strong>Price Updated:</strong> {formatDateTime(selectedOrder.priceUpdatedAt)}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <p><strong>Email:</strong> {selectedOrder.userEmail || userInfo.email}</p>
                        {selectedOrder.customerInfo && (
                          <>
                            <p><strong>Name:</strong> {selectedOrder.customerInfo.name}</p>
                            <p><strong>Phone:</strong> {selectedOrder.customerInfo.phone}</p>
                            <p><strong>Country:</strong> {selectedOrder.customerInfo.country}</p>
                            <p><strong>Organization:</strong> {selectedOrder.customerInfo.organization}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedOrder.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedOrder.description}</p>
                    </div>
                  )}

                  {/* Requirements */}
                  {selectedOrder.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {typeof selectedOrder.requirements === 'string' ? (
                          <p className="text-gray-700">{selectedOrder.requirements}</p>
                        ) : (
                          <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(selectedOrder.requirements, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'conversation' && (
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    {selectedOrder.messages && selectedOrder.messages.length > 0 ? (
                      <div className="space-y-4">
                        {selectedOrder.messages.map((message, index) => (
                          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : message.sender === 'admin'
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              <div className="text-sm">
                                <strong>{message.senderInfo || message.sender}:</strong>
                              </div>
                              <div className="mt-1">{message.message}</div>
                              <div className="text-xs mt-2 opacity-75">
                                {formatDateTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <FaComments className="text-4xl mx-auto mb-2" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start a conversation with our team!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {sendingMessage ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserServiceOrders;
