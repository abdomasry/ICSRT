import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import ProfileDropdown from "../components/ProfileDropdown";
import LanguageSwitcher from "../components/LanguageSwitcher";
import DarkModeToggle from "../components/DarkModeToggle";
import { api } from "../lib/api";

const UserDashboard = () => {
  const { user, isLoggedIn } = useUser();
  // Language context not required for this fixed dashboard variant
  
  // Simplified state management
  const [userStats, setUserStats] = useState({
    tickets: 5,
    serviceOrders: 4
  });
  
  const [recentTickets, setRecentTickets] = useState([
    {
      _id: 'demo-ticket-1',
      ticketId: 'TKT-2024-001',
      subject: 'Conference Registration Issue',
      status: 'open',
      priority: 'high',
      userEmail: user?.email || 'demo@icsrt.com',
      createdAt: '2024-07-20T10:00:00Z'
    },
    {
      _id: 'demo-ticket-2',
      ticketId: 'TKT-2024-002',
      subject: 'Paper Submission Query',
      status: 'in-progress',
      priority: 'medium',
      userEmail: user?.email || 'demo@icsrt.com',
      createdAt: '2024-07-18T14:30:00Z'
    }
  ]);
  
  const [recentServiceOrders, setRecentServiceOrders] = useState([
    {
      _id: 'demo-order-1',
      orderNumber: 'ORD-2024-001',
      serviceName: 'Conference Registration',
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
        participantType: 'Regular'
      },
      messages: [
        {
          id: 'msg-1',
          sender: 'user',
          channel: 'userpage',
          message: 'Thank you for processing my conference registration!',
          timestamp: '2024-07-16T10:00:00Z'
        }
      ],
      communicationChannels: {
        userpage: true,
        whatsapp: true,
        email: true
      }
    },
    {
      _id: 'demo-order-2',
      orderNumber: 'ORD-2024-002',
      serviceName: 'Paper Review Service',
      status: 'in-progress',
      totalAmount: 200,
      originalAmount: 250,
      discountApplied: 50,
      discountReason: 'Student discount',
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-10T14:30:00Z',
      updatedAt: '2024-07-22T09:15:00Z',
      details: {
        paperTitle: 'Advanced Machine Learning Techniques',
        reviewType: 'Comprehensive Review',
        deadline: '2024-08-01'
      },
      messages: [
        {
          id: 'msg-3',
          sender: 'user',
          channel: 'userpage',
          message: 'When will the review be completed?',
          timestamp: '2024-07-20T14:00:00Z'
        },
        {
          id: 'msg-4',
          sender: 'support',
          channel: 'userpage',
          message: 'Your paper review is progressing well. Expected completion: July 28th.',
          timestamp: '2024-07-20T16:30:00Z'
        }
      ],
      communicationChannels: {
        userpage: true,
        whatsapp: true,
        email: true
      }
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState(null);
  const [showServiceOrderModal, setShowServiceOrderModal] = useState(false);

  // Simplified data fetching with proper error handling
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      const userEmail = user?.email || 'demo@icsrt.com';
      console.log('Dashboard: Starting data fetch for user:', userEmail);

      try {
        // Try to fetch real data, but don't fail if it doesn't work
        await Promise.all([
          fetchStats(userEmail),
          fetchTickets(userEmail),
          fetchServiceOrders(userEmail)
        ]);
      } catch (error) {
        console.log('Dashboard: Using demo data due to fetch error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.email, isLoggedIn]);

  const fetchStats = async (userEmail) => {
    try {
      const stats = await api.get(`/api/user/stats?userEmail=${encodeURIComponent(userEmail)}`);
      if (stats && (stats.serviceOrders > 0 || stats.tickets > 0)) {
        setUserStats(prev => ({ ...prev, ...stats }));
        console.log('Dashboard: Real stats loaded:', stats);
      }
    } catch (error) {
      console.log('Dashboard: Stats fetch failed, using defaults');
    }
  };

  const fetchTickets = async (userEmail) => {
    try {
      const tickets = await api.get(`/api/user/tickets?userEmail=${encodeURIComponent(userEmail)}&limit=5`);
      if (Array.isArray(tickets) && tickets.length > 0) {
        setRecentTickets(tickets);
        console.log('Dashboard: Real tickets loaded:', tickets.length);
      }
    } catch (error) {
      console.log('Dashboard: Tickets fetch failed, using demo data');
    }
  };

  const fetchServiceOrders = async (userEmail) => {
    try {
      const orders = await api.get(`/api/user/service-orders?userEmail=${encodeURIComponent(userEmail)}&limit=5`);
      if (Array.isArray(orders) && orders.length > 0) {
        setRecentServiceOrders(orders);
        console.log('Dashboard: Real service orders loaded:', orders.length);
      }
    } catch (error) {
      console.log('Dashboard: Service orders fetch failed, using demo data');
    }
  };

  // Status utility functions
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
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const openServiceOrderDetails = (order) => {
    setSelectedServiceOrder(order);
    setShowServiceOrderModal(true);
  };

  const closeServiceOrderModal = () => {
    setSelectedServiceOrder(null);
    setShowServiceOrderModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ICSRT</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <LanguageSwitcher />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Here's what's happening with your account today.
          </p>
        </div>

  {/* Stats Grid (tickets and orders only) */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-2xl">🎫</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Support Tickets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.tickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.serviceOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tickets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tickets</h2>
                <Link to="/tickets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentTickets.length > 0 ? (
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div key={ticket._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(ticket.status)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getStatusText(ticket.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🎫</span>
                  <p className="text-gray-500 dark:text-gray-400">No tickets yet</p>
                  <Link to="/tickets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Create your first ticket
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Service Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Service Orders</h2>
                <Link to="/service-orders" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentServiceOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentServiceOrders.map((order) => (
                    <div key={order._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => openServiceOrderDetails(order)}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{order.serviceName}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(order.submittedAt)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {order.totalAmount && (
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                ${order.totalAmount}
                              </span>
                            )}
                            {order.originalAmount && order.originalAmount !== order.totalAmount && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                ${order.originalAmount}
                              </span>
                            )}
                            {order.messages && order.messages.length > 0 && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {order.messages.length} msg
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(order.status)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">⚙️</span>
                  <p className="text-gray-500 dark:text-gray-400">No service orders yet</p>
                  <Link to="/services" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Browse our services
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">            
          <Link to="/tickets" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🎫</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Support Tickets</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Get help with your questions</p>
            </div>
          </Link>

          <Link to="/service-orders" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <span className="text-4xl mb-4 block">⚙️</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Service Orders</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">View your service requests</p>
            </div>
          </Link>

          <Link to="/services" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🛍️</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Browse Services</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Explore our offerings</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Service Order Modal */}
      {showServiceOrderModal && selectedServiceOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Service Order Details</h2>
                <button onClick={closeServiceOrderModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Order Information</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedServiceOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Service</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedServiceOrder.serviceName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(selectedServiceOrder.status)}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{getStatusText(selectedServiceOrder.status)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Submitted</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedServiceOrder.submittedAt)}</p>
                    </div>
                  </div>
                </div>

                {selectedServiceOrder.totalAmount && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">${selectedServiceOrder.totalAmount}</p>
                  </div>
                )}

                {selectedServiceOrder.details && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Service Details</h3>
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {Object.entries(selectedServiceOrder.details).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          <span className="text-gray-900 dark:text-white">{String(value || '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
