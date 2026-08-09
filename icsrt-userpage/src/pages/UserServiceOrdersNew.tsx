import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaComments, FaPaperPlane, FaEye, FaClock, FaDollarSign,
  FaCheckCircle, FaExclamationTriangle, FaSpinner,
  FaTag, FaCreditCard, FaShoppingCart, FaPercent,
  FaLock, FaLink,
  FaArrowLeft, FaHome, FaTachometerAlt
} from 'react-icons/fa';
import { api } from '../lib/api';

const UserServiceOrders = () => {
  const { user } = useUser();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, conversation, purchase
  
  // Messaging state
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Purchase state
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  // Helper function to format currency
  const formatCurrency = (amount, order) => {
    if (!order) return `$${amount}`;
    const currency = order.currency || 'USD';
    const currencySymbols = {
      'USD': '$',
      'EGP': 'EGP ',
      'SAR': 'SAR ',
      'AED': 'AED '
    };
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount}`;
  };

  const fetchServiceOrders = useCallback(async () => {
    if (!user?.email) {
      console.log('UserServiceOrders: No user email available');
      setError('Please log in to view your service orders');
      setServiceOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('UserServiceOrders: Fetching orders for user:', user.email);
  const data = await api.get(`/api/user/service-orders?userEmail=${encodeURIComponent(user.email)}`);
      console.log('UserServiceOrders: API response:', data);
      
      // Handle both response formats: { success: true, orders: [...] } and plain array
      if (Array.isArray(data)) {
        // Plain array format from original server endpoint
        setServiceOrders(data);
        console.log('UserServiceOrders: Loaded', data.length, 'orders (plain array format)');
  } else if (data.success && Array.isArray(data.orders)) {
        // Enhanced API format
        setServiceOrders(data.orders);
        console.log('UserServiceOrders: Loaded', data.orders.length, 'orders (enhanced format)');
      } else if (data.success === false) {
        setError(data.error || 'Failed to fetch service orders');
        setServiceOrders([]);
      } else {
        setError('Unexpected response format from server');
        setServiceOrders([]);
      }
    } catch (error) {
      console.error('UserServiceOrders: Error fetching service orders:', error);
      setError('Failed to connect to server. Please ensure the server is running.');
      setServiceOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchServiceOrders();
    } else if (user === null) {
      // User is not logged in
      setLoading(false);
      setError('Please log in to view your service orders');
    }
  }, [user, fetchServiceOrders]);

  // Purchase-related functions
  const validateCoupon = async (code) => {
    if (!code.trim() || !selectedOrder) return;
    
    setValidatingCoupon(true);
    try {
      const data = await api.post(`/api/user/coupons/validate`, {
        couponCode: code,
        orderAmount: selectedOrder.totalAmount,
      });
      
      if (data.success && data.valid) {
        setAppliedCoupon(data.coupon);
        setPurchaseError('');
      } else {
        setAppliedCoupon(null);
        setPurchaseError(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setPurchaseError('Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const initiatePurchase = async () => {
    if (!selectedOrder || purchaseLoading) return;
    
    setPurchaseLoading(true);
    setPurchaseError('');
    
    try {
      const data = await api.post(`/api/user/service-orders/${selectedOrder._id}/purchase`, {
        userEmail: user.email,
        paymentMethod: 'paymob',
        billingInfo,
        couponCode: appliedCoupon?.code,
        // Paymob requires EGP for card/wallet payments
        currency: 'EGP',
      });
      
      if (data.success) {
  // Refresh order data
        await fetchServiceOrders();
        
  // Close modal and show success
  setShowModal(false);
        if (data.paymentUrl) {
          // Redirect in the same tab to avoid popup blockers
          window.location.href = data.paymentUrl;
          return;
        }
        alert(`Purchase initiated successfully! Payment ID: ${data.paymentId}\n\nAmount: $${data.paymentData.amount}`);
      } else {
        setPurchaseError(data.error || 'Failed to initiate purchase');
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      setPurchaseError('Failed to initiate purchase. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const canPurchase = (order) => {
    return (order.status === 'confirmed' || order.status === 'ready-for-payment') && 
           order.paymentStatus !== 'paid' && 
           order.paymentStatus !== 'completed';
  };

  const hasPurchaseLink = (order) => {
    return order.purchaseLink && 
           order.purchaseLink.isActive && 
           order.purchaseLink.token &&
           new Date() < new Date(order.purchaseLink.expiresAt);
  };

  const openPurchaseLink = (order) => {
    if (hasPurchaseLink(order)) {
      window.open(`/purchase/${order.purchaseLink.token}`, '_blank');
    }
  };

  const getFinalAmount = () => {
    if (!selectedOrder) return 0;
    if (!appliedCoupon) return selectedOrder.totalAmount;
    
    return selectedOrder.totalAmount - (appliedCoupon.discountAmount || 0);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder || !user?.email) return;
    
    try {
      setSendingMessage(true);
      
      const res = await api.post(`/api/user/service-orders/${selectedOrder._id}/messages`, {
        message: newMessage,
        userEmail: user.email,
        userName: (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name) || 'User',
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
    
    // Initialize billing info with customer info
    if (order.customerInfo) {
      setBillingInfo({
        fullName: order.customerInfo.name || '',
        email: order.customerInfo.email || user?.email || '',
        phone: order.customerInfo.phone || '',
        address: '',
        city: '',
        country: order.customerInfo.country || ''
      });
    }
  };

  const openPurchaseModal = (order) => {
    setSelectedOrder(order);
  setActiveTab('purchase');
  setShowModal(true);
    setPurchaseError('');
    setCouponCode('');
    setAppliedCoupon(null);
    
    // Initialize billing info
    if (order.customerInfo) {
      setBillingInfo({
        fullName: order.customerInfo.name || '',
        email: order.customerInfo.email || user?.email || '',
        phone: order.customerInfo.phone || '',
        address: '',
        city: '',
        country: order.customerInfo.country || ''
      });
    }
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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please log in to view your service orders</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-all duration-300">
      {/* Modern Header with Return Navigation */}
      <div className="bg-white/80 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Navigation Buttons */}
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => navigate(-1)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-blue-500 hover:to-purple-600 dark:hover:from-blue-600 dark:hover:to-purple-700 text-gray-700 dark:text-gray-300 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FaArrowLeft className={`text-sm group-hover:animate-pulse ${isRTL ? 'rotate-180' : ''}`} />
                <span className="text-sm font-medium">{t('common.back')}</span>
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 hover:from-blue-500 hover:to-purple-600 dark:hover:from-blue-600 dark:hover:to-purple-700 text-blue-700 dark:text-blue-300 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FaTachometerAlt className="text-sm group-hover:animate-pulse" />
                <span className="text-sm font-medium">{t('serviceOrders.backToDashboard')}</span>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 hover:from-green-500 hover:to-emerald-600 dark:hover:from-green-600 dark:hover:to-emerald-700 text-green-700 dark:text-green-300 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FaHome className="text-sm group-hover:animate-pulse" />
                <span className="text-sm font-medium">{t('serviceOrders.backToHome')}</span>
              </button>
            </div>
            
            {/* Title Section */}
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                {t('serviceOrders.title')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('serviceOrders.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-8">
            {serviceOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative">
                  <FaTag className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  {t('serviceOrders.noOrders')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  {t('serviceOrders.noOrdersDesc')}
                </p>
              </div>
            ) : (
              <div className="grid gap-8">
                {serviceOrders.map((order, index) => (
                  <div 
                    key={order._id} 
                    className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 backdrop-blur-sm"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Gradient Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className={`relative flex justify-between items-start mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {order.serviceName || t('serviceOrders.order')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                          {t('serviceOrders.order')} #{order.orderNumber || order._id}
                        </p>
                      </div>
                      <div className={`flex flex-col items-end gap-3 ${isRTL ? 'items-start' : 'items-end'}`}>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)} shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                        {order.totalAmount && (
                          <div className={`flex items-center gap-2 text-lg font-bold text-emerald-600 dark:text-emerald-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <FaDollarSign className="text-sm" />
                            <span>{formatCurrency(order.totalAmount, order)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Information Grid */}
                    <div className="relative grid md:grid-cols-2 gap-4 mb-6 text-sm">
                      <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FaClock className="text-blue-500" />
                          <span className="font-medium">{t('serviceOrders.orderDate')}:</span>
                          <span>{formatDateTime(order.submittedAt)}</span>
                        </p>
                        {order.lastMessageAt && (
                          <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaComments className="text-purple-500" />
                            <span className="font-medium">{t('serviceOrders.lastUpdate')}:</span>
                            <span>{formatDateTime(order.lastMessageAt)}</span>
                          </p>
                        )}
                      </div>
                      <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {order.messageStats && (
                          <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaComments className="text-green-500" />
                            <span className="font-medium">{t('serviceOrders.messages')}:</span>
                            <span>{order.messageStats.total}</span>
                            {order.messageStats.unread > 0 && (
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full animate-pulse shadow-lg">
                                {order.messageStats.unread} {t('common.unread')}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {order.description && (
                      <div className="relative mb-6">
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                          {order.description}
                        </p>
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className={`flex flex-wrap gap-2 mb-6 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      {order.messageStats && order.messageStats.unread > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium shadow-sm">
                          <FaComments className="animate-pulse" />
                          {t('serviceOrders.newMessages')}
                        </span>
                      )}
                      {hasPurchaseLink(order) && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-medium shadow-sm">
                          <FaLink className="animate-pulse" />
                          {t('serviceOrders.paymentLinkAvailable')}
                        </span>
                      )}
                      {canPurchase(order) && !hasPurchaseLink(order) && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-medium shadow-sm">
                          <FaShoppingCart className="animate-pulse" />
                          {t('serviceOrders.readyForPayment')}
                        </span>
                      )}
                      {order.paymentStatus === 'paid' && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full font-medium shadow-sm">
                          <FaCheckCircle />
                          {t('common.paid')}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex flex-wrap gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      {/* Priority: Purchase Link Button */}
                      {hasPurchaseLink(order) ? (
                        <button
                          onClick={() => openPurchaseLink(order)}
                          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                        >
                          <FaLink className="group-hover:animate-pulse" />
                          <span>{t('serviceOrders.payWithLink')}</span>
                        </button>
                      ) : canPurchase(order) ? (
                        <button
                          onClick={() => openPurchaseModal(order)}
                          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                        >
                          <FaShoppingCart className="group-hover:animate-pulse" />
                          <span>{t('serviceOrders.purchase')}</span>
                        </button>
                      ) : null}
                      
                      <button
                        onClick={() => openOrderModal(order)}
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm"
                      >
                        <FaEye className="group-hover:animate-pulse" />
                        <span>{t('serviceOrders.viewDetails')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

  {/* CSS Animations */}
  <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
  `}</style>

      {/* Modern Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Modern Modal Header */}
            <div className="bg-gradient-to-r from-blue-500/90 via-purple-600/90 to-blue-700/90 dark:from-blue-600/90 dark:via-purple-700/90 dark:to-blue-800/90 text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 animate-pulse"></div>
              <div className={`relative flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">
                    {selectedOrder.serviceName || t('serviceOrders.order')}
                  </h2>
                  <p className="text-blue-100 font-mono text-lg">
                    {t('serviceOrders.order')} #{selectedOrder.orderNumber || selectedOrder._id}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="group p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                >
                  <span className="text-2xl font-bold group-hover:rotate-90 transition-transform duration-300">×</span>
                </button>
              </div>
            </div>

            {/* Modern Tab Navigation */}
            <div className={`flex bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setActiveTab('details')}
                className={`group px-8 py-4 font-semibold transition-all duration-300 ${
                  activeTab === 'details'
                    ? 'text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 bg-white/80 dark:bg-gray-900/80 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FaTag className={`${isRTL ? 'ml-2' : 'mr-2'} group-hover:animate-pulse`} />
                {t('serviceOrders.details')}
              </button>
              <button
                onClick={() => setActiveTab('conversation')}
                className={`group px-8 py-4 font-semibold transition-all duration-300 relative ${
                  activeTab === 'conversation'
                    ? 'text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 bg-white/80 dark:bg-gray-900/80 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                } ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FaComments className={`${isRTL ? 'ml-2' : 'mr-2'} group-hover:animate-pulse`} />
                {t('serviceOrders.conversation')}
                {selectedOrder.messageStats && selectedOrder.messageStats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full animate-pulse shadow-lg">
                    {selectedOrder.messageStats.unread}
                  </span>
                )}
              </button>
              {canPurchase(selectedOrder) && (
                <button
                  onClick={() => setActiveTab('purchase')}
                  className={`group px-8 py-4 font-semibold transition-all duration-300 ${
                    activeTab === 'purchase'
                      ? 'text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 bg-white/80 dark:bg-gray-900/80 shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                  } ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <FaCreditCard className={`${isRTL ? 'ml-2' : 'mr-2'} group-hover:animate-pulse`} />
                  {t('serviceOrders.payment')}
                </button>
              )}
            </div>

            {/* Modern Modal Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur-sm">
              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* Order Information Cards */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                      <h3 className={`text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <FaTag className="text-blue-500" />
                        {t('serviceOrders.orderInfo')}
                      </h3>
                      <div className="space-y-4">
                        <div className={`flex justify-between items-center py-3 px-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t('serviceOrders.serviceType')}:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.serviceName}</span>
                        </div>
                        <div className={`flex justify-between items-center py-3 px-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t('serviceOrders.status')}:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                          </span>
                        </div>
                        <div className={`flex justify-between items-center py-3 px-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t('serviceOrders.totalAmount')}:</span>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <FaDollarSign className="text-sm" />
                            {formatCurrency(selectedOrder.totalAmount || 0, selectedOrder)}
                          </span>
                        </div>
                        <div className={`flex justify-between items-center py-3 px-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t('serviceOrders.orderDate')}:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{formatDateTime(selectedOrder.submittedAt)}</span>
                        </div>
                        {selectedOrder.priceUpdatedAt && (
                          <div className={`flex justify-between items-center py-3 px-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{t('serviceOrders.lastUpdate')}:</span>
                            <span className="font-bold text-blue-800 dark:text-blue-200">{formatDateTime(selectedOrder.priceUpdatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                      <h3 className={`text-xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                        <FaComments className="text-purple-500" />
                        {t('contact.title')}
                      </h3>
                      <div className="space-y-4">
                        <div className={`flex justify-between items-center py-3 px-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="font-medium text-gray-600 dark:text-gray-400">{t('profile.email')}:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 font-mono text-sm">{selectedOrder.userEmail || user.email}</span>
                        </div>
                        {selectedOrder.customerInfo && (
                          <>
                            <div className={`flex justify-between items-center py-3 px-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="font-medium text-gray-600 dark:text-gray-400">{t('profile.name')}:</span>
                              <span className="font-bold text-gray-800 dark:text-gray-200">{selectedOrder.customerInfo.name}</span>
                            </div>
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

              {activeTab === 'purchase' && canPurchase(selectedOrder) && (
                <div className="space-y-6">
                  {/* Purchase Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <FaShoppingCart className="text-2xl text-green-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Ready for Purchase</h3>
                        <p className="text-gray-600">Your order has been confirmed and is ready for payment</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Service:</span>
                            <span className="font-medium">{selectedOrder.serviceName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Original Amount:</span>
                            <span>{formatCurrency(selectedOrder.totalAmount, selectedOrder)}</span>
                          </div>
                          {appliedCoupon && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount ({appliedCoupon.code}):</span>
                              <span>-{formatCurrency(appliedCoupon.discountAmount, selectedOrder)}</span>
                            </div>
                          )}
                          <div className="border-t pt-2 flex justify-between text-lg font-bold">
                            <span>Final Amount:</span>
                            <span className="text-green-600">{formatCurrency(getFinalAmount(), selectedOrder)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Payment Method</h4>
                        <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                          <FaCreditCard className="text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium">Paymob Payment Gateway</p>
                            <p className="text-sm text-gray-600">Secure payment via Visa, Mastercard, or Mobile Wallet</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <FaPercent className="mr-2 text-orange-500" />
                      Coupon Code (Optional)
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={validatingCoupon}
                      />
                      <button
                        onClick={() => validateCoupon(couponCode)}
                        disabled={!couponCode.trim() || validatingCoupon}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {validatingCoupon ? <FaSpinner className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {appliedCoupon && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        <FaCheckCircle className="inline mr-1" />
                        {appliedCoupon.description} - Save ${appliedCoupon.discountAmount}
                      </div>
                    )}
                  </div>

                  {/* Billing Information */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Billing Information</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={billingInfo.fullName}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={billingInfo.email}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={billingInfo.phone}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <input
                          type="text"
                          value={billingInfo.country}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                          value={billingInfo.address}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purchase Error */}
                  {purchaseError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <FaExclamationTriangle className="inline mr-2" />
                      {purchaseError}
                    </div>
                  )}

                  {/* Purchase Button */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <FaLock className="inline mr-1" />
                      Secure payment powered by Paymob
                    </div>
                    <button
                      onClick={initiatePurchase}
                      disabled={purchaseLoading || !billingInfo.fullName || !billingInfo.email || !billingInfo.phone}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold"
                    >
                      {purchaseLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCreditCard />
                          Pay ${getFinalAmount()}
                        </>
                      )}
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
