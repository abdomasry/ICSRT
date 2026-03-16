import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { api } from "../lib/api";

const UserTickets = () => {
  const { user } = useUser();
  
  const [tickets, setTickets] = useState([
    {
      _id: 'demo-ticket-1',
      ticketId: 'TKT-2024-001',
      subject: 'Conference Registration Issue',
      description: 'I am having trouble completing my registration for the upcoming ICSRT 2024 conference. The payment gateway seems to be rejecting my credit card.',
      status: 'open',
      priority: 'high',
      category: 'registration',
      userEmail: user?.email || 'demo@icsrt.com',
      userName: user?.name || 'Demo User',
      createdAt: '2024-07-20T10:00:00Z',
      updatedAt: '2024-07-20T10:00:00Z',
      messages: [
        {
          id: 'msg-1',
          sender: 'user',
          message: 'I am having trouble completing my registration for the upcoming ICSRT 2024 conference. The payment gateway seems to be rejecting my credit card.',
          timestamp: '2024-07-20T10:00:00Z'
        }
      ]
    },
    {
      _id: 'demo-ticket-2',
      ticketId: 'TKT-2024-002',
      subject: 'Paper Submission Query',
      description: 'What is the maximum page limit for research papers? I could not find this information in the submission guidelines.',
      status: 'in-progress',
      priority: 'medium',
      category: 'submission',
      userEmail: user?.email || 'demo@icsrt.com',
      userName: user?.name || 'Demo User',
      createdAt: '2024-07-18T14:30:00Z',
      updatedAt: '2024-07-19T09:15:00Z',
      messages: [
        {
          id: 'msg-2',
          sender: 'user',
          message: 'What is the maximum page limit for research papers? I could not find this information in the submission guidelines.',
          timestamp: '2024-07-18T14:30:00Z'
        },
        {
          id: 'msg-3',
          sender: 'support',
          message: 'Thank you for your inquiry. The maximum page limit for research papers is 12 pages including references. Please ensure your submission follows the IEEE format.',
          timestamp: '2024-07-19T09:15:00Z'
        }
      ]
    },
    {
      _id: 'demo-ticket-3',
      ticketId: 'TKT-2024-003',
      subject: 'Account Access Problem',
      description: 'I cannot access my account dashboard. It shows an error message every time I try to log in.',
      status: 'resolved',
      priority: 'low',
      category: 'technical',
      userEmail: user?.email || 'demo@icsrt.com',
      userName: user?.name || 'Demo User',
      createdAt: '2024-07-15T16:45:00Z',
      updatedAt: '2024-07-16T11:30:00Z',
      messages: [
        {
          id: 'msg-4',
          sender: 'user',
          message: 'I cannot access my account dashboard. It shows an error message every time I try to log in.',
          timestamp: '2024-07-15T16:45:00Z'
        },
        {
          id: 'msg-5',
          sender: 'support',
          message: 'We have identified the issue and fixed it. Please try logging in again and let us know if you continue to experience problems.',
          timestamp: '2024-07-16T11:30:00Z'
        }
      ]
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      
      const userEmail = user?.email || 'demo@icsrt.com';
      console.log('Tickets: Fetching tickets for user:', userEmail);

      try {
        const ticketsData = await api.get(`/api/user/tickets?userEmail=${encodeURIComponent(userEmail)}`);
        if (Array.isArray(ticketsData) && ticketsData.length > 0) {
          setTickets(ticketsData);
          console.log('Tickets: Real data loaded:', ticketsData.length);
        } else {
          console.log('Tickets: Using demo data - no real tickets found');
        }
      } catch (error) {
        console.log('Tickets: Fetch failed, using demo data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user?.email]);

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    switch (statusLower) {
      case 'open':
      case 'new':
        return '🆕';
      case 'in-progress':
      case 'working':
        return '🔄';
      case 'resolved':
      case 'completed':
        return '✅';
      case 'closed':
        return '🔒';
      case 'on-hold':
      case 'waiting':
        return '⏸️';
      default:
        return '🎫';
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    switch (statusLower) {
      case 'open':
      case 'new':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'in-progress':
      case 'working':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'resolved':
      case 'completed':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      case 'closed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'on-hold':
      case 'waiting':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
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

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    setNewMessage('');
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setShowModal(false);
    setNewMessage('');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage || !selectedTicket) return;
    
    setSendingMessage(true);
    
    try {
      // Simulate API call - in real implementation, send to backend
      const messageObj = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Update the ticket in state
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === selectedTicket._id 
            ? { 
                ...ticket, 
                messages: [...ticket.messages, messageObj],
                updatedAt: new Date().toISOString()
              }
            : ticket
        )
      );
      
      // Update selected ticket
      setSelectedTicket(prev => ({
        ...prev,
        messages: [...prev.messages, messageObj],
        updatedAt: new Date().toISOString()
      }));
      
      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status.toLowerCase() === filter.toLowerCase();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Track and manage your support requests
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
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
                    {status === 'all' ? tickets.length : tickets.filter(t => t.status.toLowerCase() === status).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                onClick={() => openTicketDetails(ticket)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl">{getStatusIcon(ticket.status)}</span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {ticket.subject}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          #{ticket.ticketId}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {ticket.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(ticket.updatedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 dark:text-gray-400">Messages:</span>
                          <span className="text-gray-900 dark:text-white">{ticket.messages?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Priority */}
                    <div className="ml-6 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{getPriorityIcon(ticket.priority)}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎫</span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't created any support tickets yet." 
                : `No ${filter.replace('-', ' ')} tickets found.`}
            </p>
            <button
              onClick={() => setFilter('all')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {filter !== 'all' ? 'View all tickets' : 'Create your first ticket'}
            </button>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getStatusIcon(selectedTicket.status)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ticket #{selectedTicket.ticketId}
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
              
              {/* Status and Priority */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getPriorityIcon(selectedTicket.priority)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority?.charAt(0).toUpperCase() + selectedTicket.priority?.slice(1).toLowerCase()} Priority
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {formatDate(selectedTicket.createdAt)}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {selectedTicket.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl p-4 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-sm">
                          {message.sender === 'user' ? selectedTicket.userName || 'You' : 'Support Team'}
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
            </div>

            {/* Message Input */}
            {selectedTicket.status.toLowerCase() !== 'closed' && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    rows="3"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sendingMessage ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTickets;
