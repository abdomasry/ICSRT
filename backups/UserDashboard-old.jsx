import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import ProfileDropdown from "../components/ProfileDropdown";
import LanguageSwitcher from "../components/LanguageSwitcher";
import DarkModeToggle from "../components/DarkModeToggle";

const UserDashboard = () => {
  const { user, isLoggedIn } = useUser();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    conferences: 0,
    papers: 0,
    tickets: 0,
    serviceOrders: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentServiceOrders, setRecentServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState(null);
  const [showServiceOrderModal, setShowServiceOrderModal] = useState(false);

  // Demo data for fallback when API fails
  const demoStats = {
    conferences: 2,
    papers: 3,
    tickets: 5,
    serviceOrders: 4
  };

  const demoTickets = [
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
  ];

  const demoServiceOrders = [
    {
      _id: 'demo-order-1',
      orderNumber: 'ORD-2024-001',
      serviceName: 'Conference Registration',
      status: 'completed',
      totalAmount: 150,
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-15T09:00:00Z',
      details: {
        conferenceId: 'ICSRT-2024',
        conferenceName: 'International Conference on Software Research and Technology',
        participantType: 'Regular',
        additionalServices: ['Certificate', 'Proceedings']
      }
    },
    {
      _id: 'demo-order-2',
      orderNumber: 'ORD-2024-002',
      serviceName: 'Paper Review Service',
      status: 'in-progress',
      totalAmount: 200,
      userEmail: user?.email || 'demo@icsrt.com',
      submittedAt: '2024-07-10T14:30:00Z',
      details: {
        paperTitle: 'Advanced Machine Learning Techniques',
        reviewType: 'Comprehensive Review',
        deadline: '2024-08-01'
      }
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      // For development: don't redirect to login if user is not logged in
      // Instead show a demo dashboard
      // if (!isLoggedIn) {
      //   navigate("/login");
      //   return;
      // }

      const userEmail = user?.email || 'demo@icsrt.com';

      try {
        console.log('Dashboard: Fetching data for user:', userEmail, 'Logged in:', isLoggedIn);
        
        // Fetch user stats with fallback
        let statsLoaded = false;
        try {
          let statsResponse;
          if (isLoggedIn) {
            statsResponse = await fetch("http://localhost:3000/api/user/stats", {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('icsrtToken')}`
              }
            });
          } else {
            statsResponse = await fetch(`http://localhost:3000/api/user/stats?userEmail=${encodeURIComponent(userEmail)}`);
          }
          
          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            setUserStats(prev => ({ ...prev, ...stats }));
            statsLoaded = true;
            console.log('Dashboard: Stats loaded successfully:', stats);
          } else {
            console.log('Dashboard: Stats API failed with status:', statsResponse.status);
          }
        } catch (statsError) {
          console.log('Dashboard: Stats fetch error:', statsError.message);
        }

        if (!statsLoaded) {
          // Use demo stats if API fails
          setUserStats(demoStats);
          console.log('Dashboard: Using demo stats');
        }

        // Fetch recent tickets with multiple approaches
        let ticketsLoaded = false;
        try {
          // Try token-based approach first if logged in
          if (isLoggedIn) {
            const tokenResponse = await fetch("http://localhost:3000/api/user/tickets?limit=5", {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('icsrtToken')}` }
            });
            if (tokenResponse.ok) {
              const ticketsData = await tokenResponse.json();
              if (Array.isArray(ticketsData) && ticketsData.length > 0) {
                setRecentTickets(ticketsData);
                ticketsLoaded = true;
                console.log('Dashboard: Token-based tickets loaded:', ticketsData.length);
              }
            }
          }
          
          // If token approach failed, try email-based
          if (!ticketsLoaded) {
            const emailResponse = await fetch(`http://localhost:3000/api/user/tickets?userEmail=${encodeURIComponent(userEmail)}&limit=5`);
            if (emailResponse.ok) {
              const ticketsData = await emailResponse.json();
              if (Array.isArray(ticketsData) && ticketsData.length > 0) {
                setRecentTickets(ticketsData);
                ticketsLoaded = true;
                console.log('Dashboard: Email-based tickets loaded:', ticketsData.length);
              }
            }
          }
        } catch (ticketsError) {
          console.log('Dashboard: Tickets fetch error:', ticketsError.message);
        }

        if (!ticketsLoaded) {
          setRecentTickets(demoTickets);
          console.log('Dashboard: Using demo tickets');
        }

        // Fetch recent service orders with multiple approaches
        let ordersLoaded = false;
        try {
          // Try token-based approach first if logged in
          if (isLoggedIn) {
            const tokenResponse = await fetch("http://localhost:3000/api/user/service-orders?limit=5", {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('icsrtToken')}` }
            });
            if (tokenResponse.ok) {
              const ordersData = await tokenResponse.json();
              if (Array.isArray(ordersData) && ordersData.length > 0) {
                setRecentServiceOrders(ordersData);
                ordersLoaded = true;
                console.log('Dashboard: Token-based orders loaded:', ordersData.length);
              }
            }
          }
          
          // If token approach failed, try email-based
          if (!ordersLoaded) {
            const emailResponse = await fetch(`http://localhost:3000/api/user/service-orders?userEmail=${encodeURIComponent(userEmail)}&limit=5`);
            if (emailResponse.ok) {
              const ordersData = await emailResponse.json();
              if (Array.isArray(ordersData) && ordersData.length > 0) {
                setRecentServiceOrders(ordersData);
                ordersLoaded = true;
                console.log('Dashboard: Email-based orders loaded:', ordersData.length);
              }
            }
          }
        } catch (ordersError) {
          console.log('Dashboard: Service orders fetch error:', ordersError.message);
        }

        if (!ordersLoaded) {
          setRecentServiceOrders(demoServiceOrders);
          console.log('Dashboard: Using demo service orders');
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set fallback stats for demo
        setUserStats({
          conferences: 2,
          papers: 1,
          tickets: 3,
          serviceOrders: 3
        });
        
        // Demo data for tickets and service orders
        setRecentTickets([
          {
            _id: 'demo-ticket-1',
            subject: 'Question about research methodology',
            status: 'in-progress',
            priority: 'medium',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'demo-ticket-2',
            subject: 'Translation service inquiry',
            status: 'resolved',
            priority: 'low',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: 'demo-ticket-3',
            subject: 'Urgent: Publication deadline assistance',
            status: 'open',
            priority: 'high',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
        
        setRecentServiceOrders([
          {
            _id: 'demo-order-1',
            serviceType: 'Research Consultation',
            fullName: 'John Doe',
            email: userEmail,
            phone: '+1 (555) 123-4567',
            projectDetails: 'I need assistance with developing a research methodology for my PhD thesis in computer science. The focus is on machine learning applications in healthcare, specifically developing predictive models for patient diagnosis. I would like guidance on:\n\n1. Selecting appropriate ML algorithms\n2. Data collection and preprocessing strategies\n3. Validation methods and metrics\n4. Ethical considerations in healthcare AI\n\nTimeline: 3-4 months\nBudget: $2,000 - $3,000',
            status: 'in-progress',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'Dr. Sarah Chen',
            notes: 'Initial consultation completed. Working on methodology framework. Next meeting scheduled for next week to review data collection strategies.'
          },
          {
            _id: 'demo-order-2',
            serviceType: 'Translation Services',
            fullName: 'John Doe',
            email: userEmail,
            phone: '+1 (555) 123-4567',
            projectDetails: 'Need professional translation of my research paper from English to Arabic. The paper is about 5000 words and focuses on renewable energy technologies.',
            status: 'completed',
            submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'Prof. Ahmed El-Rashid',
            notes: 'Translation completed successfully. Client satisfied with quality and delivery time.'
          },
          {
            _id: 'demo-order-3',
            serviceType: 'Writing Support',
            fullName: 'John Doe',
            email: userEmail,
            phone: '+1 (555) 123-4567',
            projectDetails: 'Looking for professional editing and proofreading services for my journal article submission.',
            status: 'pending',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: null,
            notes: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn, navigate, user]);

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
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const openServiceOrderDetails = (order) => {
    setSelectedServiceOrder(order);
    setShowServiceOrderModal(true);
  };

  const closeServiceOrderModal = () => {
    setShowServiceOrderModal(false);
    setSelectedServiceOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
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
              <Link to="/articles" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">{t('nav.articles')}</Link>
              <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">{t('nav.about')}</Link>
              <Link to="/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium border-b-2 border-blue-600 dark:border-blue-400">{t('nav.dashboard')}</Link>
              
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

      {/* Dashboard Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className={`text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-6 ${isRTL ? 'text-right' : 'text-center'}`}>
            {t('dashboard.welcome')}{user ? `, ${user.fullName}` : ` ${t('common.demo')}`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">{userStats.conferences}</div>
              <div className="text-gray-600 dark:text-gray-300">{t('dashboard.conferences')}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{userStats.papers}</div>
              <div className="text-gray-600 dark:text-gray-300">{t('dashboard.papers')}</div>
            </div>
            <div className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{userStats.tickets}</div>
              <div className="text-gray-600 dark:text-gray-300">Support Tickets</div>
            </div>
            <div className="bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-900 dark:to-pink-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-pink-700 dark:text-pink-400">{userStats.serviceOrders}</div>
              <div className="text-gray-600 dark:text-gray-300">Service Orders</div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Tickets */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  🎫 Recent Support Tickets
                </h3>
                <Link 
                  to="/tickets" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              {recentTickets.length > 0 ? (
                <div className="space-y-3">
                  {recentTickets.slice(0, 3).map(ticket => (
                    <div key={ticket._id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate flex-1">
                          {ticket.subject}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)} {getStatusText(ticket.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(ticket.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No support tickets yet</p>
                  <Link to="/tickets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Create your first ticket
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Service Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  🛍️ Recent Service Orders
                </h3>
                <Link 
                  to="/service-orders" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              {recentServiceOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentServiceOrders.slice(0, 3).map(order => (
                    <div 
                      key={order._id} 
                      className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                      onClick={() => openServiceOrderDetails(order)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate flex-1">
                          {order.serviceType || 'Service Request'}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatDate(order.submittedAt || order.createdAt)}</span>
                        {order.assignedTo && (
                          <span className="text-blue-600 dark:text-blue-400">👨‍💼 {order.assignedTo}</span>
                        )}
                      </div>
                      {order.projectDetails && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {order.projectDetails.substring(0, 80)}...
                        </div>
                      )}
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                        👁️ Click to view details
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">🛒</div>
                  <p>No service orders yet</p>
                  <Link to="/services" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Browse our services
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">            
            <Link 
              to="/tickets" 
              className="bg-gradient-to-r from-orange-600 to-orange-400 dark:from-orange-700 dark:to-orange-500 text-white p-6 rounded-xl text-center hover:from-orange-700 hover:to-orange-500 dark:hover:from-orange-600 dark:hover:to-orange-400 transition"
            >
              <h3 className="text-xl font-semibold mb-2">🎫 Support Tickets</h3>
              <p>View your questions and our responses</p>
            </Link>
            
            <Link 
              to="/service-orders" 
              className="bg-gradient-to-r from-green-600 to-green-400 dark:from-green-700 dark:to-green-500 text-white p-6 rounded-xl text-center hover:from-green-700 hover:to-green-500 dark:hover:from-green-600 dark:hover:to-green-400 transition"
            >
              <h3 className="text-xl font-semibold mb-2">🛍️ Service Orders</h3>
              <p>Track your service requests and orders</p>
            </Link>
            
            <Link 
              to="/profile" 
              className="bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-700 dark:to-purple-500 text-white p-6 rounded-xl text-center hover:from-purple-700 hover:to-purple-500 dark:hover:from-purple-600 dark:hover:to-purple-400 transition"
            >
              <h3 className="text-xl font-semibold mb-2">{t('dashboard.update.profile')}</h3>
              <p>{t('dashboard.manage.profile')}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Service Order Details Modal */}
      {showServiceOrderModal && selectedServiceOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Service Order Details</h2>
                <button
                  onClick={closeServiceOrderModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Service Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      🛍️ Service Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Service Type:</span>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedServiceOrder.serviceType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <div className="mt-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedServiceOrder.status)}`}>
                            {getStatusIcon(selectedServiceOrder.status)} {getStatusText(selectedServiceOrder.status)}
                          </span>
                        </div>
                      </div>
                      {selectedServiceOrder.assignedTo && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Assigned to:</span>
                          <p className="text-gray-900 dark:text-gray-100 mt-1">👨‍💼 {selectedServiceOrder.assignedTo}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      👤 Contact Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedServiceOrder.fullName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                        <p className="text-gray-900 dark:text-gray-100">{selectedServiceOrder.email}</p>
                      </div>
                      {selectedServiceOrder.phone && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                          <p className="text-gray-900 dark:text-gray-100">{selectedServiceOrder.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Timeline & Project Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      📅 Timeline
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                        <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedServiceOrder.submittedAt || selectedServiceOrder.createdAt)}</p>
                      </div>
                      {selectedServiceOrder.estimatedCompletion && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Est. Completion:</span>
                          <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedServiceOrder.estimatedCompletion)}</p>
                        </div>
                      )}
                      {selectedServiceOrder.completedAt && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Completed:</span>
                          <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedServiceOrder.completedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedServiceOrder.projectDetails && (
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        📋 Project Details
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {selectedServiceOrder.projectDetails}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedServiceOrder.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        📝 Notes
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                        <p className="text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
                          {selectedServiceOrder.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={closeServiceOrderModal}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Close
                </button>
                <Link
                  to="/service-orders"
                  className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition inline-flex items-center gap-2"
                  onClick={closeServiceOrderModal}
                >
                  🛍️ View All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
