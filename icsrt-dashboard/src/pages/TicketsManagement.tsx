import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  FaTicketAlt, 
  FaEye, 
  FaReply, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaTag,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import Pagination from '../components/Pagination';
import { useToast } from '../context/ToastContext';

const TicketsManagement = () => {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState('gradient'); // 'gradient' | 'cards'

  // Base URL is handled by centralized api client

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    // Reset page when filters change
    setPage(1);
  }, [filterStatus, filterPriority]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await api.get('/api/tickets');
      
      if (data?.success) {
        setTickets(data.data || []);
      } else if (Array.isArray(data)) {
        setTickets(data);
      } else if (Array.isArray(data?.data)) {
        setTickets(data.data);
      } else {
        setError(data?.error || 'Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to connect to server. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    setResponseMessage('');
  };

  const submitResponse = async () => {
    if (!responseMessage.trim()) {
  toast.warning('Please enter a response message');
      return;
    }

    try {
      setSubmittingResponse(true);
      
      const data = await api.post(`/api/tickets/${selectedTicket._id}/respond`, {
        message: responseMessage.trim(),
        respondedBy: 'ICSRT Support Team',
      });

      if (data?.success) {
        toast.success('Response sent successfully');
        setResponseMessage('');
        fetchTickets(); // Refresh tickets
        setShowModal(false);
      } else {
        toast.error(`Failed to send response: ${data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error(`Error sending response: ${error.message}`);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus, message = '') => {
    try {
      let endpoint = `/api/tickets/${ticketId}/status`;
      let body: any = {
        status: newStatus,
        updatedBy: 'ICSRT Admin'
      };

      // Use specific endpoints for resolve and close actions
      if (newStatus === 'resolved') {
        endpoint = `/api/tickets/${ticketId}/resolve`;
        body = {
          resolvedBy: 'ICSRT Admin',
          resolutionMessage: message
        };
      } else if (newStatus === 'closed') {
        endpoint = `/api/tickets/${ticketId}/close`;
        body = {
          closedBy: 'ICSRT Admin',
          closeReason: message || 'Ticket resolved and closed'
        };
      }

      console.log('🔄 Making API call:', {
        endpoint,
        method: 'PATCH',
        body
      });

      const data = await api.patch(endpoint, body);
      console.log('📄 Response data:', data);

      if (data?.success) {
        toast.success(`Ticket ${newStatus === 'resolved' ? 'resolved' : newStatus === 'closed' ? 'closed' : 'status updated'} successfully`);
        fetchTickets(); // Refresh tickets
        if (selectedTicket && selectedTicket._id === ticketId) {
          setShowModal(false);
        }
      } else {
        console.error('❌ API returned error:', data);
        toast.error(`Failed to update status: ${data?.error || data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating ticket status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // More specific error messages
      if (error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Please check: 1) Server is running 2) No firewall blocking the connection');
      } else if (error.message.includes('CORS')) {
        toast.error('CORS error: Server needs to allow requests from this domain');
      } else {
        toast.error(`Error updating status: ${error.message}`);
      }
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      await updateTicketStatus(selectedTicket._id, 'resolved', resolutionMessage);
      setShowResolveDialog(false);
      setResolutionMessage('');
    } catch (error) {
      console.error('Error resolving ticket:', error);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      await updateTicketStatus(selectedTicket._id, 'closed', closeReason);
      setShowCloseDialog(false);
      setCloseReason('');
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'in_progress':
        return <FaClock className="text-yellow-500" />;
      case 'resolved':
        return <FaCheckCircle className="text-green-500" />;
      case 'closed':
        return <FaTimesCircle className="text-gray-500" />;
      default:
        return <FaTicketAlt className="text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
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

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pagedTickets = filteredTickets.slice(startIdx, endIdx);

  const statusCounts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🎫 Support Tickets Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage and respond to user support tickets efficiently</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                className={`px-3 py-2 text-sm font-semibold rounded-md ${viewMode==='gradient' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={()=> setViewMode('gradient')}
                aria-pressed={viewMode==='gradient'}
              >
                Cards
              </button>
              <button
                className={`ml-1 px-3 py-2 text-sm font-semibold rounded-md ${viewMode==='list' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={()=> setViewMode('list')}
                aria-pressed={viewMode==='list'}
              >
                List
              </button>
            </div>
            <button
              onClick={fetchTickets}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <FaSpinner className={`${loading ? 'animate-spin' : ''} transition-transform`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${filterStatus==='all' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setFilterStatus('all'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFilterStatus('all'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {statusCounts.all}
            </div>
            <div className="text-sm font-semibold text-gray-600">All Tickets</div>
            <div className="text-2xl mt-2">🎫</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${filterStatus==='open' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setFilterStatus('open'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFilterStatus('open'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
              {statusCounts.open}
            </div>
            <div className="text-sm font-semibold text-gray-600">Open</div>
            <div className="text-2xl mt-2">🔓</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${filterStatus==='in_progress' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setFilterStatus('in_progress'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFilterStatus('in_progress'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {statusCounts.in_progress}
            </div>
            <div className="text-sm font-semibold text-gray-600">In Progress</div>
            <div className="text-2xl mt-2">⚙️</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${filterStatus==='resolved' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setFilterStatus('resolved'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFilterStatus('resolved'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
              {statusCounts.resolved}
            </div>
            <div className="text-sm font-semibold text-gray-600">Resolved</div>
            <div className="text-2xl mt-2">✅</div>
          </div>
        </div>

        <div
          className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer ${filterStatus==='closed' ? 'ring-2 ring-blue-300' : ''}`}
          onClick={() => { setFilterStatus('closed'); setPage(1); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setFilterStatus('closed'); setPage(1); } }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent mb-1">
              {statusCounts.closed}
            </div>
            <div className="text-sm font-semibold text-gray-600">Closed</div>
            <div className="text-2xl mt-2">🔒</div>
          </div>
        </div>
      </div>

      {/* Modern Filters */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔧</span>
              <label className="font-semibold text-gray-700">Status Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm font-semibold"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xl">🚨</span>
              <label className="font-semibold text-gray-700">Priority Filter:</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm font-semibold"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-200 text-red-700 p-4 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {/* Modern Tickets Display */}
      <div className="bg-white/80 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-xl font-semibold text-gray-600">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No tickets found</h3>
            <p className="text-gray-600">No support tickets match the current filters</p>
          </div>
    ) : (
          <div className="p-6">
            {/* Cards vs List */}
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {pagedTickets.map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 text-gray-800 rounded-md flex items-center justify-center text-sm font-bold">🎫</div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[260px]">#{ticket.ticketNumber || ticket._id?.slice(-6)} • {ticket.subject}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[340px]">{ticket.category} • {formatDate(ticket.createdAt)}</div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${ticket.status==='resolved' ? 'bg-green-100 text-emerald-700' : ticket.status==='open' ? 'bg-yellow-100 text-yellow-700' : ticket.status==='in_progress' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{ticket.status.replace('_',' ')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${ticket.priority==='urgent' ? 'bg-red-100 text-red-700' : ticket.priority==='high' ? 'bg-orange-100 text-orange-700' : ticket.priority==='medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{ticket.priority}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button onClick={() => { setSelectedTicket(ticket); setShowModal(true); }} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">View</button>
                      {ticket.status==='open' && (
                        <button onClick={() => updateTicketStatus(ticket._id,'in_progress')} className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md">Start</button>
                      )}
                      {ticket.status==='in_progress' && (
                        <button onClick={() => { setSelectedTicket(ticket); setShowResolveDialog(true); }} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">Resolve</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {pagedTickets.map((ticket) => (
                <div key={ticket._id} className={`${viewMode==='gradient' ? 'group bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 p-6 relative overflow-hidden' : 'bg-white rounded-xl border border-gray-200 shadow p-6'}`}>
                  {viewMode==='gradient' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${viewMode==='gradient' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl flex items-center justify-center text-xl font-bold shadow-lg`}>
                          🎫
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                            Ticket #{ticket.ticketNumber || ticket._id?.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-600">{ticket.category}</div>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                        const g = viewMode==='gradient';
                        if (ticket.status === 'open') return g ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700' : 'bg-yellow-100 text-yellow-700';
                        if (ticket.status === 'in_progress') return g ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' : 'bg-purple-100 text-purple-700';
                        if (ticket.status === 'resolved') return g ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' : 'bg-green-100 text-emerald-700';
                        return g ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700' : 'bg-gray-100 text-gray-700';
                      })()}`}>
                        {ticket.status === 'open' ? '🔓 Open' :
                         ticket.status === 'in_progress' ? '⚙️ In Progress' :
                         ticket.status === 'resolved' ? '✅ Resolved' : '🔒 Closed'}
                      </span>
                    </div>

                    {/* Priority Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                        const g = viewMode==='gradient';
                        if (ticket.priority === 'urgent') return g ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700' : 'bg-red-100 text-red-700';
                        if (ticket.priority === 'high') return g ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700' : 'bg-orange-100 text-orange-700';
                        if (ticket.priority === 'medium') return g ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' : 'bg-blue-100 text-blue-700';
                        return g ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700' : 'bg-gray-100 text-gray-700';
                      })()}`}>
                        {ticket.priority === 'urgent' ? '🚨 Urgent' :
                         ticket.priority === 'high' ? '🔴 High' :
                         ticket.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                      </span>
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                        {ticket.subject}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {ticket.message}
                      </p>
                    </div>

                    {/* User Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">👤</span>
                          <span className="font-semibold text-gray-700">User</span>
                        </div>
                        <p className="text-gray-600">{ticket.customerInfo?.name || ticket.userEmail}</p>
                      </div>

                      <div className="bg-gray-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📅</span>
                          <span className="font-semibold text-gray-700">Created</span>
                        </div>
                        <p className="text-gray-600">{formatDate(ticket.createdAt)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowModal(true);
                        }}
                        className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                      >
                        <FaEye />
                        View
                      </button>

                      {ticket.status === 'open' && (
                        <button
                          onClick={() => updateTicketStatus(ticket._id, 'in_progress')}
                          className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                        >
                          <FaClock />
                          Start
                        </button>
                      )}

                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowResolveDialog(true);
                          }}
                          className={`flex-1 ${viewMode==='gradient' ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${viewMode==='gradient' ? 'transform hover:scale-105' : ''} flex items-center justify-center gap-2`}
                        >
                          <FaCheck />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
            {/* Pagination */}
            <div className="mt-6 bg-gray-50/80 rounded-xl p-4">
              <Pagination
                page={page}
                pageSize={pageSize}
                total={filteredTickets.length}
                onPageChange={(p)=> setPage(p)}
                onPageSizeChange={(s)=> { setPageSize(s); setPage(1); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
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

              {/* Ticket Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaUser /> User Information
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Name:</strong> {selectedTicket.userName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Email:</strong> {selectedTicket.userEmail}
                    </p>
                    {selectedTicket.userPhone && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Phone:</strong> {selectedTicket.userPhone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaTag /> Ticket Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                          {selectedTicket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Priority:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                          {selectedTicket.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Category:</span>
                        <span>{selectedTicket.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Original Message</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>
              </div>

              {/* Responses */}
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div className="mb-6">
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

              {/* Add Response */}
              {selectedTicket.status !== 'closed' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Response</h3>
                  <div className="space-y-4">
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Type your response to the user..."
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={submitResponse}
                        disabled={submittingResponse || !responseMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        {submittingResponse ? <FaSpinner className="animate-spin" /> : <FaReply />}
                        {submittingResponse ? 'Sending...' : 'Send Response'}
                      </button>
                      <button
                        onClick={() => setShowResolveDialog(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <FaCheck /> Mark as Resolved
                      </button>
                      <button
                        onClick={() => setShowCloseDialog(true)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <FaTimes /> Close Ticket
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Ticket Dialog */}
      {showResolveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resolve Ticket
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Mark this ticket as resolved. You can optionally add a resolution message.
              </p>
              <textarea
                value={resolutionMessage}
                onChange={(e) => setResolutionMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white mb-4"
                placeholder="Optional resolution message..."
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowResolveDialog(false);
                    setResolutionMessage('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveTicket}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <FaCheck /> Resolve Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Ticket Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Close Ticket
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Close this ticket permanently. Users will not be able to reply to closed tickets.
              </p>
              <textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-white mb-4"
                placeholder="Reason for closing (optional)..."
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCloseDialog(false);
                    setCloseReason('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseTicket}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <FaTimes /> Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsManagement;
