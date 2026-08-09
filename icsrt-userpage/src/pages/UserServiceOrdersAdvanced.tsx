import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { api } from "../lib/api";

const UserServiceOrdersAdvanced = () => {
  const { user } = useUser();
  
  const [serviceOrders, setServiceOrders] = useState([
    {
      _id: 'demo-order-1',
      orderNumber: 'ORD-2024-001',
      serviceName: 'Conference Registration',
      serviceType: 'conference',
      status: 'completed',
      totalAmount: 350,
      originalAmount: 400,
      discountApplied: 50,
      discountReason: 'Early bird registration',
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-15T09:00:00Z',
      updatedAt: '2024-07-20T14:30:00Z',
      details: {
        conferenceId: 'ICSRT-2024',
        conferenceName: 'International Conference on Software Research and Technology',
        participantType: 'Regular',
        accommodations: 'Hotel Room (2 nights)',
        dietaryRestrictions: 'Vegetarian'
      },
      priceHistory: [
        {
          amount: 400,
          reason: 'Initial quote',
          changedBy: 'system',
          timestamp: '2024-07-15T09:00:00Z'
        },
        {
          amount: 350,
          reason: 'Early bird discount applied',
          changedBy: 'admin',
          timestamp: '2024-07-16T11:00:00Z'
        }
      ],
      messages: [
        {
          id: 'msg-1',
          sender: 'user',
          channel: 'userpage',
          message: 'Thank you for processing my conference registration!',
          timestamp: '2024-07-16T10:00:00Z'
        },
        {
          id: 'msg-2',
          sender: 'support',
          channel: 'userpage',
          message: 'You\'re welcome! We\'ve also applied an early bird discount. Your registration is confirmed.',
          timestamp: '2024-07-16T11:00:00Z'
        }
      ],
      communicationChannels: {
        userpage: true,
        whatsapp: true,
        email: true
      },
      supportContact: {
        whatsapp: '+1-234-567-8900',
        email: 'conference@icsrt.com'
      }
    },
    {
      _id: 'demo-order-2',
      orderNumber: 'ORD-2024-002',
      serviceName: 'Paper Review Service',
      serviceType: 'review',
      status: 'in-progress',
      totalAmount: 200,
      originalAmount: 250,
      discountApplied: 50,
      discountReason: 'Student discount',
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-10T14:30:00Z',
      updatedAt: '2024-07-22T09:15:00Z',
      details: {
        paperTitle: 'Advanced Machine Learning Techniques in Modern Software Development',
        reviewType: 'Comprehensive Review',
        deadline: '2024-08-01',
        specialRequirements: 'Focus on practical applications'
      },
      priceHistory: [
        {
          amount: 250,
          reason: 'Standard review price',
          changedBy: 'system',
          timestamp: '2024-07-10T14:30:00Z'
        },
        {
          amount: 200,
          reason: 'Student discount applied',
          changedBy: 'admin',
          timestamp: '2024-07-11T09:00:00Z'
        }
      ],
      messages: [
        {
          id: 'msg-3',
          sender: 'user',
          channel: 'userpage',
          message: 'When will the review be completed? I need it for submission deadline.',
          timestamp: '2024-07-20T14:00:00Z'
        },
        {
          id: 'msg-4',
          sender: 'support',
          channel: 'userpage',
          message: 'Your paper review is progressing well. We expect to complete it by July 28th, well before your deadline.',
          timestamp: '2024-07-20T16:30:00Z'
        },
        {
          id: 'msg-5',
          sender: 'user',
          channel: 'whatsapp',
          message: 'Perfect! Thank you for the quick response.',
          timestamp: '2024-07-20T17:00:00Z'
        }
      ],
      communicationChannels: {
        userpage: true,
        whatsapp: true,
        email: true
      },
      supportContact: {
        whatsapp: '+1-234-567-8901',
        email: 'review@icsrt.com'
      }
    },
    {
      _id: 'demo-order-3',
      orderNumber: 'ORD-2024-003',
      serviceName: 'Journal Publication Service',
      serviceType: 'publication',
      status: 'pending',
      totalAmount: 480,
      originalAmount: 480,
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-05T11:15:00Z',
      updatedAt: '2024-07-05T11:15:00Z',
      details: {
        journalName: 'ICSRT Journal of Software Engineering',
        articleTitle: 'Innovative Approaches to Distributed Systems Architecture',
        authorCount: 3,
        pageCount: 12,
        submissionType: 'Research Article'
      },
      priceHistory: [
        {
          amount: 480,
          reason: 'Standard publication fee',
          changedBy: 'system',
          timestamp: '2024-07-05T11:15:00Z'
        }
      ],
      messages: [
        {
          id: 'msg-6',
          sender: 'user',
          channel: 'email',
          message: 'I submitted my article for publication. When can I expect the initial review?',
          timestamp: '2024-07-06T09:00:00Z'
        }
      ],
      communicationChannels: {
        userpage: true,
        whatsapp: false,
        email: true
      },
      supportContact: {
        whatsapp: null,
        email: 'journal@icsrt.com'
      }
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showCommunicationOptions, setShowCommunicationOptions] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('userpage');

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
    setShowPriceHistory(false);
    setShowCommunicationOptions(false);
    setNewMessage('');
    setSelectedChannel('userpage');
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
    setShowPriceHistory(false);
    setShowCommunicationOptions(false);
    setNewMessage('');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage || !selectedOrder) return;
    
    setSendingMessage(true);
    
    try {
      const messageObj = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        channel: selectedChannel,
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Update the order in state
      setServiceOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === selectedOrder._id 
            ? { 
                ...order, 
                messages: [...order.messages, messageObj],
                updatedAt: new Date().toISOString()
              }
            : order
        )
      );
      
      // Update selected order
      setSelectedOrder(prev => ({
        ...prev,
        messages: [...prev.messages, messageObj],
        updatedAt: new Date().toISOString()
      }));
      
      setNewMessage('');
      
      // Simulate channel-specific actions
      if (selectedChannel === 'whatsapp') {
        setTimeout(() => {
          const autoReply = {
            id: `msg-${Date.now() + 1}`,
            sender: 'support',
            channel: 'whatsapp',
            message: 'Thanks for your WhatsApp message! We\'ll respond shortly.',
            timestamp: new Date().toISOString()
          };
          
          setServiceOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === selectedOrder._id 
                ? { ...order, messages: [...order.messages, autoReply] }
                : order
            )
          );
          
          setSelectedOrder(prev => ({
            ...prev,
            messages: [...prev.messages, autoReply]
          }));
        }, 2000);
      }
      
      console.log(`Message sent via ${selectedChannel}:`, messageObj);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const openWhatsApp = (order) => {
    if (order.supportContact?.whatsapp) {
      const message = encodeURIComponent(`Hi! I'm contacting about my service order ${order.orderNumber} - ${order.serviceName}. `);
      const whatsappUrl = `https://wa.me/${order.supportContact.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const openEmail = (order) => {
    if (order.supportContact?.email) {
      const subject = encodeURIComponent(`Service Order ${order.orderNumber} - ${order.serviceName}`);
      const body = encodeURIComponent(`Dear ICSRT Support Team,\n\nI am writing regarding my service order:\n\nOrder Number: ${order.orderNumber}\nService: ${order.serviceName}\nStatus: ${order.status}\n\nMessage:\n\n\nBest regards,\n${user?.name || 'Customer'}`);
      const emailUrl = `mailto:${order.supportContact.email}?subject=${subject}&body=${body}`;
      window.location.href = emailUrl;
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'userpage':
        return '💻';
      case 'whatsapp':
        return '📱';
      case 'email':
        return '📧';
      default:
        return '💬';
    }
  };

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

  const filteredOrders = serviceOrders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter.toLowerCase();
  });

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
            Track, communicate, and manage your service orders with multi-channel support
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
                      {order.messages && order.messages.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                          {order.messages.length} msg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Price Information */}
                  <div className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Price:</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${order.totalAmount}
                      </span>
                    </div>
                    {order.originalAmount && order.originalAmount !== order.totalAmount && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Original:</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ${order.originalAmount}
                        </span>
                      </div>
                    )}
                    {order.discountApplied && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Discount:</span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          -${order.discountApplied}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Communication Channels */}
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      {order.communicationChannels?.userpage && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          💻 Chat
                        </span>
                      )}
                      {order.communicationChannels?.whatsapp && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          📱 WhatsApp
                        </span>
                      )}
                      {order.communicationChannels?.email && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          📧 Email
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Submitted:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(order.submittedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Update:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(order.updatedAt)}</span>
                    </div>
                  </div>
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

      {/* Enhanced Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
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
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-4 mt-4">
                <button
                  onClick={() => setShowPriceHistory(!showPriceHistory)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <span>💰</span>
                  <span>Price History</span>
                </button>
                <button
                  onClick={() => setShowCommunicationOptions(!showCommunicationOptions)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                >
                  <span>💬</span>
                  <span>Communication</span>
                </button>
                {selectedOrder.communicationChannels?.whatsapp && (
                  <button
                    onClick={() => openWhatsApp(selectedOrder)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                  >
                    <span>📱</span>
                    <span>WhatsApp</span>
                  </button>
                )}
                {selectedOrder.communicationChannels?.email && (
                  <button
                    onClick={() => openEmail(selectedOrder)}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800"
                  >
                    <span>📧</span>
                    <span>Email</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Order Info */}
                <div className="lg:col-span-2">
                  {/* Price Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Pricing Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${selectedOrder.totalAmount}
                        </p>
                      </div>
                      {selectedOrder.originalAmount && selectedOrder.originalAmount !== selectedOrder.totalAmount && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Original Price</p>
                          <p className="text-xl text-gray-500 dark:text-gray-400 line-through">
                            ${selectedOrder.originalAmount}
                          </p>
                        </div>
                      )}
                      {selectedOrder.discountApplied && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Discount</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            -${selectedOrder.discountApplied}
                          </p>
                          {selectedOrder.discountReason && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {selectedOrder.discountReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price History */}
                  {showPriceHistory && selectedOrder.priceHistory && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Price Change History
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.priceHistory.map((change, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${change.amount}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {change.reason}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(change.timestamp)}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                by {change.changedBy}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Communication Options */}
                  {showCommunicationOptions && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Communication Channels
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {selectedOrder.communicationChannels?.userpage && (
                          <div className="text-center p-4 bg-white dark:bg-gray-600 rounded-lg">
                            <span className="text-3xl block mb-2">💻</span>
                            <p className="font-medium text-gray-900 dark:text-white">Userpage Chat</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Live messaging</p>
                          </div>
                        )}
                        {selectedOrder.communicationChannels?.whatsapp && (
                          <div className="text-center p-4 bg-white dark:bg-gray-600 rounded-lg">
                            <span className="text-3xl block mb-2">📱</span>
                            <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedOrder.supportContact?.whatsapp}
                            </p>
                          </div>
                        )}
                        {selectedOrder.communicationChannels?.email && (
                          <div className="text-center p-4 bg-white dark:bg-gray-600 rounded-lg">
                            <span className="text-3xl block mb-2">📧</span>
                            <p className="font-medium text-gray-900 dark:text-white">Email</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {selectedOrder.supportContact?.email}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Order Details
                    </h3>
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
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {formatDate(selectedOrder.updatedAt)}
                        </p>
                      </div>
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
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Service Details
                      </h3>
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
                  )}
                </div>

                {/* Messages Sidebar */}
                <div className="flex flex-col h-96 lg:h-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Messages ({selectedOrder.messages?.length || 0})
                  </h3>
                  
                  {/* Channel Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Send via:
                    </label>
                    <select
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {selectedOrder.communicationChannels?.userpage && (
                        <option value="userpage">💻 Userpage Chat</option>
                      )}
                      {selectedOrder.communicationChannels?.whatsapp && (
                        <option value="whatsapp">📱 WhatsApp</option>
                      )}
                      {selectedOrder.communicationChannels?.email && (
                        <option value="email">📧 Email</option>
                      )}
                    </select>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {selectedOrder.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs">{getChannelIcon(message.channel)}</span>
                            <span className="font-medium text-xs">
                              {message.sender === 'user' ? 'You' : 'Support'}
                            </span>
                            <span className={`text-xs ${
                              message.sender === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  {selectedOrder.status.toLowerCase() !== 'cancelled' && (
                    <div className="space-y-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Type your message here... (will be sent via ${selectedChannel})`}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                        rows={3}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {sendingMessage ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>{getChannelIcon(selectedChannel)}</span>
                            <span>Send via {selectedChannel}</span>
                          </>
                        )}
                      </button>
                    </div>
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

export default UserServiceOrdersAdvanced;
