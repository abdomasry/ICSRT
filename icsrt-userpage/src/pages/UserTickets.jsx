import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
// Using global Navbar from Layout, so remove local header controls
import { 
  FaTicketAlt, 
  FaEye, 
  FaPlus, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaTimesCircle,
  FaReply,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaHourglassHalf,
  FaSpinner,
  FaCheck,
  FaPause,
  FaTimes,
  FaArrowUp,
  FaCog,
  FaBox,
  FaTruck
} from 'react-icons/fa';
import { api } from '../lib/api';

const UserTickets = () => {
  const { user, isLoggedIn } = useUser();
  const { isRTL } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Demo user email for testing (when not logged in)
  const userEmail = user?.email || 'demo@icsrt.com';

  const fetchUserTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching tickets for user:', userEmail);
      
      const response = await api.get(`/api/tickets/user/${encodeURIComponent(userEmail)}`);
      console.log('Raw API response:', response);
      
      let tickets = [];
      if (Array.isArray(response)) {
        tickets = response;
      } else if (response?.data && Array.isArray(response.data)) {
        tickets = response.data;
      } else if (response?.success && Array.isArray(response?.data)) {
        tickets = response.data;
      }
      
      console.log('Processed tickets:', tickets);
      setTickets(tickets);
      setError('');
      
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
      setError(error?.message || 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUserTickets();
  }, [fetchUserTickets]);

  const createNewTicket = async () => {
    try {
      const ticketData = {
        ...newTicket,
        userName: user?.fullName || 'Demo User',
        userEmail: userEmail,
        userPhone: user?.phone || '+1234567890'
      };

      const data = await api.post('/api/tickets', ticketData);

      if (data && data.success) {
        alert(`✅ Ticket Created Successfully!\n\nTicket Number: ${data.ticketNumber}\nSubject: ${newTicket.subject}`);
        setShowCreateForm(false);
        setNewTicket({ subject: '', message: '', category: 'general', priority: 'medium' });
        fetchUserTickets(); // Refresh tickets list
      } else {
        alert(`❌ Failed to create ticket: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert(`❌ Error creating ticket: ${error.message}`);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      setSendingReply(true);
      const data = await api.post(`/api/tickets/${selectedTicket._id}/user-reply`, {
        message: replyMessage.trim(),
        userEmail,
        userName: user?.fullName || user?.name || 'User',
      });

      if (data && data.success) {
        // Add the reply to the current ticket view
        const updatedTicket = {
          ...selectedTicket,
          responses: [...(selectedTicket.responses || []), data.data],
          status: data.ticketStatus || selectedTicket.status,
          updatedAt: new Date().toISOString()
        };
        setSelectedTicket(updatedTicket);
        
        // Update the ticket in the tickets list
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket._id === selectedTicket._id 
              ? { ...ticket, status: data.ticketStatus || ticket.status, updatedAt: new Date().toISOString() }
              : ticket
          )
        );

        setReplyMessage('');
        setShowReplyForm(false);
        alert('✅ Reply sent successfully!');
      } else {
        alert(`❌ Failed to send reply: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(`❌ Error sending reply: ${error.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaHourglassHalf className="text-yellow-500" />;
      case 'in-progress':
      case 'in_progress':
        return <FaSpinner className="text-blue-500" />;
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'on-hold':
      case 'on_hold':
        return <FaPause className="text-orange-500" />;
      case 'review':
        return <FaEye className="text-purple-500" />;
      case 'cancelled':
        return <FaTimes className="text-red-500" />;
      case 'open':
        return <FaExclamationCircle className="text-red-500" />;
      case 'resolved':
        return <FaCheckCircle className="text-green-500" />;
      case 'closed':
        return <FaTimesCircle className="text-gray-500" />;
      case 'submitted':
        return <FaArrowUp className="text-indigo-500" />;
      case 'processing':
        return <FaCog className="text-cyan-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      case 'approved':
        return <FaCheckCircle className="text-emerald-500" />;
      case 'delivered':
        return <FaBox className="text-teal-500" />;
      case 'shipped':
        return <FaTruck className="text-sky-500" />;
      default:
        return <FaTicketAlt className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300';
      case 'in-progress':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300';
      case 'on-hold':
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-300';
      case 'review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300';
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-300';
      case 'submitted':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-300';
      case 'processing':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 border border-cyan-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300';
      case 'delivered':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border border-teal-300';
      case 'shipped':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 border border-sky-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in-progress':
      case 'in_progress':
        return 'In Progress';
      case 'on-hold':
      case 'on_hold':
        return 'On Hold';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  return (
  <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2">
                🎫 تذاكر الدعم الخاصة بي
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                تتبع أسئلتك واحصل على الدعم من فريقنا
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <FaPlus /> إنشاء تذكرة جديدة
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-700 dark:text-red-400">
                {tickets.filter(t => t.status === 'open').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">مفتوحة</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900 dark:to-yellow-800 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {tickets.filter(t => t.status === 'in_progress').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">قيد التنفيذ</div>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-400">
                {tickets.filter(t => t.status === 'resolved').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">محلول</div>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-xl p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-400">
                {tickets.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">المجموع</div>
            </div>
          </div>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 sm:mb-6">Create New Support Ticket</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="conference">Conference Related</option>
                  <option value="submission">Paper Submission</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Please provide detailed information about your question or issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={createNewTicket}
                disabled={!newTicket.subject || !newTicket.message}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Create Ticket
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6">Your Tickets</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading tickets...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-xl mb-4">❌</div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button 
                onClick={fetchUserTickets}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Try Again
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <FaTicketAlt className="text-gray-400 text-6xl mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                لا توجد تذاكر بعد
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                إنشاء تذكرتك الأولى
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-lg transition">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(ticket.status)}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                          {ticket.subject}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Ticket #{ticket.ticketNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 text-sm sm:text-base">
                    {ticket.message}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span className="truncate">{formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaTag />
                        <span className="truncate">{ticket.category}</span>
                      </div>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FaReply />
                          <span>{ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
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

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                    {selectedTicket.subject}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Ticket #{selectedTicket.ticketNumber} • Created {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority.toUpperCase()}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedTicket.category}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Original Message</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>

                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Responses ({selectedTicket.responses.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedTicket.responses.map((response, index) => (
                        <div key={response.id || index} className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <FaUser className="text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold text-blue-700 dark:text-blue-300">
                                {response.respondedBy}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(response.respondedAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {response.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Section - Only show if ticket is not closed */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Reply</h3>
                      {!showReplyForm && (
                        <button
                          onClick={() => setShowReplyForm(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <FaReply />
                          Reply to Ticket
                        </button>
                      )}
                    </div>

                    {showReplyForm && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply here..."
                          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          disabled={sendingReply}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => {
                              setShowReplyForm(false);
                              setReplyMessage('');
                            }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            disabled={sendingReply}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={sendReply}
                            disabled={!replyMessage.trim() || sendingReply}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            {sendingReply ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <FaReply />
                                Send Reply
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedTicket.status === 'resolved' && (
                      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-yellow-600 dark:text-yellow-400" />
                          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                            This ticket has been marked as resolved. Adding a reply will reopen the ticket.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedTicket.status === 'closed' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <FaTimesCircle className="text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          This ticket is closed. To continue the conversation, please create a new ticket.
                        </span>
                      </div>
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

export default UserTickets;
