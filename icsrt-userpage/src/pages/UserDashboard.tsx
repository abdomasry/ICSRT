import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../lib/api";

const UserDashboard = () => {
  const { user, isLoggedIn } = useUser();
  const { t, isRTL } = useLanguage();
  
  
  // Simplified state management
  const [userStats, setUserStats] = useState({
    tickets: 0,
    serviceOrders: 0
  });
  
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentServiceOrders, setRecentServiceOrders] = useState([]);
  
  // Researcher submissions tracking
  const [myCollaborations, setMyCollaborations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [showCollabModal, setShowCollabModal] = useState(false);

  // Simplified data fetching with proper error handling
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      const userEmail = user?.email || 'demo@icsrt.com';
      console.log('Dashboard: Starting data fetch for user:', userEmail);

      try {
  // Try to fetch real data; start from zero/empty
        await Promise.all([
          fetchStats(userEmail),
          fetchTickets(userEmail),
          fetchServiceOrders(userEmail),
          fetchCollaborations(userEmail)
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
      // Get ticket count from /api/tickets/user/:email endpoint
      const ticketsResponse = await api.get(`/api/tickets/user/${encodeURIComponent(userEmail)}`);
      let ticketCount = 0;
      if (ticketsResponse && ticketsResponse.success && Array.isArray(ticketsResponse.data)) {
        ticketCount = ticketsResponse.data.length;
      }

      // Get service orders count - API returns { success: true, orders: [...] }
      const ordersResponse = await api.get(`/api/user/service-orders?userEmail=${encodeURIComponent(userEmail)}`);
      let orderCount = 0;
      console.log('Dashboard: Orders response for stats:', ordersResponse);
      
      if (ordersResponse) {
        if (ordersResponse.success && Array.isArray(ordersResponse.orders)) {
          orderCount = ordersResponse.orders.length;
        } else if (Array.isArray(ordersResponse)) {
          orderCount = ordersResponse.length;
        } else if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
          orderCount = ordersResponse.data.length;
        }
      }
      
      // Update stats
      const safe = {
        tickets: ticketCount,
        serviceOrders: orderCount
      };
      setUserStats(safe);
      console.log('Dashboard: Stats loaded:', safe);
    } catch (error) {
      console.log('Dashboard: Stats fetch failed:', error);
    }
  };

  const fetchTickets = async (userEmail) => {
    try {
      const response = await api.get(`/api/tickets/user/${encodeURIComponent(userEmail)}`);
      if (response && response.success) {
        // Take only the 3-4 most recent tickets
        const recent = response.data.slice(0, 4);
        setRecentTickets(recent);
        console.log('Dashboard: Recent tickets loaded:', recent.length);
      }
    } catch (error) {
      console.log('Dashboard: Tickets fetch failed');
    }
  };

  const fetchServiceOrders = async (userEmail) => {
    try {
      const response = await api.get(`/api/user/service-orders?userEmail=${encodeURIComponent(userEmail)}&limit=4`);
      console.log('Dashboard: Service orders response:', response);
      
      let ordersList = [];
      
      // API returns { success: true, orders: [...] }
      if (response && response.success && Array.isArray(response.orders)) {
        ordersList = response.orders.slice(0, 4);
      } else if (Array.isArray(response)) {
        ordersList = response.slice(0, 4);
      } else if (response && response.data && Array.isArray(response.data)) {
        ordersList = response.data.slice(0, 4);
      }
      
      setRecentServiceOrders(ordersList);
      console.log('Dashboard: Recent service orders loaded:', ordersList.length);
    } catch (error) {
      console.log('Dashboard: Service orders fetch failed:', error);
    }
  };

  const fetchCollaborations = async (userEmail) => {
    try {
      const res = await api.get(`/api/collaborations?userEmail=${encodeURIComponent(userEmail)}&limit=10&sortBy=createdAt&sortOrder=desc`);
      if (res && res.data) {
        // auto-CRUD wraps data under .data
        setMyCollaborations(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
      } else {
        // If the helper normalized to array directly
        setMyCollaborations(Array.isArray(res) ? res : []);
      }
    } catch (e) {
      // swallow
    }
  };

  const openCollabDetails = (item) => { setSelectedCollab(item); setShowCollabModal(true); };
  const closeCollabModal = () => { setSelectedCollab(null); setShowCollabModal(false); };

  // Work With Us (researcher only)
  const isResearcher = (() => {
    const type = (user?.userType || '').toLowerCase();
    return type.includes('research');
  })();
  const [showWorkWithUs, setShowWorkWithUs] = useState(false);
  const [workForm, setWorkForm] = useState({ title: '', summary: '', link: '', category: 'idea' });
  const [workMsg, setWorkMsg] = useState('');
  const [workErr, setWorkErr] = useState('');
  const submitCollaboration = async (e) => {
    e?.preventDefault?.();
    setWorkMsg(''); setWorkErr('');
    if (!workForm.title || !workForm.summary) { setWorkErr(isRTL ? 'العنوان والملخص مطلوبان' : 'Title and summary are required'); return; }
    try {
      const payload = {
        ...workForm,
        userEmail: user?.email,
        userId: user?._id,
        status: 'submitted'
      };
      const res = await api.post('/api/collaborations', payload);
      if (res && res.success !== false) {
        setWorkMsg(isRTL ? 'تم الإرسال بنجاح! سنعود إليك قريبًا.' : 'Submitted! We will get back to you soon.');
        setWorkForm({ title: '', summary: '', link: '', category: 'idea' });
        setTimeout(() => setShowWorkWithUs(false), 1200);
      } else {
        setWorkErr(res?.error || (isRTL ? 'فشل الإرسال' : 'Submission failed'));
      }
    } catch (err) {
      setWorkErr(isRTL ? 'خطأ في الشبكة' : 'Network error');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.welcome')}, {user?.name || t('common.user')}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('dashboard.todayActivity')}
          </p>
        </div>

  {/* Stats Grid (tickets and orders only) */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-2xl">🎫</span>
              </div>
              <div className={isRTL ? 'mr-4' : 'ml-4'}>
                <p className={`text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard.stats.tickets')}</p>
                <p className={`text-2xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{userStats.tickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className={isRTL ? 'mr-4' : 'ml-4'}>
                <p className={`text-sm font-medium text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard.stats.orders')}</p>
                <p className={`text-2xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{userStats.serviceOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tickets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard.recent.tickets')}</h2>
                <Link to="/tickets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  {t('dashboard.tickets.view')}
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentTickets.length > 0 ? (
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <Link 
                      key={ticket._id} 
                      to="/tickets"
                      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <h3 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(ticket.createdAt)}
                          </p>
                        </div>
                        <div className={`${isRTL ? 'mr-4' : 'ml-4'} flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                          <span className="text-lg">{getStatusIcon(ticket.status)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getStatusText(ticket.status)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🎫</span>
                  <p className="text-gray-500 dark:text-gray-400">{t('dashboard.no.tickets')}</p>
                  <Link to="/tickets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    {t('dashboard.tickets.create')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Service Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{t('dashboard.recent.orders')}</h2>
                <Link to="/service-orders" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  {t('dashboard.orders.view')}
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentServiceOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentServiceOrders.map((order) => (
                    <Link
                      key={order._id}
                      to="/service-orders"
                      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <h3 className="font-medium text-gray-900 dark:text-white">{order.serviceName}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(order.submittedAt)}
                          </p>
                          <div className={`flex items-center space-x-2 mt-1 ${isRTL ? 'space-x-reverse justify-end' : ''}`}>
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
                          </div>
                        </div>
                        <div className={`${isRTL ? 'mr-4' : 'ml-4'} flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                          <span className="text-lg">{getStatusIcon(order.status)}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">⚙️</span>
                  <p className="text-gray-500 dark:text-gray-400">{t('dashboard.no.orders')}</p>
                  <Link to="/services" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    {t('services.view')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {isResearcher && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className={`text-lg font-semibold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'متابعة أعمالي البحثية' : 'My Research Submissions'}</h2>
              <p className={`text-sm text-gray-600 dark:text-gray-300 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'تتبع حالة الأفكار والمقالات التي أرسلتها عبر قسم اعمل معنا' : 'Track the status of your ideas and articles submitted via Work With Us.'}</p>
            </div>
            <div className="p-6">
              {myCollaborations.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📝</span>
                  <p className="text-gray-500 dark:text-gray-400">{isRTL ? 'لا توجد طلبات بعد' : 'No submissions yet.'}</p>
                  <button onClick={() => setShowWorkWithUs(true)} className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm">{isRTL ? 'أرسل أول فكرة' : 'Submit your first idea'}</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{isRTL ? 'العنوان' : 'Title'}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{isRTL ? 'الحالة' : 'Status'}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{isRTL ? 'التاريخ' : 'Date'}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {myCollaborations.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => openCollabDetails(c)}>
                          <td className="px-4 py-2 text-gray-900 dark:text-white">{c.title || '—'}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center gap-1 text-sm text-gray-800 dark:text-gray-200">
                              <span>{getStatusIcon(c.status)}</span>
                              <span>{getStatusText(c.status || 'submitted')}</span>
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{formatDate(c.createdAt || c.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

  {/* Quick Actions */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">            
          <Link to="/tickets" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🎫</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('dashboard.stats.tickets')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{t('dashboard.tickets.create')}</p>
            </div>
          </Link>

          <Link to="/service-orders" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <span className="text-4xl mb-4 block">⚙️</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('dashboard.stats.orders')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{t('dashboard.orders.view')}</p>
            </div>
          </Link>

          <Link to="/services" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🛍️</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('nav.services')}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{t('services.view')}</p>
            </div>
          </Link>
          {isResearcher && (
            <button onClick={() => setShowWorkWithUs(true)} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <span className="text-4xl mb-4 block">🤝</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{isRTL ? 'اعمل معنا' : 'Work With Us'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{isRTL ? 'لديك فكرة أو مقال؟ انضم لفريقنا.' : 'Have an idea or article? Join our team.'}</p>
              </div>
            </button>
          )}
        </div>
      </main>

      {showCollabModal && selectedCollab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'تفاصيل الإرسال' : 'Submission Details'}</h2>
                <button onClick={closeCollabModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><span className="text-2xl">&times;</span></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'العنوان' : 'Title'}</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCollab.title || '—'}</p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الحالة' : 'Status'}</p>
                <div className={`flex items-center gap-2 ${isRTL ? 'justify-end' : ''}`}>
                  <span className="text-lg">{getStatusIcon(selectedCollab.status)}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{getStatusText(selectedCollab.status || 'submitted')}</span>
                </div>
              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'النوع' : 'Type'}</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedCollab.category || 'idea'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'التاريخ' : 'Date'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCollab.createdAt || selectedCollab.updatedAt)}</p>
                </div>
              </div>
              {selectedCollab.link && (
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الرابط' : 'Link'}</p>
                  <a href={selectedCollab.link} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{selectedCollab.link}</a>
                </div>
              )}
              {selectedCollab.attachment?.url && (
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'المرفق' : 'Attachment'}</p>
                  <a href={selectedCollab.attachment.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{selectedCollab.attachment.filename || (isRTL ? 'فتح الملف' : 'Open File')}</a>
                  <p className="text-xs text-gray-500">{selectedCollab.attachment.mimetype} · {Math.round((selectedCollab.attachment.size||0)/1024)} KB</p>
                </div>
              )}
              {selectedCollab.cv?.url && (
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'السيرة الذاتية' : 'CV'}</p>
                  <a href={selectedCollab.cv.url} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{selectedCollab.cv.filename || (isRTL ? 'فتح السيرة الذاتية' : 'Open CV')}</a>
                  <p className="text-xs text-gray-500">{selectedCollab.cv.mimetype} · {Math.round((selectedCollab.cv.size||0)/1024)} KB</p>
                </div>
              )}
              {(selectedCollab.firstName || selectedCollab.lastName) && (
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الاسم' : 'Name'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{[selectedCollab.firstName, selectedCollab.lastName].filter(Boolean).join(' ')}</p>
                </div>
              )}
              {(selectedCollab.contact?.phone) && (
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الهاتف' : 'Phone'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCollab.contact.phone}</p>
                </div>
              )}
              {(selectedCollab.social && (selectedCollab.social.facebook || selectedCollab.social.instagram || selectedCollab.social.linkedin)) && (
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'التواصل الاجتماعي' : 'Social'}</p>
                  {selectedCollab.social.facebook && (<div><a className="text-blue-600 dark:text-blue-400 hover:underline" href={selectedCollab.social.facebook} target="_blank" rel="noreferrer">Facebook</a></div>)}
                  {selectedCollab.social.instagram && (<div><a className="text-blue-600 dark:text-blue-400 hover:underline" href={selectedCollab.social.instagram} target="_blank" rel="noreferrer">Instagram</a></div>)}
                  {selectedCollab.social.linkedin && (<div><a className="text-blue-600 dark:text-blue-400 hover:underline" href={selectedCollab.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></div>)}
                </div>
              )}
              {selectedCollab.summary && (
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? 'الملخص' : 'Summary'}</p>
                  <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-gray-900 dark:text-white whitespace-pre-wrap">{selectedCollab.summary}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Work With Us Modal */}
      {showWorkWithUs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xl w-full ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'اعمل معنا' : 'Work With Us'}</h2>
              <button onClick={() => setShowWorkWithUs(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">&times;</button>
            </div>
            <form onSubmit={submitCollaboration} className="p-6 space-y-4">
              {workMsg && <div className="p-3 rounded bg-green-50 text-green-700 border border-green-200">{workMsg}</div>}
              {workErr && <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">{workErr}</div>}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{isRTL ? 'العنوان' : 'Title'}</label>
                <input value={workForm.title} onChange={(e)=>setWorkForm(f=>({...f,title:e.target.value}))} className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{isRTL ? 'الملخص/الفكرة' : 'Summary / Idea'}</label>
                <textarea rows={4} value={workForm.summary} onChange={(e)=>setWorkForm(f=>({...f,summary:e.target.value}))} className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{isRTL ? 'النوع' : 'Type'}</label>
                  <select value={workForm.category} onChange={(e)=>setWorkForm(f=>({...f,category:e.target.value}))} className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="idea">{isRTL ? 'فكرة' : 'Idea'}</option>
                    <option value="article">{isRTL ? 'مقال' : 'Article'}</option>
                    <option value="project">{isRTL ? 'مشروع' : 'Project'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{isRTL ? 'رابط (اختياري)' : 'Link (optional)'}</label>
                  <input value={workForm.link} onChange={(e)=>setWorkForm(f=>({...f,link:e.target.value}))} className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setShowWorkWithUs(false)} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{isRTL ? 'إرسال' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
