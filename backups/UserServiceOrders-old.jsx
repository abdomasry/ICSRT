import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import ProfileDropdown from '../components/ProfileDropdown';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DarkModeToggle from '../components/DarkModeToggle';

const UserServiceOrders = () => {
  const { user, isLoggedIn } = useUser();
  const { t, isRTL } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = 'http://localhost:3000';
  const userEmail = user?.email || 'demo@icsrt.com';

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('ServiceOrders: Fetching orders for user:', userEmail, 'Logged in:', isLoggedIn);
        
        let ordersLoaded = false;
        let fetchedOrders = [];
        
        // Try token-based approach first if logged in
        if (isLoggedIn) {
          try {
            const tokenEndpoint = `${API_BASE_URL}/api/user/service-orders`;
            const tokenHeaders = { 'Authorization': `Bearer ${localStorage.getItem('icsrtToken')}` };
            
            console.log('ServiceOrders: Trying token-based request');
            const tokenResponse = await fetch(tokenEndpoint, { headers: tokenHeaders });
            
            if (tokenResponse.ok) {
              const data = await tokenResponse.json();
              if (Array.isArray(data) && data.length > 0) {
                fetchedOrders = data;
                ordersLoaded = true;
                console.log('ServiceOrders: Token-based fetch successful:', data.length, 'orders');
              }
            } else {
              console.log('ServiceOrders: Token-based fetch failed:', tokenResponse.status);
            }
          } catch (err) {
            console.log('ServiceOrders: Token-based fetch error:', err.message);
          }
        }
        
        // If token approach failed, try email-based
        if (!ordersLoaded) {
          try {
            const emailEndpoint = `${API_BASE_URL}/api/user/service-orders?userEmail=${encodeURIComponent(userEmail)}`;
            console.log('ServiceOrders: Trying email-based request');
            
            const emailResponse = await fetch(emailEndpoint);
            if (emailResponse.ok) {
              const data = await emailResponse.json();
              if (Array.isArray(data) && data.length > 0) {
                fetchedOrders = data;
                ordersLoaded = true;
                console.log('ServiceOrders: Email-based fetch successful:', data.length, 'orders');
              }
            } else {
              console.log('ServiceOrders: Email-based fetch failed:', emailResponse.status);
            }
          } catch (err) {
            console.log('ServiceOrders: Email-based fetch error:', err.message);
          }
        }
        
        if (ordersLoaded && fetchedOrders.length > 0) {
          setOrders(fetchedOrders);
          setError('');
        } else {
          // No orders found or API failed, show demo data
          console.log('ServiceOrders: No orders found, using demo data');
          setError('No service orders found in database. Showing demo data.');
          setOrders([
            {
              _id: 'demo-order-1',
              orderNumber: 'ORD-2024-001',
              serviceName: 'Conference Registration',
              serviceType: 'Conference Registration',
              fullName: user?.name || 'John Doe',
              email: userEmail,
              phone: '+1 (555) 123-4567',
              projectDetails: 'Registration for ICSRT 2024 Conference with paper presentation slot and networking session access.',
              status: 'completed',
              submittedAt: '2024-07-15T09:00:00Z',
              completedAt: '2024-07-16T14:30:00Z',
              estimatedCompletion: '2024-07-16T14:30:00Z',
              assignedTo: 'Registration Team',
              totalAmount: 350,
              details: {
                conferenceId: 'ICSRT-2024',
                conferenceName: 'International Conference on Software Research and Technology',
                participantType: 'Regular',
                additionalServices: ['Certificate', 'Proceedings', 'Networking Session']
              }
            },
            {
              _id: 'demo-order-2',
              orderNumber: 'ORD-2024-002',
              serviceName: 'Paper Review Service',
              serviceType: 'Paper Review Service',
              fullName: user?.name || 'John Doe',
              email: userEmail,
              phone: '+1 (555) 123-4567',
              projectDetails: 'Comprehensive review of research paper on Advanced Machine Learning Techniques in Healthcare Systems.',
              status: 'in-progress',
              submittedAt: '2024-07-10T14:30:00Z',
              estimatedCompletion: '2024-08-01T17:00:00Z',
              assignedTo: 'Dr. Sarah Chen',
              totalAmount: 250,
              details: {
                paperTitle: 'Advanced Machine Learning Techniques in Healthcare Systems',
                reviewType: 'Comprehensive Review',
                deadline: '2024-08-01',
                reviewer: 'Dr. Sarah Chen',
                progress: 'Literature review completed, methodology analysis in progress'
              }
            }
          ]);
        }
      } catch (error) {
        console.error('ServiceOrders: Major error fetching service orders:', error);
        setError('Failed to load service orders. Showing demo data.');
        
        // Fallback demo data
        setOrders([
          {
            _id: 'demo-order-1',
            orderNumber: 'ORD-2024-001',
            serviceName: 'Conference Registration',
            serviceType: 'Research Consultation',
            fullName: user?.name || 'John Doe',
            email: userEmail,
            phone: '+1 (555) 123-4567',
            projectDetails: 'Conference registration and research consultation services.',
            status: 'in-progress',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'Dr. Sarah Chen'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [userEmail, API_BASE_URL, isLoggedIn, user?.name]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    switch (statusLower) {
      case 'open':
      case 'pending':
      case 'submitted':
      case 'new':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'in-progress':
      case 'processing':
      case 'active':
      case 'working':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'resolved':
      case 'completed':
      case 'finished':
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'closed':
      case 'cancelled':
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'on-hold':
      case 'paused':
      case 'waiting':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'review':
      case 'reviewing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    switch (statusLower) {
      case 'open':
      case 'pending':
      case 'submitted':
      case 'new':
        return '⏳';
      case 'in-progress':
      case 'processing':
      case 'active':
      case 'working':
        return '🔄';
      case 'resolved':
      case 'completed':
      case 'finished':
      case 'done':
        return '✅';
      case 'closed':
      case 'cancelled':
      case 'rejected':
      case 'declined':
        return '❌';
      case 'on-hold':
      case 'paused':
      case 'waiting':
        return '⏸️';
      case 'review':
      case 'reviewing':
        return '👀';
      default:
        return '📋';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    
    // Convert status to proper case
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading your service orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-700 dark:text-blue-400">ICSRT</Link>
            <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
              <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">{t('nav.home')}</Link>
              <Link to="/services" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">{t('nav.services')}</Link>
              <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">{t('nav.dashboard')}</Link>
              <Link to="/service-orders" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium border-b-2 border-blue-600 dark:border-blue-400">Service Orders</Link>
              
              <LanguageSwitcher />
              <DarkModeToggle />
              
              {isLoggedIn ? (
                <ProfileDropdown />
              ) : (
                <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">{t('nav.login')}</Link>
                  <Link to="/signup" className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition">{t('nav.signup')}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Service Orders</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Track the status of your service requests</p>
            </div>
            <Link 
              to="/services" 
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition flex items-center gap-2"
            >
              🛍️ Order New Service
            </Link>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">No Service Orders Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't placed any service orders. Browse our services to get started!</p>
            <Link 
              to="/services" 
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition inline-flex items-center gap-2"
            >
              🛍️ Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {order.serviceType || 'Service Request'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <strong>Submitted:</strong> {formatDate(order.submittedAt)}
                      </div>
                      {order.assignedTo && (
                        <div>
                          <strong>Assigned to:</strong> {order.assignedTo}
                        </div>
                      )}
                      {order.estimatedCompletion && (
                        <div>
                          <strong>Est. Completion:</strong> {formatDate(order.estimatedCompletion)}
                        </div>
                      )}
                      {order.completedAt && (
                        <div>
                          <strong>Completed:</strong> {formatDate(order.completedAt)}
                        </div>
                      )}
                    </div>
                    
                    {order.projectDetails && (
                      <div className="mt-3">
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                          {order.projectDetails}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openOrderDetails(order)}
                    className="ml-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition flex items-center gap-2"
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Order Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Service Type</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.serviceType}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)} {getStatusText(selectedOrder.status)}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Project Details</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedOrder.projectDetails}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Contact Information</h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Name:</strong> {selectedOrder.fullName}</p>
                      <p><strong>Email:</strong> {selectedOrder.email}</p>
                      {selectedOrder.phone && <p><strong>Phone:</strong> {selectedOrder.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Timeline</h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Submitted:</strong> {formatDate(selectedOrder.submittedAt)}</p>
                      {selectedOrder.assignedTo && <p><strong>Assigned to:</strong> {selectedOrder.assignedTo}</p>}
                      {selectedOrder.estimatedCompletion && <p><strong>Est. Completion:</strong> {formatDate(selectedOrder.estimatedCompletion)}</p>}
                      {selectedOrder.completedAt && <p><strong>Completed:</strong> {formatDate(selectedOrder.completedAt)}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserServiceOrders;
